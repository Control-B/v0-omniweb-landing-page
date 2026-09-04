"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUp,
  Bot,
  CheckCircle2,
  Compass,
  Headphones,
  Maximize2,
  MessageCircle,
  Mic,
  MicOff,
  Minimize2,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
  Radio,
  Square,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { inferAssistantAction, type AssistantAction } from "@/lib/assistant-navigation"
import { ASSISTANT_OPEN_EVENT, type AssistantOpenMode } from "@/lib/assistant-events"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  action?: AssistantAction | null
  timestamp: string
}

const QUICK_SUGGESTIONS = [
  { label: "⚡ Sub-50ms Barge-in", query: "How does barge-in interruption work in Omniweb?" },
  { label: "🎙️ Turn-Taking", query: "How does natural conversational turn-taking work?" },
  { label: "💰 View Pricing Plans", query: "What are your pricing plans and costs?" },
  { label: "🛍️ Shopify Assistant", query: "Tell me about the Shopify AI Storefront Assistant" },
  { label: "🛡️ Supervisor War Room", query: "What is the Live Supervisor War Room?" },
  { label: "🚀 14-Day Free Trial", query: "How do I get started with a 14-day free trial?" },
]

export function SiteAiWidget() {
  const router = useRouter()
  const pathname = usePathname()

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "voice">("chat")
  const [continuousMode, setContinuousMode] = useState(true) // Continuous conversational turn-taking loop
  const [inputMessage, setInputMessage] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isMicListening, setIsMicListening] = useState(false)
  const [wasInterrupted, setWasInterrupted] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hello! I am your Omniweb AI Concierge powered by Deepgram Aura. Ask me anything, or speak naturally—you can interrupt me at any time.",
      timestamp: "Just now",
    },
  ])

  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const sharedAudioElRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Mutable refs to prevent stale closures in event listeners
  const isSpeakingRef = useRef(false)
  const isThinkingRef = useRef(false)
  const continuousModeRef = useRef(true)
  const activeTabRef = useRef<"chat" | "voice">("chat")
  const isMicListeningRef = useRef(false)
  const recognitionRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    isSpeakingRef.current = isSpeaking
  }, [isSpeaking])

  useEffect(() => {
    isThinkingRef.current = isThinking
  }, [isThinking])

  useEffect(() => {
    continuousModeRef.current = continuousMode
  }, [continuousMode])

  useEffect(() => {
    activeTabRef.current = activeTab
  }, [activeTab])

  useEffect(() => {
    isMicListeningRef.current = isMicListening
  }, [isMicListening])

  // Scroll chat messages internally on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isThinking])

  // UNLOCK AUDIO on first direct user touch or click (bypasses iOS Safari & Chrome autoplay blocks)
  const unlockAudioContext = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtxClass && !audioContextRef.current) {
        const ctx = new AudioCtxClass()
        audioContextRef.current = ctx
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {})
        }
      } else if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(() => {})
      }

      if (!sharedAudioElRef.current) {
        const el = new Audio()
        el.preload = "auto"
        sharedAudioElRef.current = el
      }

      setAudioUnlocked(true)
    } catch (e) {
      console.warn("[SiteAiWidget] Audio unlock warning:", e)
    }
  }, [])

  // Stop any currently playing audio immediately (<10ms)
  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop()
      } catch (e) {}
      audioSourceRef.current = null
    }

    if (sharedAudioElRef.current) {
      try {
        sharedAudioElRef.current.pause()
        sharedAudioElRef.current.currentTime = 0
      } catch (e) {}
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }

    setIsSpeaking(false)
    isSpeakingRef.current = false
  }, [])

  // Start Speech Recognition (User's turn)
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return
    unlockAudioContext()

    if (recognitionRestartTimeoutRef.current) {
      clearTimeout(recognitionRestartTimeoutRef.current)
      recognitionRestartTimeoutRef.current = null
    }

    if (recognitionRef.current && !isMicListeningRef.current) {
      try {
        recognitionRef.current.start()
        setIsMicListening(true)
        isMicListeningRef.current = true
      } catch (e: any) {
        // Recognition may already be running or initializing
        if (e?.name !== "InvalidStateError") {
          console.warn("[SiteAiWidget] startListening notice:", e)
        }
      }
    }
  }, [unlockAudioContext])

  // Stop Speech Recognition
  const stopListening = useCallback(() => {
    if (recognitionRestartTimeoutRef.current) {
      clearTimeout(recognitionRestartTimeoutRef.current)
      recognitionRestartTimeoutRef.current = null
    }

    if (recognitionRef.current && isMicListeningRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
      setIsMicListening(false)
      isMicListeningRef.current = false
    }
  }, [])

  // Instant Barge-In Interruption (<50ms audio stream cutoff + request abort)
  const interruptAndYieldFloor = useCallback(
    (reason: string = "User interrupted") => {
      // 1. Cancel in-flight network requests (chat reasoning or TTS fetch)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }

      // 2. Cut off audio immediately
      stopAudio()
      setIsThinking(false)
      isThinkingRef.current = false

      // 3. Flash visual interruption indicator
      setWasInterrupted(true)
      setTimeout(() => setWasInterrupted(false), 2400)

      console.info(`[SiteAiWidget] Barge-in triggered: ${reason}`)

      // 4. Immediately yield the floor to the user
      if (activeTabRef.current === "voice" || continuousModeRef.current) {
        setTimeout(() => {
          startListening()
        }, 80)
      }
    },
    [stopAudio, startListening]
  )

  // Robust Audio Player with turn-taking handoff on ended
  const playSpeech = useCallback(
    async (textToSpeak: string) => {
      if (isMuted || typeof window === "undefined") return
      stopAudio()

      setIsSpeaking(true)
      isSpeakingRef.current = true

      // Create new abort controller for this utterance
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        // 1. Fetch Deepgram Aura audio from /api/voice/tts
        const response = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: textToSpeak,
            personaId: "site-concierge",
            provider: "deepgram",
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`TTS HTTP error: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()

        // 2. Play via Web Audio API AudioContext (lowest latency, instantaneous control)
        if (audioContextRef.current) {
          if (audioContextRef.current.state === "suspended") {
            await audioContextRef.current.resume()
          }

          const bufferCopy = arrayBuffer.slice(0)
          const audioBuffer = await audioContextRef.current.decodeAudioData(bufferCopy)

          // If interrupted while decoding, abort playback
          if (controller.signal.aborted) return

          const sourceNode = audioContextRef.current.createBufferSource()
          sourceNode.buffer = audioBuffer
          sourceNode.connect(audioContextRef.current.destination)

          audioSourceRef.current = sourceNode

          sourceNode.onended = () => {
            setIsSpeaking(false)
            isSpeakingRef.current = false
            audioSourceRef.current = null

            // CONTINUOUS TURN-TAKING: Automatically re-open microphone for the user's turn
            if (activeTabRef.current === "voice" && continuousModeRef.current) {
              setTimeout(() => {
                startListening()
              }, 120)
            }
          }

          sourceNode.start(0)
          return
        }

        // 3. Fallback to HTMLAudio element
        const blob = new Blob([arrayBuffer], { type: "audio/mpeg" })
        const audioUrl = URL.createObjectURL(blob)
        const audioEl = sharedAudioElRef.current || new Audio()
        sharedAudioElRef.current = audioEl
        audioEl.src = audioUrl

        audioEl.onended = () => {
          setIsSpeaking(false)
          isSpeakingRef.current = false
          URL.revokeObjectURL(audioUrl)

          if (activeTabRef.current === "voice" && continuousModeRef.current) {
            setTimeout(() => {
              startListening()
            }, 120)
          }
        }
        audioEl.onerror = () => {
          setIsSpeaking(false)
          isSpeakingRef.current = false
          URL.revokeObjectURL(audioUrl)
        }

        await audioEl.play()
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return // Clean user cancellation
        }

        console.warn("[SiteAiWidget] Deepgram Aura stream fallback to Web Speech:", err)

        // 4. Browser Speech Synthesis Fallback
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel()
          const clean = textToSpeak.replace(/https?:\/\/[^\s]+/g, "").replace(/[\*#_`]/g, "")
          const utterance = new SpeechSynthesisUtterance(clean)
          utterance.rate = 1.05
          utterance.onend = () => {
            setIsSpeaking(false)
            isSpeakingRef.current = false

            if (activeTabRef.current === "voice" && continuousModeRef.current) {
              setTimeout(() => {
                startListening()
              }, 120)
            }
          }
          utterance.onerror = () => {
            setIsSpeaking(false)
            isSpeakingRef.current = false
          }
          window.speechSynthesis.speak(utterance)
        } else {
          setIsSpeaking(false)
          isSpeakingRef.current = false
        }
      }
    },
    [isMuted, stopAudio, startListening]
  )

  // Speech Recognition Initialization with Voice Barge-In Detection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = true
        recognition.lang = "en-US"

        // Voice Barge-in: if user starts speaking while agent is speaking, cut audio immediately!
        recognition.onspeechstart = () => {
          if (isSpeakingRef.current) {
            interruptAndYieldFloor("Voice activity detected during agent speech")
          }
        }

        recognition.onsoundstart = () => {
          if (isSpeakingRef.current) {
            interruptAndYieldFloor("Sound detected during agent speech")
          }
        }

        recognition.onresult = (event: any) => {
          // If agent is currently speaking, barge in immediately
          if (isSpeakingRef.current) {
            interruptAndYieldFloor("User voice transcript detected")
          }

          let finalTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }

          if (finalTranscript.trim()) {
            handleSendMessage(finalTranscript.trim())
            setIsMicListening(false)
            isMicListeningRef.current = false
          }
        }

        recognition.onerror = (event: any) => {
          // Ignore no-speech errors in continuous mode as silence timeouts happen naturally
          if (event.error !== "no-speech") {
            console.warn("[SiteAiWidget] Recognition error:", event.error)
          }
          setIsMicListening(false)
          isMicListeningRef.current = false
        }

        recognition.onend = () => {
          setIsMicListening(false)
          isMicListeningRef.current = false

          // CONTINUOUS MODE: If in voice call tab and not currently speaking or thinking, keep listening active
          if (
            activeTabRef.current === "voice" &&
            continuousModeRef.current &&
            !isSpeakingRef.current &&
            !isThinkingRef.current
          ) {
            recognitionRestartTimeoutRef.current = setTimeout(() => {
              try {
                recognition.start()
                setIsMicListening(true)
                isMicListeningRef.current = true
              } catch (e) {}
            }, 300)
          }
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRestartTimeoutRef.current) {
        clearTimeout(recognitionRestartTimeoutRef.current)
      }
    }
  }, [interruptAndYieldFloor])

  // Listen for global omniweb:assistant-open event from buttons anywhere on the site
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode?: AssistantOpenMode }>
      const mode = customEvent.detail?.mode || "chat"
      unlockAudioContext()
      setIsOpen(true)
      setIsMinimized(false)
      if (mode === "voice") {
        setActiveTab("voice")
        setTimeout(() => {
          startListening()
        }, 200)
      } else {
        setActiveTab("chat")
      }
    }

    window.addEventListener(ASSISTANT_OPEN_EVENT, handleOpen)
    return () => window.removeEventListener(ASSISTANT_OPEN_EVENT, handleOpen)
  }, [unlockAudioContext, startListening])

  const toggleMic = () => {
    unlockAudioContext()

    // If agent is speaking, clicking the mic immediately interrupts agent and gives turn to user
    if (isSpeaking) {
      interruptAndYieldFloor("User tapped mic button to interrupt")
      return
    }

    if (!recognitionRef.current) {
      alert("Microphone speech recognition is supported in modern browsers (Chrome, Safari, Edge).")
      return
    }

    if (isMicListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Reactive Waveform Equalizer Canvas
  useEffect(() => {
    if (activeTab !== "voice" || !waveformCanvasRef.current) return

    let animationFrameId: number
    const canvas = waveformCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let phase = 0

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const width = canvas.width
      const height = canvas.height
      const centerY = height / 2

      const amplitude = isSpeaking ? 34 : isMicListening ? 28 : isThinking ? 18 : 8
      const bars = 36
      const barWidth = width / bars

      for (let i = 0; i < bars; i++) {
        const x = i * barWidth
        const sinVal = Math.sin(phase + i * 0.32)
        const cosVal = Math.cos(phase * 1.5 + i * 0.18)
        const barHeight = Math.abs(sinVal * cosVal * amplitude) + 4

        const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight)
        if (isSpeaking) {
          gradient.addColorStop(0, "rgba(168, 85, 247, 0.95)") // Purple / magenta for agent
          gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.9)")
          gradient.addColorStop(1, "rgba(6, 182, 212, 0.95)")
        } else if (isMicListening) {
          gradient.addColorStop(0, "rgba(52, 211, 153, 0.95)") // Emerald / cyan for user turn
          gradient.addColorStop(0.5, "rgba(34, 211, 238, 0.9)")
          gradient.addColorStop(1, "rgba(16, 185, 129, 0.95)")
        } else if (isThinking) {
          gradient.addColorStop(0, "rgba(251, 191, 36, 0.9)")
          gradient.addColorStop(1, "rgba(245, 158, 11, 0.8)")
        } else {
          gradient.addColorStop(0, "rgba(56, 189, 248, 0.8)")
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.7)")
        }

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x + 2, centerY - barHeight / 2, barWidth - 4, barHeight, 2.5)
        ctx.fill()
      }

      phase += isSpeaking ? 0.14 : isMicListening ? 0.11 : isThinking ? 0.08 : 0.04
      animationFrameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationFrameId)
  }, [activeTab, isSpeaking, isMicListening, isThinking])

  // Send Message & Receive Conversational Response
  const handleSendMessage = async (textToSend?: string) => {
    unlockAudioContext()
    const text = (textToSend || inputMessage).trim()
    if (!text) return

    // User speaks/types -> immediately stop any previous audio
    stopAudio()

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: "Just now",
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputMessage("")
    setIsThinking(true)
    isThinkingRef.current = true

    // Create new abort controller for chat reasoning
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      })

      const data = await response.json()
      const assistantReply = data.reply || "I am here to help. Ask about our pricing, voice swarms, or Shopify assistant!"
      const action = data.action as AssistantAction | null

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantReply,
        action,
        timestamp: "Just now",
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsThinking(false)
      isThinkingRef.current = false

      // Speak aloud in Deepgram Aura voice with turn-taking loop
      playSpeech(assistantReply)

      // If user asked to navigate, perform route transition
      const textLower = text.toLowerCase()
      if (
        action?.href &&
        (textLower.includes("take me to") ||
          textLower.includes("go to") ||
          textLower.includes("navigate") ||
          textLower.includes("open") ||
          textLower.includes("show me"))
      ) {
        setTimeout(() => {
          if (action.href) router.push(action.href)
        }, 1400)
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        console.info("[SiteAiWidget] Request aborted by user barge-in")
        return
      }

      console.error("[SiteAiWidget] Chat error:", err)
      setIsThinking(false)
      isThinkingRef.current = false

      const fallbackReply = "Omniweb automates customer conversations with sub-250ms latency. How can I help you today?"
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: fallbackReply,
          timestamp: "Just now",
        },
      ])
      playSpeech(fallbackReply)
    }
  }

  return (
    <>
      {/* ── Floating Launcher Button (Mobile & Desktop Optimized) ─────────── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            unlockAudioContext()
            setIsOpen(true)
            setIsMinimized(false)
          }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] group flex h-13 sm:h-14 items-center gap-2.5 sm:gap-3 rounded-full bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 p-1.5 pr-4 sm:pr-5 text-white shadow-[0_12px_36px_rgba(79,70,229,0.5)] ring-1 ring-white/20 transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          style={{
            marginBottom: "env(safe-area-inset-bottom, 0px)",
            marginRight: "env(safe-area-inset-right, 0px)",
          }}
          aria-label="Open Omniweb AI Assistant"
        >
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-slate-950/85 shadow-inner">
            <Bot className="h-5 w-5 text-cyan-400 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-cyan-200">AI Concierge</span>
            <span className="text-xs sm:text-sm font-bold text-white">Ask Omniweb</span>
          </div>
        </button>
      )}

      {/* ── Expanded Assistant Sheet/Card (Mobile Bottom Drawer + Desktop Floating Card) ── */}
      {isOpen && (
        <div
          className={`fixed z-[9999] transition-all flex flex-col overflow-hidden bg-[#070e1d]/98 text-slate-100 shadow-[0_-12px_48px_rgba(0,0,0,0.8)] backdrop-blur-2xl ${
            isMinimized
              ? "bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-72 rounded-2xl border border-white/15"
              : "inset-x-0 bottom-0 sm:inset-auto sm:bottom-6 sm:right-6 h-[88dvh] sm:h-[660px] max-h-[88dvh] sm:max-h-[calc(100dvh-4rem)] w-full sm:w-[430px] rounded-t-[2.25rem] sm:rounded-3xl border-t sm:border border-white/20"
          }`}
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {/* Mobile Drag Indicator Handle */}
          <div className="w-12 h-1.5 bg-white/25 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

          {/* Top Header Bar */}
          <div className="flex h-15 shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-md">
                <Bot className="h-5 w-5" />
                <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ring-2 ring-slate-950 ${isSpeaking ? "bg-purple-400 animate-ping" : isMicListening ? "bg-emerald-400 animate-pulse" : "bg-cyan-400"}`} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">Omniweb AI Concierge</h3>
                  <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0 text-[9px] font-mono text-cyan-300">
                    Deepgram Aura
                  </Badge>
                </div>
                <p className="text-[11px] font-medium flex items-center gap-1">
                  {wasInterrupted ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <Zap className="h-3 w-3 animate-bounce" />
                      Interrupted — listening to you
                    </span>
                  ) : isSpeaking ? (
                    <span className="text-purple-300 font-semibold flex items-center gap-1">
                      <Volume2 className="h-3 w-3 animate-pulse" />
                      Agent speaking (tap to interrupt)
                    </span>
                  ) : isMicListening ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Radio className="h-3 w-3 animate-pulse" />
                      Your turn: listening to you...
                    </span>
                  ) : isThinking ? (
                    <span className="text-amber-300 animate-pulse">Reasoning...</span>
                  ) : (
                    <span className="text-slate-400">Ready to converse</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Mute/Unmute */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) stopAudio()
                  setIsMuted(!isMuted)
                }}
                className={`p-2 rounded-xl transition ${isMuted ? "text-rose-400 bg-rose-500/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                aria-label={isMuted ? "Unmute Voice" : "Mute Voice"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              {/* Minimize on Desktop */}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="hidden sm:inline-flex p-2 rounded-xl text-slate-400 transition hover:text-white hover:bg-white/5"
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  stopAudio()
                  stopListening()
                  setIsOpen(false)
                }}
                className="p-2 rounded-xl text-slate-400 transition hover:text-white hover:bg-white/5"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Mode Tabs (Chat vs Voice) */}
              <div className="flex border-b border-white/10 bg-black/25 p-1.5 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    unlockAudioContext()
                    setActiveTab("chat")
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
                    activeTab === "chat" ? "bg-white/15 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <MessageCircle className="h-4 w-4 text-cyan-400" />
                  Chat Assistant
                </button>
                <button
                  type="button"
                  onClick={() => {
                    unlockAudioContext()
                    setActiveTab("voice")
                    if (continuousMode) {
                      setTimeout(() => startListening(), 150)
                    }
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
                    activeTab === "voice"
                      ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-cyan-300 ring-1 ring-cyan-400/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Headphones className="h-4 w-4 text-purple-400" />
                  Continuous Voice Call
                </button>
              </div>

              {/* ── VOICE CALL MODE ────────────────────────────────────── */}
              {activeTab === "voice" && (
                <div className="flex flex-1 flex-col items-center justify-between p-4 sm:p-5 text-center">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                        <Sparkles className="h-3 w-3" />
                        Full-Duplex Turn-Taking
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                        <Zap className="h-2.5 w-2.5" />
                        &lt;50ms Barge-in
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">Continuous Conversational Voice</h4>
                    <p className="max-w-xs text-xs text-slate-300 leading-relaxed mx-auto">
                      Speak naturally. The assistant answers with Deepgram Aura voice and automatically gives you your turn.
                      <span className="text-cyan-300 font-medium block mt-0.5">Interrupt at any time by speaking or tapping.</span>
                    </p>
                  </div>

                  {/* Equalizer Waveform Canvas (Clickable to interrupt) */}
                  <div
                    onClick={() => {
                      if (isSpeaking) {
                        interruptAndYieldFloor("User clicked waveform canvas")
                      }
                    }}
                    className={`my-2 flex w-full flex-col items-center justify-center rounded-2xl border transition-all p-3 sm:p-4 cursor-pointer ${
                      isSpeaking
                        ? "border-purple-500/50 bg-purple-950/20 shadow-[0_0_24px_rgba(168,85,247,0.2)] hover:border-purple-400"
                        : isMicListening
                        ? "border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_24px_rgba(16,185,129,0.15)]"
                        : "border-white/10 bg-slate-900/80"
                    }`}
                    title={isSpeaking ? "Click to interrupt agent" : "Waveform active"}
                  >
                    <canvas ref={waveformCanvasRef} width={340} height={70} className="w-full" />
                    <div className="mt-2 flex items-center justify-between w-full px-2 text-xs font-mono text-slate-300">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            isSpeaking
                              ? "bg-purple-400 animate-ping"
                              : isMicListening
                              ? "bg-emerald-400 animate-pulse"
                              : isThinking
                              ? "bg-amber-400 animate-pulse"
                              : "bg-cyan-400"
                          }`}
                        />
                        <span className="text-[11px] font-semibold">
                          {isSpeaking
                            ? "Agent Speaking..."
                            : isMicListening
                            ? "Your turn: Listening to you..."
                            : isThinking
                            ? "Reasoning..."
                            : "Ready"}
                        </span>
                      </div>

                      {/* Turn Status Pill */}
                      <span className="text-[10px] text-slate-400">
                        {isSpeaking ? "Tap waveform to interrupt" : continuousMode ? "Hands-Free Auto Turn" : "Push-to-Talk"}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Turn & Interruption Controls */}
                  <div className="flex flex-col items-center gap-2.5 w-full">
                    {/* Instant Barge-In / Interrupt Button (Visible during agent speech) */}
                    {isSpeaking && (
                      <button
                        type="button"
                        onClick={() => interruptAndYieldFloor("User clicked Interrupt Agent button")}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 animate-pulse"
                        aria-label="Interrupt agent and speak"
                      >
                        <Square className="h-3.5 w-3.5 fill-current" />
                        Interrupt Agent (Yield Floor)
                      </button>
                    )}

                    {/* Microphone Circle Button (WCAG 68px touch target) */}
                    <button
                      type="button"
                      onClick={toggleMic}
                      className={`flex h-18 w-18 items-center justify-center rounded-full transition-all shadow-2xl active:scale-90 ${
                        isSpeaking
                          ? "bg-purple-600 text-white ring-4 ring-purple-500/40 hover:bg-purple-500"
                          : isMicListening
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-500/40 animate-pulse scale-105"
                          : "bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white hover:scale-105 shadow-cyan-500/30"
                      }`}
                      style={{ minHeight: "68px", minWidth: "68px" }}
                      aria-label={
                        isSpeaking
                          ? "Interrupt agent speaking"
                          : isMicListening
                          ? "Listening... Tap to pause mic"
                          : "Tap to speak into microphone"
                      }
                    >
                      {isSpeaking ? (
                        <Zap className="h-8 w-8 text-amber-300 animate-bounce" />
                      ) : isMicListening ? (
                        <MicOff className="h-8 w-8 text-white" />
                      ) : (
                        <Mic className="h-8 w-8 text-white" />
                      )}
                    </button>

                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-slate-200">
                        {isSpeaking
                          ? "Tap mic to interrupt agent"
                          : isMicListening
                          ? "Listening... speak naturally"
                          : "Tap mic to speak"}
                      </span>

                      {/* Continuous Mode Toggle */}
                      <div className="mt-1 flex items-center gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400 hover:text-slate-200">
                          <input
                            type="checkbox"
                            checked={continuousMode}
                            onChange={(e) => {
                              const checked = e.target.checked
                              setContinuousMode(checked)
                              if (checked && !isMicListening && !isSpeaking) {
                                startListening()
                              }
                            }}
                            className="rounded border-white/20 bg-slate-800 text-cyan-500 focus:ring-cyan-400 h-3.5 w-3.5"
                          />
                          Continuous Hands-Free Turn-Taking
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Quick Voice Question Chips */}
                  <div className="w-full pt-2">
                    <p className="text-[10px] text-slate-400 mb-1.5 uppercase tracking-wider font-semibold">
                      Or Ask Instant Question:
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {QUICK_SUGGESTIONS.slice(0, 4).map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            unlockAudioContext()
                            handleSendMessage(chip.query)
                          }}
                          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-cyan-400 hover:bg-white/10 hover:text-white"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── CHAT MODE ──────────────────────────────────────────── */}
              {activeTab === "chat" && (
                <div ref={chatContainerRef} className="flex-1 space-y-3.5 overflow-y-auto p-4 text-sm">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div className="mb-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                        {msg.role === "user" ? (
                          <span>You</span>
                        ) : (
                          <>
                            <Bot className="h-3 w-3 text-cyan-400" />
                            <span>Omniweb Concierge</span>
                          </>
                        )}
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[90%] sm:max-w-[85%] ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md"
                            : "border border-white/10 bg-slate-900/95 text-slate-100 rounded-tl-none shadow-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                        {/* Speech Playback Trigger Button for Assistant Responses */}
                        {msg.role === "assistant" && (
                          <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                unlockAudioContext()
                                if (isSpeaking) {
                                  stopAudio()
                                } else {
                                  playSpeech(msg.content)
                                }
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 transition hover:bg-white/10"
                              title={isSpeaking ? "Stop speech" : "Listen aloud in Deepgram Aura voice"}
                            >
                              {isSpeaking ? (
                                <>
                                  <Square className="h-3 w-3 text-rose-400 fill-current" />
                                  <span className="text-rose-400">Stop Speaking</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="h-3.5 w-3.5" />
                                  Listen Aloud
                                </>
                              )}
                            </button>
                            <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                          </div>
                        )}

                        {/* Interactive Page Navigation Action Card */}
                        {msg.action && (
                          <div className="mt-3 rounded-xl border border-cyan-500/30 bg-cyan-950/50 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-cyan-300">{msg.action.label}</span>
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (msg.action?.href) router.push(msg.action.href)
                                }}
                                className="h-8 rounded-lg bg-cyan-500 px-3 text-xs font-bold text-black hover:bg-cyan-400"
                              >
                                Navigate
                                <ArrowRight className="ml-1 h-3.5 w-3.5" />
                              </Button>
                            </div>
                            {msg.action.summary && <p className="mt-1 text-[11px] text-slate-300">{msg.action.summary}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Thinking / Reasoning Animation */}
                  {isThinking && (
                    <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse py-1">
                      <Bot className="h-4 w-4" />
                      <span>Omniweb reasoning through platform knowledge...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Suggestion Chips (Chat Mode) */}
              {activeTab === "chat" && messages.length <= 4 && (
                <div className="border-t border-white/10 bg-black/20 px-3 py-2">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                    {QUICK_SUGGESTIONS.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          unlockAudioContext()
                          handleSendMessage(chip.query)
                        }}
                        className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-slate-200 transition hover:border-cyan-400 hover:bg-white/10 hover:text-white"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-white/10 bg-slate-950/95 p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                      isSpeaking
                        ? "bg-purple-600 text-white animate-pulse"
                        : isMicListening
                        ? "bg-emerald-600 text-white animate-pulse"
                        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                    title={
                      isSpeaking
                        ? "Interrupt agent"
                        : isMicListening
                        ? "Stop listening"
                        : "Speak with microphone"
                    }
                    aria-label="Toggle Microphone"
                  >
                    {isSpeaking ? <Zap className="h-5 w-5 text-amber-300" /> : <Mic className="h-5 w-5" />}
                  </button>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => {
                      // Typing cancels agent speech immediately
                      if (isSpeaking) {
                        interruptAndYieldFloor("User started typing")
                      }
                      setInputMessage(e.target.value)
                    }}
                    onFocus={() => {
                      unlockAudioContext()
                      if (isSpeaking) {
                        interruptAndYieldFloor("User focused input field")
                      }
                    }}
                    placeholder="Ask about pricing, features, or 'Take me to...'"
                    className="h-11 flex-1 rounded-xl border border-white/15 bg-slate-900 px-3.5 text-base sm:text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                  />

                  <Button
                    type="submit"
                    disabled={!inputMessage.trim() || isThinking}
                    className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 p-0 text-white hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40"
                    aria-label="Send message"
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
