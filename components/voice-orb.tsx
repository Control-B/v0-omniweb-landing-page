"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Conversation } from "@elevenlabs/client"
import type { DisconnectionDetails } from "@elevenlabs/client"

const AGENT_ID = "agent_4601kny4fvsgfjz8mbqhevyp1k9q"
const ENGINE_BASE_URL = "https://omniweb-engine-rs6fr.ondigitalocean.app"

type Message = { role: "user" | "agent"; text: string; isWelcome?: boolean }
type ConvStatus = "disconnected" | "connecting" | "connected"
type ConvMode = "listening" | "speaking"
type ChatMode = "voice" | "text"
type LanguageOption = {
  code: string
  label: string
  voice_id?: string | null
  configured?: boolean
  default?: boolean
  rtl?: boolean
}

const LANGUAGE_FLAGS: Record<string, string> = {
  ar: "🇸🇦", de: "🇩🇪", en: "🇺🇸", es: "🇪🇸", fr: "🇫🇷", hi: "🇮🇳",
  it: "🇮🇹", ja: "🇯🇵", ko: "🇰🇷", nl: "🇳🇱", pl: "🇵🇱", pt: "🇧🇷",
  ru: "🇷🇺", tr: "🇹🇷", uk: "🇺🇦", zh: "🇨🇳",
}

const FALLBACK_LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "ar", label: "Arabic", rtl: true },
  { code: "de", label: "German" },
  { code: "en", label: "English", default: true },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "hi", label: "Hindi" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "nl", label: "Dutch" },
  { code: "pl", label: "Polish" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "tr", label: "Turkish" },
  { code: "uk", label: "Ukrainian" },
  { code: "zh", label: "Chinese" },
]

export function VoiceOrb() {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState<ConvStatus>("disconnected")
  const [mode, setMode] = useState<ConvMode>("listening")
  const [messages, setMessages] = useState<Message[]>([])
  const [textInput, setTextInput] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatMode, setChatMode] = useState<ChatMode>("voice")
  const [languageOptions, setLanguageOptions] = useState<LanguageOption[]>(FALLBACK_LANGUAGE_OPTIONS)
  const [selectedLanguage, setSelectedLanguage] = useState("en")

  const convRef = useRef<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const chatBufferRef = useRef<string>("")
  const pendingTextRef = useRef<string | null>(null)
  const chatModeRef = useRef<ChatMode>("voice")
  const expandedRef = useRef(false)
  const healthTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptRef = useRef(0)
  const MAX_RECONNECT_ATTEMPTS = 3

  // ── Conversation-transcript tracking ──
  // We maintain a clean transcript that mirrors the real conversation:
  //   1. Agent sends welcome (first_message) → shown immediately as welcome
  //   2. User speaks → shown when transcript finalised
  //   3. Agent responds → shown only AFTER the user message is committed
  //
  // ElevenLabs often fires onAgentChatResponsePart (agent reply) BEFORE
  // onMessage (user transcript), creating a race where the agent's reply
  // appears above the user's message.  We solve this by tracking each
  // agent response's event_id and deduplicating.
  const hasUserSpokenRef = useRef(false)
  const welcomeReceivedRef = useRef(false)
  // Track the last event_id we committed so we never double-add the same response
  const lastAgentEventIdRef = useRef<number>(-1)
  // On mobile we default to text mode to avoid WebSocket microphone issues
  const [isMobile, setIsMobile] = useState(false)


  const selectedLanguageOption = languageOptions.find(option => option.code === selectedLanguage) ?? languageOptions[0]

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(`${ENGINE_BASE_URL}/api/chat/languages`)
        if (!response.ok) return

        const payload = await response.json() as {
          default_language?: string
          languages?: LanguageOption[]
        }

        const languages = payload.languages
        if (languages?.length) {
          setLanguageOptions(languages)
          setSelectedLanguage(current => {
            if (languages.some(option => option.code === current)) {
              return current
            }
            return payload.default_language ?? languages[0].code
          })
        }
      } catch (fetchError) {
        console.error("[VoiceOrb] Failed to load language options", fetchError)
      }
    })()
  }, [])

  // Detect mobile devices — used to default to text mode
  useEffect(() => {
    if (typeof window === "undefined") return
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 640
    setIsMobile(mobile)
  }, [])

  // Keep ref in sync with state so callbacks always see the latest value
  useEffect(() => { chatModeRef.current = chatMode }, [chatMode])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const handleOpen = useCallback((openMode?: "voice" | "text") => {
    // On mobile, default to text mode (more reliable than WebSocket voice)
    const targetMode = openMode ?? (isMobile ? "text" : "voice")
    setExpanded(true)
    setChatMode(targetMode)
    setError(null)
  }, [isMobile])

  // Listen for assistant open events from the landing page CTAs
  useEffect(() => {
    if (typeof window === "undefined") return
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: string }>).detail
      const openMode = detail?.mode === "text" ? "text" as const : "voice" as const
      handleOpen(openMode)
    }
    window.addEventListener("omniweb:assistant-open", handler)
    return () => window.removeEventListener("omniweb:assistant-open", handler)
  }, [handleOpen])

  /* ── shared session options (everything except textOnly) ── */
  const sessionCallbacks = useCallback(() => ({
    agentId: AGENT_ID,
    connectionType: "websocket" as const,
    overrides: {
      agent: {
          language: selectedLanguage as any,
      },
      ...(selectedLanguageOption?.voice_id
        ? {
            tts: {
              voiceId: selectedLanguageOption.voice_id,
            },
          }
        : {}),
    },
    onConnect: () => {
      setStatus("connected")
      // Send any pending text message once connected
      const pending = pendingTextRef.current
      if (pending) {
        pendingTextRef.current = null
        // Small delay to ensure socket is fully ready
        setTimeout(() => { convRef.current?.sendUserMessage(pending) }, 100)
      }
    },
    onDisconnect: (_d: DisconnectionDetails) => {
      setStatus("disconnected")
      convRef.current = null
      setIsMuted(false)
    },
    onMessage: (p: any) => {
      // Handle user transcripts only.  Agent text is handled exclusively
      // by onAgentChatResponsePart so we never double-add agent bubbles.
      if (p.role === "agent") return

      hasUserSpokenRef.current = true
      setMessages(prev => {
        // If the last message is already from the user, update it in place
        // (ElevenLabs sends progressive transcript refinements).
        const last = prev[prev.length - 1]
        if (last?.role === "user") {
          return [...prev.slice(0, -1), { role: "user", text: p.message }]
        }
        return [...prev, { role: "user" as const, text: p.message }]
      })
    },

    onAgentChatResponsePart: (part: { text: string; type: "start" | "delta" | "stop"; event_id: number }) => {
      // ── Welcome message (first_message before user has spoken) ──
      const isFirstAgentMsg = !hasUserSpokenRef.current && !welcomeReceivedRef.current

      // ── Deduplication: skip if we already committed this event_id ──
      if (part.event_id === lastAgentEventIdRef.current && part.type === "start") {
        // Same event_id starting again — this is a duplicate delivery, skip it
        return
      }

      if (part.type === "start") {
        lastAgentEventIdRef.current = part.event_id
        chatBufferRef.current = part.text

        if (isFirstAgentMsg) {
          welcomeReceivedRef.current = true
          setMessages(prev => [...prev, { role: "agent", text: part.text, isWelcome: true }])
        } else {
          setMessages(prev => {
            // Prevent adding a new agent bubble if the last message is already
            // an agent bubble for the current event (progressive refinement).
            const last = prev[prev.length - 1]
            if (last?.role === "agent" && !last.isWelcome) {
              return [...prev.slice(0, -1), { role: "agent", text: part.text }]
            }
            return [...prev, { role: "agent", text: part.text }]
          })
        }
      } else if (part.type === "delta") {
        chatBufferRef.current += part.text
        const fullText = chatBufferRef.current
        setMessages(prev => {
          const lastIdx = prev.length - 1
          if (lastIdx >= 0 && prev[lastIdx].role === "agent") {
            const w = prev[lastIdx].isWelcome
            return [...prev.slice(0, lastIdx), { role: "agent", text: fullText, ...(w ? { isWelcome: true } : {}) }]
          }
          return [...prev, { role: "agent", text: fullText }]
        })
      } else if (part.type === "stop") {
        if (part.text) chatBufferRef.current += part.text
        const finalText = chatBufferRef.current
        setMessages(prev => {
          const lastIdx = prev.length - 1
          if (lastIdx >= 0 && prev[lastIdx].role === "agent") {
            const w = prev[lastIdx].isWelcome
            return [...prev.slice(0, lastIdx), { role: "agent", text: finalText, ...(w ? { isWelcome: true } : {}) }]
          }
          return prev
        })
        chatBufferRef.current = ""
      }
    },
    onError: (msg: string) => { console.error("[VoiceOrb]", msg); setError(msg) },
    onModeChange: ({ mode: m }: { mode: ConvMode }) => setMode(m),
    onStatusChange: ({ status: s }: { status: string }) => {
      if (s === "connected") setStatus("connected")
      else if (s === "connecting") setStatus("connecting")
      else setStatus("disconnected")
    },
  }), [selectedLanguage, selectedLanguageOption?.voice_id])

  const startVoiceSession = useCallback(async () => {
    if (convRef.current) return
    setStatus("connecting")
    setError(null)

    // Connection timeout — if not connected within 12s, abort and show error
    connectTimeoutRef.current = setTimeout(() => {
      if (status === "connecting") {
        setError("Connection timed out. Tap to retry.")
        setStatus("disconnected")
        try { convRef.current?.endSession() } catch {}
        convRef.current = null
      }
    }, 12000)

    try {
      const conv = await Conversation.startSession(sessionCallbacks())
      convRef.current = conv
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current)
        connectTimeoutRef.current = null
      }
      reconnectAttemptRef.current = 0
    } catch (e: any) {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current)
        connectTimeoutRef.current = null
      }
      setError(e?.message ?? "Connection failed")
      setStatus("disconnected")
    }
  }, [sessionCallbacks, status])

  // Auto-start voice when panel opens in voice mode
  useEffect(() => {
    const justOpened = expanded && !expandedRef.current
    expandedRef.current = expanded
    if (justOpened && chatMode === "voice" && !convRef.current) {
      void startVoiceSession()
    }
  }, [expanded, chatMode, startVoiceSession])

  const startTextSession = useCallback(async () => {
    if (convRef.current) return
    setStatus("connecting")
    setError(null)

    connectTimeoutRef.current = setTimeout(() => {
      if (status === "connecting") {
        setError("Connection timed out. Tap to retry.")
        setStatus("disconnected")
        try { convRef.current?.endSession() } catch {}
        convRef.current = null
        pendingTextRef.current = null
      }
    }, 12000)

    try {
      // textOnly: true → uses TextConversation → NO microphone access needed
      const conv = await Conversation.startSession({
        ...sessionCallbacks(),
        textOnly: true,
      })
      convRef.current = conv
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current)
        connectTimeoutRef.current = null
      }
      reconnectAttemptRef.current = 0
    } catch (e: any) {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current)
        connectTimeoutRef.current = null
      }
      setError(e?.message ?? "Connection failed")
      setStatus("disconnected")
      pendingTextRef.current = null
    }
  }, [sessionCallbacks, status])

  const clearHealthTimer = useCallback(() => {
    if (healthTimerRef.current) {
      clearInterval(healthTimerRef.current)
      healthTimerRef.current = null
    }
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current)
      connectTimeoutRef.current = null
    }
  }, [])

  const endConversation = useCallback(async () => {
    clearHealthTimer()
    try { await convRef.current?.endSession() } catch {}
    convRef.current = null
    setStatus("disconnected")
    setIsMuted(false)
    pendingTextRef.current = null
    reconnectAttemptRef.current = 0
  }, [clearHealthTimer])

  const toggleMute = useCallback(() => {
    if (!convRef.current) return
    const next = !isMuted
    convRef.current.setMicMuted(next)
    setIsMuted(next)
  }, [isMuted])

  const sendText = useCallback(async () => {
    const t = textInput.trim()
    if (!t) return
    setTextInput("")
    hasUserSpokenRef.current = true
    setMessages(prev => [...prev, { role: "user" as const, text: t }])

    // Already connected — send immediately
    if (convRef.current) {
      convRef.current.sendUserMessage(t)
      return
    }
    // Not connected yet — queue message and connect (text mode, no mic)
    pendingTextRef.current = t
    await startTextSession()
  }, [textInput, startTextSession])

  const handleClose = useCallback(async () => {
    await endConversation()
    setExpanded(false)
    setMessages([])
    setError(null)
    setChatMode("voice")
    chatBufferRef.current = ""
    hasUserSpokenRef.current = false
    welcomeReceivedRef.current = false
    lastAgentEventIdRef.current = -1
  }, [endConversation])

  // Auto-reconnect on unexpected disconnect (mobile network drops)
  useEffect(() => {
    if (status === "disconnected" && expanded && !convRef.current && messages.length > 0) {
      // Was in a conversation but got disconnected unexpectedly
      if (reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptRef.current += 1
        const delay = reconnectAttemptRef.current * 2000 // 2s, 4s, 6s backoff
        const timer = setTimeout(() => {
          if (chatModeRef.current === "voice") {
            void startVoiceSession()
          } else {
            void startTextSession()
          }
        }, delay)
        return () => clearTimeout(timer)
      } else {
        setError("Connection lost. Tap to reconnect.")
      }
    }
  }, [status, expanded, messages.length, startVoiceSession, startTextSession])

  // Cleanup on unmount
  useEffect(() => {
    return () => { clearHealthTimer() }
  }, [clearHealthTimer])

  const selectVoice = useCallback(async () => {
    // If switching from text session, end it first
    if (convRef.current && chatModeRef.current === "text") {
      await endConversation()
    }
    setChatMode("voice")
    if (!convRef.current) startVoiceSession()
  }, [startVoiceSession, endConversation])

  const selectText = useCallback(async () => {
    // If switching from voice session, end it first
    if (convRef.current && chatModeRef.current === "voice") {
      await endConversation()
    }
    setChatMode("text")
    // Don't auto-connect — connect when user sends first message
  }, [endConversation])

  const changeLanguage = useCallback(async (languageCode: string) => {
    if (languageCode === selectedLanguage) return

    if (convRef.current) {
      await endConversation()
    }

    setSelectedLanguage(languageCode)
    setError(null)
  }, [endConversation, selectedLanguage])

  const isActive = status === "connected"
  const isBusy = status === "connecting"

  const CONIC = "conic-gradient(from 0deg, #0a4f8c, #2792DC, #9ce6e6, #ffffff, #2792DC, #0a4f8c, #9ce6e6, #ffffff, #0a4f8c)"
  const CONIC_SM = "conic-gradient(from 0deg, #0a4f8c, #2792DC, #9ce6e6, #fff, #2792DC, #0a4f8c)"

  /* ════════════════════ SHINY METALLIC DISK (collapsed) ════════════════════ */
  if (!expanded) {
    return (
      <>
        <style jsx global>{`
          @keyframes orb-spin   { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
          @keyframes orb-pulse  { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.08); opacity: .85 } }
          @keyframes orb-ring   { 0% { box-shadow: 0 0 0 0 rgba(39,146,220,.5) } 100% { box-shadow: 0 0 0 18px rgba(39,146,220,0) } }
          @keyframes orb-glow   { 0%,100% { filter: brightness(1) } 50% { filter: brightness(1.2) } }
        `}</style>

        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[10000] group cursor-pointer"
          style={{ outline: "none", border: "none", background: "none", padding: 0 }}
          aria-label="Open voice assistant"
        >
          {isActive && (
            <div className="absolute inset-[-6px] rounded-full" style={{ animation: "orb-ring 2s ease-out infinite" }} />
          )}

          <div
            className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-110"
            style={{
              animation: isActive ? "orb-glow 2s ease-in-out infinite" : isBusy ? "orb-pulse 1.5s ease-in-out infinite" : undefined,
            }}
          >
            <div className="absolute inset-0 rounded-full" style={{ background: CONIC, animation: isActive ? "orb-spin 6s linear infinite" : "orb-spin 20s linear infinite" }} />
            <div className="absolute inset-[3px] rounded-full" style={{ background: "radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 50%), radial-gradient(ellipse at 65% 70%, rgba(39,146,220,0.3) 0%, transparent 60%)" }} />
            <div className="absolute inset-[2px] rounded-full" style={{ background: "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)" }} />
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.15)" }} />
          </div>

          {isActive && <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm" />}
          {isBusy && <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white shadow-sm animate-pulse" />}
        </button>
      </>
    )
  }

  /* ════════════════════ EXPANDED CHAT PANEL ════════════════════ */
  return (
    <>
      <style jsx global>{`
        @keyframes orb-spin  { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes orb-ring  { 0% { box-shadow: 0 0 0 0 rgba(39,146,220,.5) } 100% { box-shadow: 0 0 0 14px rgba(39,146,220,0) } }
        @keyframes orb-glow  { 0%,100% { filter: brightness(1) } 50% { filter: brightness(1.15) } }
        @keyframes panel-in  { from { opacity:0; transform: translateY(16px) scale(0.95) } to { opacity:1; transform: translateY(0) scale(1) } }
      `}</style>

      {/* Mobile backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm sm:hidden" onClick={handleClose} />

      <div
        className="fixed z-[9999] flex flex-col overflow-hidden bg-slate-900 rounded-2xl shadow-2xl shadow-violet-500/10 border border-white/10 inset-2 top-16 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[560px]"
        style={{ animation: "panel-in .25s ease-out" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 rounded-full" style={{ background: CONIC, animation: isActive ? "orb-spin 6s linear infinite" : "orb-spin 20s linear infinite" }} />
              <div className="absolute inset-[2px] rounded-full" style={{ background: "radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.5) 0%, transparent 50%)" }} />
              <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 1px rgba(0,0,0,0.1)" }} />
              {isActive && <div className="absolute -top-px -right-px w-2.5 h-2.5 bg-green-400 rounded-full border-[1.5px] border-white" />}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Omniweb AI</div>
              <div className="text-xs text-slate-400">
                {isActive
                  ? chatMode === "voice"
                    ? mode === "speaking" ? "AI is speaking…" : "Listening…"
                    : "Text mode"
                  : isBusy ? "Connecting…" : "Ready to talk"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {isActive && chatMode === "voice" && (
              <button
                onClick={toggleMute}
                className={`p-2 rounded-full transition-colors ${isMuted ? "bg-red-500/20 text-red-400" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  {isMuted && <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />}
                </svg>
              </button>
            )}
            <button onClick={handleClose} className="p-2 rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors" title="Close">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
          {error && (
            <div className="bg-red-500/10 text-red-400 text-xs rounded-xl px-3 py-2 border border-red-500/20">
              {error}
              <button
                onClick={() => {
                  setError(null)
                  reconnectAttemptRef.current = 0
                  if (chatModeRef.current === "voice") {
                    void startVoiceSession()
                  } else {
                    void startTextSession()
                  }
                }}
                className="ml-2 underline hover:text-red-300 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {messages.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center pb-8">
              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-5 shadow-xl" style={{ animation: isActive ? "orb-glow 2s ease-in-out infinite" : undefined }}>
                <div className="absolute inset-0 rounded-full" style={{ background: CONIC, animation: isActive ? "orb-spin 6s linear infinite" : "orb-spin 20s linear infinite" }} />
                <div className="absolute inset-[3px] rounded-full" style={{ background: "radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.5) 0%, transparent 50%)" }} />
                <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 1px 3px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.12)" }} />
              </div>
              <p className="text-[15px] font-semibold text-white">How can I help you?</p>
              <p className="text-xs text-slate-500 mt-1.5 max-w-[220px]">Tap the orb or type below to get started</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "agent" && (
                <div className="w-6 h-6 rounded-full overflow-hidden mr-2 mt-1 flex-shrink-0">
                  <div className="w-full h-full" style={{ background: CONIC_SM }} />
                </div>
              )}
              <div className={[
                "max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl rounded-br-sm shadow-lg shadow-violet-500/20"
                  : m.isWelcome
                    ? "bg-gradient-to-br from-cyan-900/40 to-slate-800/60 text-cyan-100 rounded-2xl rounded-bl-sm shadow-sm border border-cyan-500/20 backdrop-blur-sm italic"
                    : "bg-white/[0.07] text-slate-200 rounded-2xl rounded-bl-sm shadow-sm border border-white/10 backdrop-blur-sm",
                ].join(" ")}>
                {m.isWelcome && <span className="text-[10px] uppercase tracking-wider text-cyan-400/70 font-medium block mb-1">Welcome</span>}
                {m.text}
              </div>
            </div>
          ))}          {isActive && mode === "speaking" && chatMode === "voice" && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full overflow-hidden mr-2 mt-1 flex-shrink-0">
                <div className="w-full h-full" style={{ background: CONIC_SM, animation: "orb-spin 4s linear infinite" }} />
              </div>
              <div className="bg-white/[0.07] rounded-2xl rounded-bl-sm shadow-sm border border-white/10 backdrop-blur-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom controls ── */}
        <div className="border-t border-white/10 bg-slate-900">
          <div className="px-4 pt-3 pb-1">
            <label className="block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 mb-1.5">
              Language
            </label>
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => { void changeLanguage(e.target.value) }}
                className="w-full appearance-none bg-white/[0.06] border border-white/10 rounded-xl pl-10 pr-8 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400/40 transition-all cursor-pointer"
                dir={selectedLanguageOption?.rtl ? "rtl" : "ltr"}
              >
                {languageOptions.map((option) => (
                  <option key={option.code} value={option.code} className="bg-slate-800 text-slate-200">
                    {option.label}{option.default ? " (default)" : ""}
                  </option>
                ))}
              </select>
              {/* Flag overlay on the left */}
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg leading-none">
                {LANGUAGE_FLAGS[selectedLanguage] ?? "🌐"}
              </span>
              {/* Chevron on the right */}
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Mode selector / call controls */}
          <div className="flex items-center justify-center py-3 border-b border-white/5 gap-2 px-4">
            {!isActive && !isBusy ? (
              <>
                <button
                  onClick={selectVoice}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-full px-4 py-2.5 transition-colors ${
                    chatMode === "voice"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                      : "bg-white/[0.06] text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/10"
                  }`}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                  Voice call
                </button>
                  <button
                    onClick={selectText}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium rounded-full px-4 py-2.5 transition-colors ${
                      chatMode === "text"
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
                        : "bg-white/[0.06] text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/10"
                    }`}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    Text chat
                  </button>
              </>
            ) : isBusy ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-2.5">
                <div className="w-4 h-4 border-2 border-slate-700 border-t-violet-400 rounded-full animate-spin" /> Connecting…
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                {chatMode === "voice" && (
                  <button onClick={endConversation} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-medium rounded-full px-5 py-2.5 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/20 transition-all">End call</button>
                )}
                {chatMode === "text" && (
                  <button
                    onClick={async () => { await endConversation(); setChatMode("voice") }}
                    className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-400 transition-colors px-2 py-1"
                  >
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                    Switch to voice
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Text input */}
          <div className="flex items-center gap-2 p-3 bg-slate-900">
            <input
              value={textInput}
              onChange={(e) => { setTextInput(e.target.value); convRef.current?.sendUserActivity?.() }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText() } }}
              placeholder={isActive || chatMode === "text" ? "Type a message…" : "Start voice or type a message…"}
              disabled={chatMode === "voice" && !isActive}
              className="flex-1 bg-white/[0.06] border border-white/10 rounded-full px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400/40 disabled:opacity-30 transition-all"
            />
            <button
              onClick={sendText}
              disabled={(chatMode === "voice" && !isActive) || !textInput.trim()}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center hover:from-violet-500 hover:to-indigo-500 disabled:opacity-20 transition-all flex-shrink-0 shadow-lg shadow-violet-500/20"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
