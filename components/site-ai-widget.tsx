"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowUp, ChevronDown, MessageCircle, Mic, X } from "lucide-react"
import { getPublicEngineUrl } from "@/lib/engine-url"

type TranscriptLine = { role: "user" | "assistant"; content: string }
type LangOption = { code: string; label: string; flag?: string }
type UiMode = "voice" | "text"

const ENGINE_BASE_URL = getPublicEngineUrl()
const DEFAULT_WELCOME_MESSAGE = "Thank you for visiting today, I am your AI assistant... how can I assist you?"
const STALE_GENERIC_PATTERNS = [
  "problem you're trying to solve",
  "problem you are trying to solve",
  "understand your needs",
  "recommend the right solution",
  "move forward faster by text or voice",
  "talk to me",
]

const LANG_FLAGS: Record<string, string> = {
  en: "🇺🇸", es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪", it: "🇮🇹",
  pt: "🇧🇷", ja: "🇯🇵", ko: "🇰🇷", zh: "🇨🇳", hi: "🇮🇳", multi: "🌐",
}
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function flagEmoji(lang?: LangOption | null) {
  return lang?.flag || LANG_FLAGS[lang?.code || ""] || "🌐"
}

function normalizeAssistantCopy(text: string) {
  const value = String(text || "").trim()
  if (!value) return DEFAULT_WELCOME_MESSAGE
  const normalized = value.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ")
  if (STALE_GENERIC_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return DEFAULT_WELCOME_MESSAGE
  }
  return value
}

function asClientUuid(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed && UUID_PATTERN.test(trimmed) ? trimmed : null
}

function audioContextClass(): typeof AudioContext | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
  return w.AudioContext || w.webkitAudioContext || null
}

function float32To16kHzPcm(input: Float32Array, inputSampleRate: number): ArrayBuffer {
  const ratio = inputSampleRate / 16000
  const outLen = Math.max(1, Math.floor(input.length / ratio))
  const out = new Int16Array(outLen)
  for (let i = 0; i < outLen; i += 1) {
    const srcPos = i * ratio
    const i0 = Math.floor(srcPos)
    const i1 = Math.min(i0 + 1, input.length - 1)
    const frac = srcPos - i0
    const sample = (input[i0] ?? 0) * (1 - frac) + (input[i1] ?? 0) * frac
    out[i] = Math.min(1, Math.max(-1, sample)) * 0x7fff
  }
  return out.buffer
}

class DeepgramWidgetSession {
  private ws: WebSocket | null = null
  private micContext: AudioContext | null = null
  private ttsContext: AudioContext | null = null
  private micSource: MediaStreamAudioSourceNode | null = null
  private processor: ScriptProcessorNode | null = null
  private ttsGain: GainNode | null = null
  private pendingSettingsJson: string | null = null
  private settingsApplied = false
  private pendingInjects: string[] = []
  private sources = new Set<AudioBufferSourceNode>()
  private playHead = 0
  private welcomeTimer: ReturnType<typeof setTimeout> | null = null

  constructor(
    private handlers: {
      onTranscript?: (line: TranscriptLine) => void
      onError?: (message: string) => void
      onClose?: () => void
    },
  ) {}

  async connect(params: {
    websocketUrl: string
    accessToken: string
    settings: Record<string, unknown>
    enableMic: boolean
  }) {
    await this.disconnect()
    const AudioContextClass = audioContextClass()
    if (!AudioContextClass) throw new Error("Web Audio API is not available")

    const socket = new WebSocket(params.websocketUrl, ["bearer", params.accessToken])
    socket.binaryType = "arraybuffer"
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("WebSocket connection timeout")), 12000)
      socket.addEventListener("open", () => { clearTimeout(timer); resolve() }, { once: true })
      socket.addEventListener("error", () => { clearTimeout(timer); reject(new Error("WebSocket connection failed")) }, { once: true })
    })

    this.ws = socket
    this.pendingSettingsJson = JSON.stringify(params.settings)
    socket.addEventListener("message", this.onMessage)
    socket.addEventListener("close", () => this.handlers.onClose?.())

    this.welcomeTimer = setTimeout(() => {
      this.welcomeTimer = null
      this.handlers.onError?.("Voice service did not send Welcome.")
    }, 12000)

    this.ttsContext = new AudioContextClass({ latencyHint: "interactive", sampleRate: 48000 })
    this.ttsGain = this.ttsContext.createGain()
    this.ttsGain.connect(this.ttsContext.destination)
    this.playHead = this.ttsContext.currentTime

    if (params.enableMic) {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          sampleRate: 16000,
        },
      })
      this.micContext = new AudioContextClass()
      await this.micContext.resume()
      this.micSource = this.micContext.createMediaStreamSource(stream)
      this.processor = this.micContext.createScriptProcessor(4096, 1, 1)
      this.micSource.connect(this.processor)
      this.processor.connect(this.micContext.destination)
      this.processor.onaudioprocess = (event) => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.settingsApplied) return
        if (this.sources.size > 0) return
        const pcm = float32To16kHzPcm(event.inputBuffer.getChannelData(0), this.micContext?.sampleRate || 48000)
        if (pcm.byteLength) this.ws.send(pcm)
      }
    }

    await this.ttsContext.resume()
  }

  private onMessage = (event: MessageEvent) => {
    if (event.data instanceof ArrayBuffer) {
      if (this.settingsApplied) this.playPcm(event.data)
      return
    }
    try {
      const data = JSON.parse(String(event.data)) as Record<string, unknown>
      if (data.type === "Welcome" && this.ws && this.pendingSettingsJson) {
        if (this.welcomeTimer) clearTimeout(this.welcomeTimer)
        this.welcomeTimer = null
        this.ws.send(this.pendingSettingsJson)
        this.pendingSettingsJson = null
      }
      if (data.type === "SettingsApplied") {
        this.settingsApplied = true
        this.flushInjects()
      }
      if (data.type === "UserStartedSpeaking") {
        this.stopPlayback()
      }
      if (data.type === "ConversationText" && (data.role === "user" || data.role === "assistant")) {
        this.handlers.onTranscript?.({
          role: data.role as "user" | "assistant",
          content: String(data.content ?? ""),
        })
      }
      if (data.type === "Error") {
        this.handlers.onError?.(typeof data.message === "string" ? data.message : JSON.stringify(data))
      }
    } catch {
      /* ignore non-json messages */
    }
  }

  private playPcm(buffer: ArrayBuffer) {
    if (!this.ttsContext || !this.ttsGain) return
    const samples = new Int16Array(buffer)
    if (!samples.length) return
    const audioBuffer = this.ttsContext.createBuffer(1, samples.length, 24000)
    const channel = audioBuffer.getChannelData(0)
    for (let i = 0; i < samples.length; i += 1) channel[i] = samples[i]! / 32768
    const source = this.ttsContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.ttsGain)
    if (this.playHead < this.ttsContext.currentTime) this.playHead = this.ttsContext.currentTime
    source.addEventListener("ended", () => this.sources.delete(source))
    source.start(this.playHead)
    this.playHead += audioBuffer.duration
    this.sources.add(source)
  }

  private stopPlayback() {
    this.sources.forEach((source) => {
      try { source.stop() } catch {}
    })
    this.sources.clear()
    if (this.ttsContext) this.playHead = this.ttsContext.currentTime
  }

  private flushInjects() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.settingsApplied) return
    for (const text of this.pendingInjects) this.ws.send(JSON.stringify({ type: "InjectUserMessage", content: text }))
    this.pendingInjects = []
  }

  injectUserMessage(text: string) {
    const clean = text.trim()
    if (!clean || !this.ws || this.ws.readyState !== WebSocket.OPEN) return
    if (!this.settingsApplied) {
      this.pendingInjects.push(clean)
      return
    }
    this.ws.send(JSON.stringify({ type: "InjectUserMessage", content: clean }))
  }

  async disconnect() {
    if (this.welcomeTimer) clearTimeout(this.welcomeTimer)
    this.welcomeTimer = null
    this.pendingSettingsJson = null
    this.settingsApplied = false
    this.pendingInjects = []
    if (this.ws) {
      try {
        this.ws.removeEventListener("message", this.onMessage)
        this.ws.close(1000, "client disconnect")
      } catch {}
      this.ws = null
    }
    this.stopPlayback()
    try { this.processor?.disconnect() } catch {}
    try { this.micSource?.disconnect() } catch {}
    this.micSource?.mediaStream.getTracks().forEach((track) => track.stop())
    try { await this.micContext?.close() } catch {}
    try { await this.ttsContext?.close() } catch {}
    this.processor = null
    this.micSource = null
    this.micContext = null
    this.ttsContext = null
    this.ttsGain = null
  }
}

type SiteAiWidgetProps = {
  agentId?: string
  accentColor?: string
  defaultOpen?: boolean
  embed?: boolean
}

export function SiteAiWidget({
  agentId,
  accentColor = "#4f46e5",
  defaultOpen = false,
  embed = false,
}: SiteAiWidgetProps) {
  const safeAreaInsetBottom = "env(safe-area-inset-bottom, 0px)"
  const launcherBottom = embed ? `max(12px, calc(${safeAreaInsetBottom} + 8px))` : "24px"
  const launcherRight = embed ? "12px" : "24px"
  const panelBottom = embed ? `calc(${launcherBottom} + 64px + 10px)` : "96px"
  const panelRight = embed ? "12px" : "24px"
  const panelWidth = embed ? "min(calc(100vw - 24px), 20rem)" : "min(calc(100vw - 2rem), 28rem)"
  const panelMaxHeight = embed ? "min(calc(100dvh - 24px - 64px - 10px), 28rem)" : "min(85vh, 36rem)"
  const [panelOpen, setPanelOpen] = useState(defaultOpen)
  const [mode, setMode] = useState<UiMode>("voice")
  const [clientIdOverride, setClientIdOverride] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [sessionOn, setSessionOn] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [lines, setLines] = useState<TranscriptLine[]>([])
  const [textDraft, setTextDraft] = useState("")
  const [langs, setLangs] = useState<LangOption[]>([])
  const [langOpen, setLangOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState<LangOption | null>(null)
  const sessionRef = useRef<DeepgramWidgetSession | null>(null)

  const stopSession = useCallback(async () => {
    await sessionRef.current?.disconnect()
    sessionRef.current = null
    setSessionOn(false)
    setConnecting(false)
  }, [])

  useEffect(() => {
    return () => { void stopSession() }
  }, [stopSession])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const response = await fetch(`${ENGINE_BASE_URL}/api/chat/languages`)
        if (!response.ok) return
        const data = await response.json() as { languages?: LangOption[] }
        const list = data.languages || []
        if (cancelled) return
        setLangs(list)
        setSelectedLang(list.find((lang) => lang.code === "en") || list[0] || null)
      } catch {
        /* language list is optional */
      }
    })()
    return () => { cancelled = true }
  }, [])

  const bootstrap = useCallback(async () => {
    const body: { client_id?: string; language: string } = {
      language: selectedLang?.code || "en",
    }
    const clientId =
      asClientUuid(clientIdOverride) ||
      asClientUuid(agentId) ||
      asClientUuid(process.env.NEXT_PUBLIC_LANDING_PAGE_CLIENT_ID)
    if (clientId) body.client_id = clientId

    const response = await fetch(`${ENGINE_BASE_URL}/api/chat/voice-agent/bootstrap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const raw = await response.text()
      let parsedMessage = ""
      try {
        const parsed = JSON.parse(raw) as { detail?: string }
        parsedMessage = parsed.detail || ""
      } catch {
        parsedMessage = ""
      }
      throw new Error(parsedMessage || raw || `Widget bootstrap failed (${response.status})`)
    }
    return await response.json() as {
      websocket_url: string
      access_token: string
      settings: Record<string, unknown>
    }
  }, [agentId, clientIdOverride, selectedLang?.code])

  const startSession = useCallback(async (withMic: boolean) => {
    setPanelOpen(true)
    setConnecting(true)
    setErrorMsg("")
    try {
      await stopSession()
      const payload = await bootstrap()
      const session = new DeepgramWidgetSession({
        onTranscript: (line) => {
          setLines((previous) => [
            ...previous,
            line.role === "assistant"
              ? { ...line, content: normalizeAssistantCopy(line.content) }
              : line,
          ])
        },
        onError: (message) => setErrorMsg(message),
        onClose: () => setSessionOn(false),
      })
      sessionRef.current = session
      await session.connect({
        websocketUrl: payload.websocket_url,
        accessToken: payload.access_token,
        settings: payload.settings,
        enableMic: withMic,
      })
      setSessionOn(true)
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Failed to connect")
      await stopSession()
    } finally {
      setConnecting(false)
    }
  }, [bootstrap, stopSession])

  const openMode = useCallback((nextMode: UiMode) => {
    setMode(nextMode)
    setPanelOpen(true)
    if (nextMode === "voice") void startSession(true)
  }, [startSession])

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: string; clientId?: string | null }>).detail
      setClientIdOverride(detail?.clientId?.trim() || null)
      if (detail?.mode === "select") {
        setMode("text")
        setPanelOpen(true)
        return
      }

      openMode(detail?.mode === "text" ? "text" : "voice")
    }
    window.addEventListener("omniweb:assistant-open", handler)
    return () => window.removeEventListener("omniweb:assistant-open", handler)
  }, [openMode])

  const sendText = useCallback(async () => {
    const text = textDraft.trim()
    if (!text) return
    setMode("text")
    setPanelOpen(true)
    setLines((previous) => [...previous, { role: "user", content: text }])
    if (!sessionRef.current) await startSession(false)
    sessionRef.current?.injectUserMessage(text)
    setTextDraft("")
  }, [textDraft, startSession])

  const subtitle = connecting ? "Connecting..." : sessionOn ? (mode === "voice" ? "Listening..." : "Type a message") : "Ready to help"

  return (
    <>
      <button
        type="button"
        onClick={() => setPanelOpen((open) => !open)}
        className="fixed z-[9999] flex h-14 items-center gap-3 rounded-full bg-gradient-to-r from-indigo-700 to-violet-600 px-5 text-white shadow-[0_14px_34px_rgba(79,70,229,0.45)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        style={{
          bottom: launcherBottom,
          right: launcherRight,
          background: `linear-gradient(135deg, ${accentColor}, #6d28d9)`,
        }}
        aria-label={panelOpen ? "Close Omniweb AI" : "Ask Omniweb AI"}
      >
        <span
          className="h-8 w-8 rounded-full"
          style={{
            background: "conic-gradient(from 210deg at 50% 50%, #38bdf8, #f8fafc, #4338ca, #38bdf8)",
            boxShadow: "inset 0 1px 6px rgba(255,255,255,0.45)",
          }}
        />
        <span className="text-lg font-bold">Ask AI</span>
      </button>

      {panelOpen ? (
        <div
          className="fixed z-[9998] flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b1220] text-slate-100 shadow-2xl"
          style={{
            bottom: panelBottom,
            right: panelRight,
            width: panelWidth,
            maxHeight: panelMaxHeight,
          }}
        >
          <header className="flex items-start gap-3 border-b border-white/10 px-4 py-4">
            <div
              className="h-12 w-12 shrink-0 rounded-full"
              style={{
                background: "conic-gradient(from 210deg at 50% 50%, #38bdf8, #f8fafc, #0284c7, #38bdf8)",
                boxShadow: "inset 0 1px 6px rgba(255,255,255,0.4)",
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold tracking-tight">Omniweb AI</p>
              <p className="truncate text-sm text-slate-400">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => { setPanelOpen(false); void stopSession() }}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {errorMsg ? (
            <div className="mx-4 mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-red-500/30 bg-red-950/80 px-4 py-3 text-sm text-red-200">
              <span className="min-w-0 flex-1 break-words">{errorMsg}</span>
              <button type="button" className="text-red-300 underline hover:text-red-100" onClick={() => void startSession(mode === "voice")}>
                Retry
              </button>
            </div>
          ) : null}

          <div className={`${embed ? "min-h-0" : "min-h-[17rem]"} flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm`}>
            {lines.length === 0 && !errorMsg ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="max-w-xs text-base font-semibold text-white">{DEFAULT_WELCOME_MESSAGE}</p>
                <p className="mt-2 text-xs text-slate-500">Start voice or type below.</p>
              </div>
            ) : null}
            {lines.map((line, index) => (
              <div
                key={`${index}-${line.role}`}
                className={`rounded-2xl px-4 py-3 ${
                  line.role === "user"
                    ? "ml-8 bg-indigo-600 text-white"
                    : "mr-8 border border-cyan-500/15 bg-cyan-950/40 text-cyan-50"
                }`}
              >
                <p className="mb-1 text-[10px] uppercase tracking-wide opacity-60">{line.role === "user" ? "You" : "Assistant"}</p>
                <p className="whitespace-pre-wrap break-words">{line.content}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 px-4 py-3">
            <p className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Language</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((open) => !open)}
                disabled={sessionOn}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-left text-sm disabled:opacity-50"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span>{flagEmoji(selectedLang)}</span>
                  <span className="truncate">{selectedLang?.label || "English"}</span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
              {langOpen && langs.length > 0 ? (
                <ul className="absolute bottom-full z-10 mb-1 max-h-48 w-full overflow-auto rounded-xl border border-white/10 bg-[#0f172a] py-1 text-sm shadow-xl">
                  {langs.map((lang) => (
                    <li key={lang.code}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-white/5"
                        onClick={() => { setSelectedLang(lang); setLangOpen(false) }}
                      >
                        <span>{flagEmoji(lang)}</span>
                        <span className="truncate">{lang.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 px-4 pb-3">
            <button
              type="button"
              onClick={() => { setMode("voice"); void startSession(true) }}
              disabled={connecting}
              className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition ${
                mode === "voice" && sessionOn ? "bg-cyan-500 text-slate-950" : "bg-cyan-600 text-white hover:bg-cyan-500"
              } disabled:opacity-60`}
            >
              <Mic className="h-4 w-4" />
              Voice call
            </button>
            <button
              type="button"
              onClick={() => { setMode("text"); setPanelOpen(true) }}
              disabled={connecting}
              className={`flex items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 text-sm font-semibold transition ${
                mode === "text" ? "bg-slate-800 text-white" : "bg-slate-900/60 text-slate-300 hover:bg-slate-800"
              } disabled:opacity-60`}
            >
              <MessageCircle className="h-4 w-4" />
              Text chat
            </button>
          </div>

          <div className="flex items-end gap-2 border-t border-white/10 px-4 py-4">
            <textarea
              rows={1}
              value={textDraft}
              onChange={(event) => setTextDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  void sendText()
                }
              }}
              placeholder="Start voice or type a message..."
              className="min-h-11 flex-1 resize-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
            <button
              type="button"
              onClick={() => void sendText()}
              disabled={connecting || !textDraft.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40"
              aria-label="Send"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
