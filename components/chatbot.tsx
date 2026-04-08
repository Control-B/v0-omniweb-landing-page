"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  buildVoiceFollowUp,
  inferAssistantAction,
  normalizeIntentText,
  type AssistantAction,
} from "@/lib/assistant-navigation"
import { ASSISTANT_OPEN_EVENT, type AssistantOpenMode } from "@/lib/assistant-events"
import { FloatingAIAssistantButton } from "@/components/floating-ai-assistant-button"
import {
  Mic,
  MicOff,
  MessageSquare,
  X,
  Send,
  Phone,
  PhoneOff,
  Loader2,
  Bot,
  User,
  AlertCircle,
  ChevronDown,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  actions?: AssistantAction[]
}

type ConnectionStatus = "idle" | "connecting" | "connected" | "error" | "disconnected"
type AgentStatus = "idle" | "listening" | "thinking" | "speaking"

const MEDIA_PAUSE_EVENT = "omniweb:pause-media"
const CHATBOT_UI_STORAGE_KEY = "omniweb:chatbot-ui"
const VOICE_SESSION_STORAGE_KEY = "omniweb:voice-session"
const ASSISTANT_MEMORY_STORAGE_KEY = "omniweb:assistant-memory"

type ConversationMemoryEntry = {
  role: "user" | "assistant"
  content: string
  channel: "voice" | "text"
}

function readConversationMemory() {
  if (typeof window === "undefined") {
    return [] as ConversationMemoryEntry[]
  }

  const raw = window.sessionStorage.getItem(ASSISTANT_MEMORY_STORAGE_KEY)
  if (!raw) {
    return [] as ConversationMemoryEntry[]
  }

  try {
    const parsed = JSON.parse(raw) as ConversationMemoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    window.sessionStorage.removeItem(ASSISTANT_MEMORY_STORAGE_KEY)
    return [] as ConversationMemoryEntry[]
  }
}

function writeConversationMemory(entries: ConversationMemoryEntry[]) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(
    ASSISTANT_MEMORY_STORAGE_KEY,
    JSON.stringify(entries.slice(-24)),
  )
}

function appendConversationMemory(entry: ConversationMemoryEntry) {
  const content = entry.content.trim()
  if (!content) {
    return
  }

  const current = readConversationMemory()
  const previous = current[current.length - 1]
  if (previous && previous.role === entry.role && previous.content === content && previous.channel === entry.channel) {
    return
  }

  writeConversationMemory([...current, { ...entry, content }])
}

function clearConversationMemory() {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.removeItem(ASSISTANT_MEMORY_STORAGE_KEY)
  window.sessionStorage.removeItem(VOICE_SESSION_STORAGE_KEY)
}

function buildAssistantHistory(limit = 10) {
  return readConversationMemory()
    .slice(-limit)
    .map(({ role, content }) => ({ role, content }))
}

function createVoiceAudioContext() {
  const AudioContextConstructor = window.AudioContext ?? (window as Window & typeof globalThis & {
    webkitAudioContext?: typeof AudioContext
  }).webkitAudioContext

  if (!AudioContextConstructor) {
    throw new Error("This browser does not support Web Audio.")
  }

  try {
    return new AudioContextConstructor({ sampleRate: 24000 })
  } catch {
    return new AudioContextConstructor()
  }
}

async function requestVoiceStream() {
  const preferredAudio: MediaTrackConstraints = {
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 24000,
    sampleSize: 16,
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        ...preferredAudio,
        ...( { voiceIsolation: true } as Record<string, unknown> ),
      },
      video: false,
    })
  } catch {
    return navigator.mediaDevices.getUserMedia({
      audio: preferredAudio,
      video: false,
    })
  }
}

function isConversationEndRequest(message: string) {
  const normalized = normalizeIntentText(message)

  return [
    "no thank you",
    "no thanks",
    "that's all",
    "that is all",
    "i'm done",
    "im done",
    "i'm good",
    "im good",
  ].some((phrase) => normalized.includes(phrase))
}

function pauseSiteMedia(feature: string) {
  if (typeof window === "undefined") return

  document.querySelectorAll("video, audio").forEach((element) => {
    if (element instanceof HTMLMediaElement) {
      element.pause()
    }
  })

  window.dispatchEvent(new CustomEvent(MEDIA_PAUSE_EVENT, {
    detail: { feature },
  }))
}

function openAssistantAction(action: AssistantAction, router: { push: (href: string) => void }) {
  if (action.href.startsWith("mailto:") || action.href.startsWith("tel:")) {
    window.location.href = action.href
    return
  }

  if (typeof window !== "undefined") {
    const targetUrl = new URL(action.href, window.location.origin)
    const currentRoute = `${window.location.pathname}${window.location.search}${window.location.hash}`
    const nextRoute = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`

    if (currentRoute === nextRoute) {
      if (targetUrl.hash && window.location.hash !== targetUrl.hash) {
        window.location.hash = targetUrl.hash
      }
      return
    }

    router.push(action.href)

    window.setTimeout(() => {
      const updatedRoute = `${window.location.pathname}${window.location.search}${window.location.hash}`
      if (updatedRoute !== nextRoute) {
        window.location.assign(nextRoute)
      }
    }, 150)

    return
  }

  router.push(action.href)
}

// ─── Waveform bars ────────────────────────────────────────────────────────────
function Waveform({ active, color = "cyan" }: { active: boolean; color?: string }) {
  const bars = [3, 5, 4, 7, 5, 3, 6, 4, 5, 3]
  return (
    <div className="flex items-center gap-[2px]">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full ${color === "cyan" ? "bg-cyan-400" : "bg-purple-400"}`}
          style={{
            height: active ? `${h * 3}px` : "4px",
            transition: "height 0.15s ease",
            animation: active ? `waveBar ${0.6 + i * 0.07}s ease-in-out infinite alternate` : "none",
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}

// ─── Voice Panel (Deepgram Voice Agent) ───────────────────────────────────────
function VoicePanel({ onSwitchToText }: { onSwitchToText: () => void }) {
  const router = useRouter()
  const restoredConversationRef = useRef<ConversationMemoryEntry[]>([])
  const wsRef        = useRef<WebSocket | null>(null)
  const audioCtxRef  = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef    = useRef<MediaStreamAudioSourceNode | null>(null)
  const silentGainRef = useRef<GainNode | null>(null)
  const highPassRef = useRef<BiquadFilterNode | null>(null)
  const lowPassRef = useRef<BiquadFilterNode | null>(null)
  const streamRef    = useRef<MediaStream | null>(null)
  const keepAliveRef = useRef<number | null>(null)
  const navigationResetRef = useRef<number | null>(null)
  const quietTimeoutRef = useRef<number | null>(null)
  const hasRestoredVoiceSessionRef = useRef(false)
  const disconnectRef = useRef<(options?: { preserveSession?: boolean; endSession?: boolean }) => void>(() => {})
  const settingsAppliedRef = useRef(false)
  const playbackCursorRef = useRef(0)
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set())
  const lastVoiceAutomationRef = useRef("")
  const lastVoiceAutomationAtRef = useRef(0)
  const suppressAgentUntilRef = useRef(0)
  const navigationOverrideRef = useRef(false)
  const pendingAgentMessagesRef = useRef<string[]>([])
  const voiceReplyRequestIdRef = useRef(0)
  const noiseFloorRef = useRef(0.004)
  const smoothedLevelRef = useRef(0)
  const speechFramesRef = useRef(0)
  const silenceFramesRef = useRef(0)
  const gateOpenRef = useRef(false)
  const speechHoldFramesRef = useRef(0)

  const [status, setStatus]           = useState<ConnectionStatus>("idle")
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle")
  const [isMuted, setIsMuted]         = useState(false)
  const [talkMode, setTalkMode]       = useState<"push" | "live">("live")
  const [isPressingToTalk, setIsPressingToTalk] = useState(false)
  const [activityTick, setActivityTick] = useState(0)
  const [error, setError]             = useState<string | null>(null)
  const [transcript, setTranscript]   = useState<{ who: "user" | "agent"; text: string }[]>([])
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [transcript])

  const enqueueAudio = useCallback((pcm16: ArrayBuffer) => {
    const ctx = audioCtxRef.current
    if (!ctx) return
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => {})
    }
    const samples = new Int16Array(pcm16)
    const float32 = new Float32Array(samples.length)
    for (let i = 0; i < samples.length; i++) {
      float32[i] = Math.max(-1, Math.min(1, samples[i] / 32768))
    }
    const buffer = ctx.createBuffer(1, float32.length, 24000)
    buffer.getChannelData(0).set(float32)

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)

    const startAt = Math.max(ctx.currentTime + 0.03, playbackCursorRef.current || ctx.currentTime)
    playbackCursorRef.current = startAt + buffer.duration

    setAgentStatus("speaking")

    activeSourcesRef.current.add(source)
    source.onended = () => {
      activeSourcesRef.current.delete(source)
      if (activeSourcesRef.current.size === 0 && playbackCursorRef.current <= ctx.currentTime + 0.06) {
        playbackCursorRef.current = ctx.currentTime
        setAgentStatus("listening")
      }
    }

    source.start(startAt)
  }, [])

  const stopPlayback = useCallback(() => {
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop()
      } catch {}
    })
    activeSourcesRef.current.clear()
    if (audioCtxRef.current) {
      playbackCursorRef.current = audioCtxRef.current.currentTime
    } else {
      playbackCursorRef.current = 0
    }
  }, [])

  const markActivity = useCallback(() => {
    setActivityTick(Date.now())
  }, [])

  const clearNavigationOverride = useCallback(() => {
    navigationOverrideRef.current = false
    suppressAgentUntilRef.current = 0
    if (navigationResetRef.current !== null) {
      window.clearTimeout(navigationResetRef.current)
      navigationResetRef.current = null
    }
  }, [])

  const flushPendingAgentMessages = useCallback(() => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return
    }
    if (navigationOverrideRef.current || Date.now() < suppressAgentUntilRef.current) {
      return
    }

    const nextMessage = pendingAgentMessagesRef.current.shift()
    if (!nextMessage) {
      return
    }

    ws.send(JSON.stringify({
      type: "InjectAgentMessage",
      message: nextMessage,
    }))
  }, [])

  const injectAgentMessage = useCallback((message: string) => {
    const content = message.trim()
    if (!content) {
      return
    }

    pendingAgentMessagesRef.current.push(content)
    flushPendingAgentMessages()
  }, [flushPendingAgentMessages])

  const triggerVoiceNavigation = useCallback((action: AssistantAction, followUp?: string) => {
    navigationOverrideRef.current = true
    suppressAgentUntilRef.current = Date.now() + 1200
    if (navigationResetRef.current !== null) {
      window.clearTimeout(navigationResetRef.current)
      navigationResetRef.current = null
    }

    stopPlayback()
    setAgentStatus("listening")
    pauseSiteMedia("voice-navigation")
    openAssistantAction(action, router)

    navigationResetRef.current = window.setTimeout(() => {
      clearNavigationOverride()
      injectAgentMessage(followUp ?? buildVoiceFollowUp(action))
    }, 700)
  }, [clearNavigationOverride, injectAgentMessage, router, stopPlayback])

  const startPushToTalk = useCallback(() => {
    if (talkMode !== "push") return
    stopPlayback()
    setAgentStatus("listening")
    setIsPressingToTalk(true)
    markActivity()
  }, [markActivity, stopPlayback, talkMode])

  const stopPushToTalk = useCallback(() => {
    if (talkMode !== "push") return
    setIsPressingToTalk(false)
    speechFramesRef.current = 0
    silenceFramesRef.current = 0
    gateOpenRef.current = false
    speechHoldFramesRef.current = 0
    markActivity()
  }, [markActivity, talkMode])

  const handleVoiceAutomation = useCallback(async (message: string) => {
    const normalized = normalizeIntentText(message)
    const now = Date.now()
    if (!normalized) return
    if (normalized === lastVoiceAutomationRef.current && now - lastVoiceAutomationAtRef.current < 2500) return

    lastVoiceAutomationRef.current = normalized
    lastVoiceAutomationAtRef.current = now

    const requestId = voiceReplyRequestIdRef.current + 1
    voiceReplyRequestIdRef.current = requestId

    stopPlayback()
    setAgentStatus("thinking")
    suppressAgentUntilRef.current = Date.now() + 10000

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: buildAssistantHistory() }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error ?? `Voice assistant request failed (${response.status})`)
      }

      if (requestId !== voiceReplyRequestIdRef.current) {
        return
      }

      const payload = await response.json()
      const content = typeof payload.content === "string" ? payload.content.trim() : ""
      const action = (payload.actions as AssistantAction[] | undefined)?.[0]

      if (action) {
        triggerVoiceNavigation(action, content || undefined)
        return
      }

      suppressAgentUntilRef.current = 0
      injectAgentMessage(content || "I’m here and listening. What would you like to explore next?")
    } catch (voiceAutomationError) {
      console.warn("Voice automation failed:", voiceAutomationError)

      if (requestId !== voiceReplyRequestIdRef.current) {
        return
      }

      const quickAction = inferAssistantAction(message)
      if (quickAction) {
        triggerVoiceNavigation(quickAction)
        return
      }

      try {
        const actionResponse = await fetch("/api/assistant-action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, mode: "voice" }),
        })

        if (actionResponse.ok) {
          const actionPayload = await actionResponse.json()
          const action = (actionPayload.actions as AssistantAction[] | undefined)?.[0]
          const content = typeof actionPayload.content === "string" ? actionPayload.content.trim() : ""
          if (action) {
            triggerVoiceNavigation(action, content || undefined)
            return
          }
        }
      } catch (fallbackAutomationError) {
        console.warn("Voice action fallback failed:", fallbackAutomationError)
      }

      suppressAgentUntilRef.current = 0
      injectAgentMessage("I hit a snag on that request. Please try again, and I’ll help you from here.")
    }
  }, [injectAgentMessage, stopPlayback, triggerVoiceNavigation])

  // ── Connect ─────────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    const restoredConversation = readConversationMemory()
    restoredConversationRef.current = restoredConversation

    setStatus("connecting")
    setError(null)
    if (restoredConversation.length > 0) {
      setTranscript(restoredConversation.slice(-12).map((entry) => ({
        who: entry.role === "user" ? "user" : "agent",
        text: entry.content,
      })))
    }
    settingsAppliedRef.current = false
    suppressAgentUntilRef.current = 0
    navigationOverrideRef.current = false
    noiseFloorRef.current = 0.004
    smoothedLevelRef.current = 0
    speechFramesRef.current = 0
    silenceFramesRef.current = 0
    gateOpenRef.current = false
    speechHoldFramesRef.current = 0
    markActivity()

    try {
      pauseSiteMedia("voice")

      // 1. Get browser-safe Deepgram credential from our server
      const tokenRes = await fetch("/api/deepgram-token")
      if (!tokenRes.ok) {
        const body = await tokenRes.json().catch(() => ({}))
        throw new Error(body.error ?? "Failed to get Deepgram token")
      }
      const { credential, scheme, warning } = await tokenRes.json()

      if (!credential || !scheme) {
        throw new Error("Deepgram auth response is missing required fields")
      }

      if (warning) {
        console.warn("Deepgram auth warning:", warning)
      }

      // 2. Open microphone
      const stream = await requestVoiceStream()
      streamRef.current = stream

      // 3. Use a 24 kHz audio context so playback and transmitted PCM match Deepgram.
      const ctx = createVoiceAudioContext()
      await ctx.resume()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      sourceRef.current = source
      playbackCursorRef.current = ctx.currentTime

      // ScriptProcessor: capture PCM16 from mic and send over WS
      const processor = ctx.createScriptProcessor(2048, 1, 1)
      processorRef.current = processor
      const highPass = ctx.createBiquadFilter()
      highPass.type = "highpass"
      highPass.frequency.value = 120
      highPass.Q.value = 0.7
      highPassRef.current = highPass

      const lowPass = ctx.createBiquadFilter()
      lowPass.type = "lowpass"
      lowPass.frequency.value = 4200
      lowPass.Q.value = 0.7
      lowPassRef.current = lowPass

      const silentGain = ctx.createGain()
      silentGain.gain.value = 0
      silentGainRef.current = silentGain

      source.connect(highPass)
      highPass.connect(lowPass)
      lowPass.connect(processor)
      processor.connect(silentGain)
      silentGain.connect(ctx.destination)

      // 4. Open Deepgram Voice Agent WebSocket
      const ws = new WebSocket("wss://agent.deepgram.com/v1/agent/converse", [scheme, credential])
      wsRef.current = ws
      ws.binaryType = "arraybuffer"

      ws.onopen = () => {
        keepAliveRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "KeepAlive" }))
          }
        }, 5000)
      }

      ws.onmessage = (event) => {
        const suppressAgent = navigationOverrideRef.current || Date.now() < suppressAgentUntilRef.current

        // Binary = agent audio (PCM16 @ 24 kHz)
        if (event.data instanceof ArrayBuffer) {
          if (suppressAgent) {
            return
          }
          enqueueAudio(event.data)
          return
        }
        if (event.data instanceof Blob) {
          void event.data.arrayBuffer().then((buffer) => {
            if (suppressAgent) {
              return
            }
            enqueueAudio(buffer)
          }).catch(() => {})
          return
        }
        // Text = control messages
        try {
          const msg = JSON.parse(event.data as string)
          if (suppressAgent) {
            if (msg.type === "AgentThinking" || msg.type === "AgentStartedSpeaking" || msg.type === "AgentAudioDone") {
              return
            }
            if (msg.type === "ConversationText" && msg.role !== "user") {
              return
            }
          }
          if (msg.type === "Welcome") {
            const memoryContext = restoredConversationRef.current
              .slice(-8)
              .map((entry) => `${entry.role === "user" ? "User" : "Assistant"}: ${entry.content}`)
              .join("\n")
            const basePrompt = `You are the Omniweb voice transport assistant. Omniweb is an AI-powered website platform that helps businesses build, launch, and scale their digital presence faster than ever.

Guidelines:
- Do not answer user questions directly.
- Do not decide navigation or website actions on your own.
- The Omniweb app will inject the real assistant response after each user turn.
- After a user finishes speaking, remain silent and wait for the injected response.
- If a support request appears, the injected response will handle it.
- Speak naturally and do not use markdown or bullet formatting.`
            const prompt = memoryContext
              ? `${basePrompt}\n\nRecent conversation context:\n${memoryContext}`
              : basePrompt

            ws.send(JSON.stringify({
              type: "Settings",
              audio: {
                input: { encoding: "linear16", sample_rate: 24000 },
                output: { encoding: "linear16", sample_rate: 24000, container: "none" },
              },
              agent: {
                language: "en",
                listen: {
                  provider: { type: "deepgram", version: "v2", model: "flux-general-en" },
                },
                think: {
                  provider: { type: "open_ai", model: "gpt-4o-mini", temperature: 0.7 },
                  prompt,
                },
                speak: {
                  provider: { type: "deepgram", model: "aura-2-odysseus-en" },
                },
                greeting: restoredConversationRef.current.length > 0
                  ? "I’m back with you. We can continue where we left off."
                  : "Hi there! I’m the Omniweb AI assistant. How can I help you today?",
              },
            }))
            return
          }
          if (msg.type === "SettingsApplied") {
            settingsAppliedRef.current = true
            setStatus("connected")
            setAgentStatus("listening")
            markActivity()
            flushPendingAgentMessages()

            processor.onaudioprocess = (e) => {
              const canTransmit = !isMuted && (talkMode === "live" || isPressingToTalk)
              if (ws.readyState !== WebSocket.OPEN || !settingsAppliedRef.current || !canTransmit) return

              const input = e.inputBuffer.getChannelData(0)
              let sumSquares = 0
              let peak = 0
              for (let index = 0; index < input.length; index++) {
                const sample = input[index]
                const amplitude = Math.abs(sample)
                sumSquares += sample * sample
                if (amplitude > peak) {
                  peak = amplitude
                }
              }

              const rms = Math.sqrt(sumSquares / input.length)
              smoothedLevelRef.current = smoothedLevelRef.current * 0.84 + rms * 0.16

              const priorFloor = noiseFloorRef.current
              const floorCandidate = gateOpenRef.current
                ? priorFloor
                : Math.min(smoothedLevelRef.current, priorFloor * 1.15)
              const nextFloor = priorFloor * 0.985 + floorCandidate * 0.015
              noiseFloorRef.current = Math.max(0.0025, nextFloor)

              const speakingAgent = agentStatus === "speaking"
              const openThreshold = Math.max(speakingAgent ? 0.03 : 0.014, noiseFloorRef.current * (speakingAgent ? 5.5 : 3.8))
              const peakThreshold = openThreshold * (speakingAgent ? 1.5 : 1.3)
              const looksLikeSpeech = smoothedLevelRef.current > openThreshold && peak > peakThreshold

              if (looksLikeSpeech) {
                speechFramesRef.current += 1
                silenceFramesRef.current = 0
                speechHoldFramesRef.current = speakingAgent ? 6 : 12
              } else {
                speechFramesRef.current = 0
                if (speechHoldFramesRef.current > 0) {
                  speechHoldFramesRef.current -= 1
                }
                silenceFramesRef.current += 1
              }

              if (!gateOpenRef.current && speechFramesRef.current >= (speakingAgent ? 4 : 3)) {
                gateOpenRef.current = true
              }

              if (gateOpenRef.current && silenceFramesRef.current >= 8 && speechHoldFramesRef.current === 0) {
                gateOpenRef.current = false
              }

              if (!gateOpenRef.current) {
                return
              }

              const pcm16 = new Int16Array(input.length)
              for (let index = 0; index < input.length; index++) {
                const sample = Math.abs(input[index]) < noiseFloorRef.current * 1.2 ? 0 : input[index]
                pcm16[index] = Math.max(-32768, Math.min(32767, sample * 32768))
              }
              ws.send(pcm16.buffer)
            }
            return
          }
          if (msg.type === "UserStartedSpeaking") {
            // Barge-in: clear queued audio
            stopPlayback()
            setAgentStatus("listening")
            clearNavigationOverride()
            pendingAgentMessagesRef.current = []
            markActivity()
          }
          if (msg.type === "AgentThinking") {
            setAgentStatus("thinking")
            markActivity()
          }
          if (msg.type === "AgentStartedSpeaking") {
            setAgentStatus("speaking")
            markActivity()
          }
          if (msg.type === "AgentAudioDone") {
            if (audioCtxRef.current && activeSourcesRef.current.size === 0) {
              playbackCursorRef.current = audioCtxRef.current.currentTime
              setAgentStatus("listening")
            }
            markActivity()
            flushPendingAgentMessages()
          }
          if (msg.type === "ConversationText") {
            if (suppressAgent && msg.role !== "user") {
              return
            }
            setTranscript((t) => [...t, { who: msg.role === "user" ? "user" : "agent", text: msg.content }])
            appendConversationMemory({
              role: msg.role === "user" ? "user" : "assistant",
              content: msg.content,
              channel: "voice",
            })
            markActivity()
            if (msg.role === "user") {
              if (isConversationEndRequest(msg.content)) {
                setTranscript((t) => [...t, { who: "agent", text: "No problem — I’ll stop here. If you need anything later, just open me again." }])
                appendConversationMemory({
                  role: "assistant",
                  content: "No problem — I’ll stop here. If you need anything later, just open me again.",
                  channel: "voice",
                })
                window.setTimeout(() => {
                  disconnectRef.current({ endSession: true })
                }, 500)
                return
              }
              void handleVoiceAutomation(msg.content)
            }
          }
          if (msg.type === "InjectionRefused") {
            window.setTimeout(() => {
              flushPendingAgentMessages()
            }, 300)
          }
          if (msg.type === "Error") {
            setError(msg.description ?? "Deepgram error")
            setStatus("error")
          }
          if (msg.type === "Warning") {
            console.warn("Deepgram warning:", msg.description ?? msg.code ?? msg)
          }
        } catch {}
      }

      ws.onerror = () => {
        setError("Voice websocket connection error")
        setStatus("error")
      }

      ws.onclose = (event) => {
        if (keepAliveRef.current !== null) {
          window.clearInterval(keepAliveRef.current)
          keepAliveRef.current = null
        }
        if (event.code !== 1000 && event.code !== 1005) {
          const details = event.reason
            ? `Voice session closed (${event.code}): ${event.reason}`
            : `Voice session closed unexpectedly (${event.code}).`
          setError(details)
        }
        setStatus((s) => s === "connected" ? "disconnected" : s)
        setAgentStatus("idle")
        settingsAppliedRef.current = false
        suppressAgentUntilRef.current = 0
        navigationOverrideRef.current = false
        if (navigationResetRef.current !== null) {
          window.clearTimeout(navigationResetRef.current)
          navigationResetRef.current = null
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed")
      setStatus("error")
      streamRef.current?.getTracks().forEach((t) => t.stop())
      stopPlayback()
    }
  }, [clearNavigationOverride, enqueueAudio, handleVoiceAutomation, isMuted, isPressingToTalk, markActivity, stopPlayback, talkMode])

  // ── Disconnect ───────────────────────────────────────────────────────────────
  const disconnect = useCallback((options?: { preserveSession?: boolean; endSession?: boolean }) => {
    const preserveSession = options?.preserveSession === true
    const endSession = options?.endSession === true

    if (keepAliveRef.current !== null) {
      window.clearInterval(keepAliveRef.current)
      keepAliveRef.current = null
    }
    if (navigationResetRef.current !== null) {
      window.clearTimeout(navigationResetRef.current)
      navigationResetRef.current = null
    }
    stopPlayback()
    processorRef.current?.disconnect()
    if (processorRef.current) processorRef.current.onaudioprocess = null
    sourceRef.current?.disconnect()
    highPassRef.current?.disconnect()
    lowPassRef.current?.disconnect()
    silentGainRef.current?.disconnect()
    audioCtxRef.current?.close()
    wsRef.current?.close()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    processorRef.current = null
    sourceRef.current    = null
    highPassRef.current = null
    lowPassRef.current = null
    silentGainRef.current = null
    audioCtxRef.current  = null
    wsRef.current        = null
    streamRef.current    = null
    settingsAppliedRef.current = false
    suppressAgentUntilRef.current = 0
    navigationOverrideRef.current = false
    pendingAgentMessagesRef.current = []
    voiceReplyRequestIdRef.current += 1
    noiseFloorRef.current = 0.004
    smoothedLevelRef.current = 0
    speechFramesRef.current = 0
    silenceFramesRef.current = 0
    gateOpenRef.current = false
    speechHoldFramesRef.current = 0
    setIsPressingToTalk(false)
    setStatus("idle")
    setAgentStatus("idle")
    if (!preserveSession) {
      setTranscript([])
    }
    lastVoiceAutomationRef.current = ""
    lastVoiceAutomationAtRef.current = 0
    if (endSession) {
      clearConversationMemory()
    }
  }, [stopPlayback])

  useEffect(() => {
    disconnectRef.current = disconnect
  }, [disconnect])

  // ── Mute toggle ──────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted
    })
    setIsMuted(nextMuted)
  }, [isMuted])

  useEffect(() => {
    if (talkMode === "live") {
      setIsPressingToTalk(false)
      return
    }

    speechFramesRef.current = 0
    silenceFramesRef.current = 0
    gateOpenRef.current = false
    speechHoldFramesRef.current = 0
  }, [talkMode])

  useEffect(() => {
    if (typeof window === "undefined" || hasRestoredVoiceSessionRef.current) {
      return
    }

    hasRestoredVoiceSessionRef.current = true

    const raw = window.sessionStorage.getItem(VOICE_SESSION_STORAGE_KEY)
    if (!raw) {
      return
    }

    try {
      const saved = JSON.parse(raw) as {
        transcript?: Array<{ who: "user" | "agent"; text: string }>
        talkMode?: "push" | "live"
        resumeVoice?: boolean
      }

      if (saved.transcript?.length) {
        setTranscript(saved.transcript)
      }

      if (saved.talkMode === "push" || saved.talkMode === "live") {
        setTalkMode(saved.talkMode)
      }

      if (saved.resumeVoice) {
        window.setTimeout(() => {
          void connect()
        }, 150)
      }
    } catch {
      window.sessionStorage.removeItem(VOICE_SESSION_STORAGE_KEY)
    }
  }, [connect])

  useEffect(() => {
    if (typeof window === "undefined" || !hasRestoredVoiceSessionRef.current) {
      return
    }

    window.sessionStorage.setItem(VOICE_SESSION_STORAGE_KEY, JSON.stringify({
      transcript,
      talkMode,
      resumeVoice: status === "connected" || status === "connecting",
    }))
  }, [status, talkMode, transcript])

  useEffect(() => {
    if (quietTimeoutRef.current !== null) {
      window.clearTimeout(quietTimeoutRef.current)
      quietTimeoutRef.current = null
    }

    if (status !== "connected" || agentStatus === "speaking" || navigationOverrideRef.current) {
      return
    }

    quietTimeoutRef.current = window.setTimeout(() => {
      setTranscript((current) => [
        ...current,
        { who: "agent", text: "I’ll stop here for now since it’s quiet. If you need anything else, just open voice chat again." },
      ])
      appendConversationMemory({
        role: "assistant",
        content: "I’ll stop here for now since it’s quiet. If you need anything else, just open voice chat again.",
        channel: "voice",
      })
      disconnect({ endSession: true })
    }, 15000)

    return () => {
      if (quietTimeoutRef.current !== null) {
        window.clearTimeout(quietTimeoutRef.current)
        quietTimeoutRef.current = null
      }
    }
  }, [activityTick, agentStatus, disconnect, status])

  // Cleanup on unmount
  useEffect(() => () => { disconnect({ preserveSession: true }) }, [disconnect])

  const isConnected  = status === "connected"
  const isConnecting = status === "connecting"

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center justify-center py-6 px-4">
        {/* Orb */}
        <div className="relative mb-4">
          {isConnected && (
            <>
              <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/15 scale-150" />
              <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-500/10 scale-125" style={{ animationDuration: "1.5s" }} />
            </>
          )}
          <div className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-500 ${
            isConnected
              ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/40"
              : "bg-gradient-to-br from-white/10 to-white/5 border border-white/20"
          }`}>
            {isConnecting
              ? <Loader2 className="h-8 w-8 text-white animate-spin" />
              : isConnected
                ? <Mic className="h-8 w-8 text-white" />
                : <Phone className="h-8 w-8 text-white/50" />}
          </div>
        </div>

        {/* Status label */}
        <div className="mb-2 text-sm font-semibold text-white">
          {status === "idle"         && "Ready to connect"}
          {status === "connecting"   && "Connecting..."}
          {status === "connected"    && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              {talkMode === "live" ? "Live" : "Push to Talk"}
            </span>
          )}
          {status === "error"        && "Connection failed"}
          {status === "disconnected" && "Disconnected"}
        </div>

        {isConnected && (
          <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs text-white/60">
            <button
              onClick={() => setTalkMode("push")}
              className={`rounded-full px-3 py-1 transition-all ${
                talkMode === "push"
                  ? "bg-cyan-500/20 text-cyan-200"
                  : "hover:bg-white/10 hover:text-white"
              }`}
            >
              Push to talk
            </button>
            <button
              onClick={() => setTalkMode("live")}
              className={`rounded-full px-3 py-1 transition-all ${
                talkMode === "live"
                  ? "bg-purple-500/20 text-purple-200"
                  : "hover:bg-white/10 hover:text-white"
              }`}
            >
              Live mode
            </button>
          </div>
        )}

        {isConnected && (
          <p className="mb-3 text-center text-[11px] text-white/35">
            {talkMode === "live"
              ? "Live mode listens automatically. Switch to push-to-talk if the room is noisy."
              : "Push-to-talk only listens while you hold the talk button."}
          </p>
        )}

        {/* Agent waveform */}
        {isConnected && (
          <div className="mb-3 flex items-center gap-2">
            <Waveform
              active={agentStatus === "speaking" || agentStatus === "listening" || isPressingToTalk}
              color={agentStatus === "speaking" ? "purple" : "cyan"}
            />
            <span className="text-xs text-white/40 capitalize">
              {talkMode === "push" && isPressingToTalk
                ? "capturing voice"
                : agentStatus === "idle"
                  ? "waiting…"
                  : agentStatus}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Transcript */}
        {transcript.length > 0 && (
          <div className="mb-3 max-h-28 w-full overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-2 text-xs space-y-1">
            {transcript.map((t, i) => (
              <p key={i} className={t.who === "user" ? "text-blue-300" : "text-white/70"}>
                <span className="font-semibold">{t.who === "user" ? "You" : "AI"}: </span>{t.text}
              </p>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          {!isConnected && !isConnecting ? (
            <button
              onClick={connect}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white hover:from-cyan-700 hover:to-blue-700"
            >
              <Phone className="h-4 w-4" /> Start Voice Chat
            </button>
          ) : isConnecting ? (
            <button
              onClick={() => disconnect({ endSession: true })}
              className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm text-white/60 hover:text-white"
            >
              Cancel
            </button>
          ) : (
            <>
              {talkMode === "push" ? (
                <button
                  onPointerDown={startPushToTalk}
                  onPointerUp={stopPushToTalk}
                  onPointerLeave={stopPushToTalk}
                  onPointerCancel={stopPushToTalk}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    isPressingToTalk
                      ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Mic className="h-4 w-4" /> {isPressingToTalk ? "Release to send" : "Hold to talk"}
                </button>
              ) : (
                <button
                  onClick={toggleMute}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                    isMuted
                      ? "border-red-500/40 bg-red-500/20 text-red-400"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
              <button
                onClick={() => disconnect({ endSession: true })}
                className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
              >
                <PhoneOff className="h-4 w-4" /> End Call
              </button>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-2.5 text-center">
        <button onClick={onSwitchToText} className="text-xs text-white/30 hover:text-white/60">
          Switch to text chat
        </button>
      </div>
    </div>
  )
}

// ─── Text Panel ───────────────────────────────────────────────────────────────
function TextPanel({ onSwitchToVoice }: { onSwitchToVoice: () => void }) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(() => {
    const memory = readConversationMemory()

    if (memory.length === 0) {
      return [{
        id: "welcome",
        role: "assistant",
        content: "Hi! I'm the Omniweb AI assistant. I can help you explore services, pricing, templates, support options, and the best next step for your business. What would you like to know?",
      }]
    }

    return memory.slice(-16).map((entry, index) => ({
      id: `memory-${index}`,
      role: entry.role,
      content: entry.content,
    }))
  })
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleActionClick = useCallback((action: AssistantAction) => {
    openAssistantAction(action, router)
  }, [router])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, isLoading])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return

    pauseSiteMedia("text")

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text }
    setMessages((m) => [...m, userMsg])
    appendConversationMemory({ role: "user", content: text, channel: "text" })
    setInput("")
    setIsLoading(true)
    setError(null)

    const history = [...messages, userMsg].slice(-10).map(({ role, content }) => ({ role, content }))
    const assistantId = `a-${Date.now()}`
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `API error ${res.status}`)
      }

      const parsed = await res.json()
      setMessages((m) => m.map((msg) => msg.id === assistantId ? {
        ...msg,
        content: parsed.content ?? "Sorry, I couldn't get a response. Please try again.",
        actions: parsed.actions ?? [],
      } : msg))
      appendConversationMemory({
        role: "assistant",
        content: parsed.content ?? "Sorry, I couldn't get a response. Please try again.",
        channel: "text",
      })
    } catch (err) {
      const errText = err instanceof Error ? err.message : "Something went wrong"
      setError(errText)
      setMessages((m) => m.map((msg) => msg.id === assistantId ? { ...msg, content: "Sorry, I couldn't get a response. Please try again." } : msg))
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [input, isLoading, messages])

  return (
    <div className="flex flex-col" style={{ height: "380px" }}>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${msg.role === "assistant" ? "bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/20" : "bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-500/20"}`}>
              {msg.role === "assistant" ? <Bot className="h-3.5 w-3.5 text-cyan-400" /> : <User className="h-3.5 w-3.5 text-blue-400" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "assistant" ? "rounded-tl-sm bg-white/[0.08] text-white/90" : "rounded-tr-sm bg-gradient-to-br from-blue-600 to-purple-600 text-white"}`}>
              {msg.content || (
                <span className="flex items-center gap-1.5 text-white/40">
                  {[0, 150, 300].map((d) => <span key={d} className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </span>
              )}
            </div>
            {msg.role === "assistant" && msg.actions && msg.actions.length > 0 && (
              <div className="mt-2 flex max-w-[80%] flex-wrap gap-2">
                {msg.actions.map((action, index) => (
                  <button
                    key={`${msg.id}-${action.type}-${index}`}
                    onClick={() => handleActionClick(action)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      action.type === "lead"
                        ? "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"
                        : action.type === "support"
                          ? "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                          : "bg-white/10 text-white/75 hover:bg-white/15"
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
            {msg.role === "assistant" && msg.actions?.some((action) => action.summary) && (
              <div className="mt-2 max-w-[80%] rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-xs text-cyan-100/85">
                {msg.actions.find((action) => action.summary)?.summary}
              </div>
            )}
          </div>
        ))}
        {error && <div className="flex items-center gap-1.5 text-xs text-red-400"><AlertCircle className="h-3.5 w-3.5" />{error}</div>}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Ask me anything…"
            disabled={isLoading}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/25 focus:border-purple-500/50 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-40"
          >
            {isLoading ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Send className="h-4 w-4 text-white" />}
          </button>
        </div>
        <button onClick={onSwitchToVoice} className="w-full text-center text-xs text-white/25 hover:text-white/50">Switch to voice chat</button>
      </div>
    </div>
  )
}

// ─── Main Chatbot ─────────────────────────────────────────────────────────────
export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<"select" | "voice" | "text">("select")

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const raw = window.sessionStorage.getItem(CHATBOT_UI_STORAGE_KEY)
    if (!raw) {
      return
    }

    try {
      const saved = JSON.parse(raw) as { isOpen?: boolean; mode?: "select" | "voice" | "text" }
      setIsOpen(Boolean(saved.isOpen))
      if (saved.mode === "voice" || saved.mode === "text" || saved.mode === "select") {
        setMode(saved.mode)
      }
    } catch {
      window.sessionStorage.removeItem(CHATBOT_UI_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    window.sessionStorage.setItem(CHATBOT_UI_STORAGE_KEY, JSON.stringify({ isOpen, mode }))
  }, [isOpen, mode])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handleAssistantOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{ mode?: AssistantOpenMode }>
      const nextMode = customEvent.detail?.mode ?? "select"

      setIsOpen(true)

      if (nextMode === "voice" || nextMode === "text") {
        pauseSiteMedia(nextMode)
        setMode(nextMode)
        return
      }

      setMode("select")
    }

    window.addEventListener(ASSISTANT_OPEN_EVENT, handleAssistantOpen)
    return () => window.removeEventListener(ASSISTANT_OPEN_EVENT, handleAssistantOpen)
  }, [])

  const handleClose = () => { setIsOpen(false); setMode("select") }
  const handleSelectMode = (nextMode: "voice" | "text") => {
    pauseSiteMedia(nextMode)
    setMode(nextMode)
  }

  const headerInfo = {
    select: { label: "Omniweb Assistant", icon: <Bot className="h-4 w-4 text-cyan-400" /> },
    voice:  { label: "Voice Assistant",   icon: <Mic className="h-4 w-4 text-cyan-400" /> },
    text:   { label: "Chat with Omniweb AI", icon: <MessageSquare className="h-4 w-4 text-purple-400" /> },
  }[mode]

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-[5.5rem] right-4 z-50 w-[340px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/50 sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                {headerInfo.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{headerInfo.label}</p>
                <p className="text-[10px] text-white/30 leading-tight">Deepgram Voice + DigitalOcean AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {mode !== "select" && (
                <button onClick={() => setMode("select")} className="rounded-md p-1.5 text-white/30 hover:bg-white/10 hover:text-white" title="Back">
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
              <button onClick={handleClose} className="rounded-md p-1.5 text-white/30 hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mode selector */}
          {mode === "select" && (
            <div className="p-5">
              <p className="mb-4 text-center text-sm text-white/40">How would you like to connect?</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => handleSelectMode("voice")} className="group flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-cyan-500/40 hover:bg-cyan-500/[0.08]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-500/20 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 group-hover:from-cyan-500/30 group-hover:to-cyan-600/30">
                    <Mic className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Voice Chat</p>
                    <p className="text-xs text-white/40">Talk live with our AI — powered by Deepgram</p>
                  </div>
                </button>
                <button onClick={() => handleSelectMode("text")} className="group flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-purple-500/40 hover:bg-purple-500/[0.08]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-purple-500/20 bg-gradient-to-br from-purple-500/20 to-purple-600/20 group-hover:from-purple-500/30 group-hover:to-purple-600/30">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Text Chat</p>
                    <p className="text-xs text-white/40">Chat with AI — powered by DigitalOcean AI</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {mode === "voice" && <VoicePanel onSwitchToText={() => handleSelectMode("text")} />}
          {mode === "text"  && <TextPanel  onSwitchToVoice={() => handleSelectMode("voice")} />}
        </div>
      )}

      {/* FAB */}
      <FloatingAIAssistantButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
    </>
  )
}
