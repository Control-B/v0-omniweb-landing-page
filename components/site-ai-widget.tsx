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
  { label: "💰 View Pricing", query: "What are your pricing plans and costs?" },
  { label: "🎙️ Voice Demo", query: "How do the AI Voice Agents work?" },
  { label: "🛍️ Shopify Assistant", query: "Tell me about the Shopify AI Storefront Assistant" },
  { label: "🚀 14-Day Free Trial", query: "How do I get started with a 14-day free trial?" },
  { label: "🛡️ Supervisor War Room", query: "What is the Live Supervisor War Room?" },
]

export function SiteAiWidget() {
  const router = useRouter()
  const pathname = usePathname()

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "voice">("chat")
  const [inputMessage, setInputMessage] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isMicListening, setIsMicListening] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hello! I am your Omniweb AI Assistant powered by Deepgram. Ask me anything about our voice swarms, pricing, or say 'Take me to pricing' to navigate.",
      timestamp: "Just now",
    },
  ])

  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const sharedAudioElRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null)

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
      } else {
        setActiveTab("chat")
      }
    }

    window.addEventListener(ASSISTANT_OPEN_EVENT, handleOpen)
    return () => window.removeEventListener(ASSISTANT_OPEN_EVENT, handleOpen)
  }, [unlockAudioContext])

  // Stop any currently playing audio
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
  }, [])

  // Robust Audio Player (Web Audio API -> HTMLAudio -> Web Speech API fallback)
  const playSpeech = useCallback(
    async (textToSpeak: string) => {
      if (isMuted || typeof window === "undefined") return
      stopAudio()

      setIsSpeaking(true)

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
        })

        if (!response.ok) {
          throw new Error(`TTS HTTP error: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()

        // 2. Play via Web Audio API AudioContext (primary, lowest latency, zero autoplay block once unlocked)
        if (audioContextRef.current) {
          if (audioContextRef.current.state === "suspended") {
            await audioContextRef.current.resume()
          }

          // Make a copy of the buffer as decodeAudioData detaches the arrayBuffer
          const bufferCopy = arrayBuffer.slice(0)
          const audioBuffer = await audioContextRef.current.decodeAudioData(bufferCopy)

          const sourceNode = audioContextRef.current.createBufferSource()
          sourceNode.buffer = audioBuffer
          sourceNode.connect(audioContextRef.current.destination)

          audioSourceRef.current = sourceNode

          sourceNode.onended = () => {
            setIsSpeaking(false)
            audioSourceRef.current = null
            // In voice mode, resume listening automatically after agent finishes speaking
            if (activeTab === "voice" && recognitionRef.current && !isMicListening) {
              try {
                recognitionRef.current.start()
                setIsMicListening(true)
              } catch (e) {}
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
          URL.revokeObjectURL(audioUrl)
          if (activeTab === "voice" && recognitionRef.current && !isMicListening) {
            try {
              recognitionRef.current.start()
              setIsMicListening(true)
            } catch (e) {}
          }
        }
        audioEl.onerror = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }

        await audioEl.play()
      } catch (err) {
        console.warn("[SiteAiWidget] Audio stream fallback to Web Speech:", err)
        // 4. Browser Speech Synthesis Fallback
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel()
          const clean = textToSpeak.replace(/https?:\/\/[^\s]+/g, "").replace(/[\*#_`]/g, "")
          const utterance = new SpeechSynthesisUtterance(clean)
          utterance.rate = 1.05
          utterance.onend = () => {
            setIsSpeaking(false)
            if (activeTab === "voice" && recognitionRef.current && !isMicListening) {
              try {
                recognitionRef.current.start()
                setIsMicListening(true)
              } catch (e) {}
            }
          }
          utterance.onerror = () => setIsSpeaking(false)
          window.speechSynthesis.speak(utterance)
        } else {
          setIsSpeaking(false)
        }
      }
    },
    [isMuted, stopAudio, activeTab, isMicListening],
  )

  // Speech Recognition (Deepgram Nova-3 / Browser Web Speech bridge)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = "en-US"

        recognition.onresult = (event: any) => {
          const current = event.resultIndex
          const text = event.results[current][0].transcript
          if (text && text.trim()) {
            handleSendMessage(text.trim())
          }
          setIsMicListening(false)
        }

        recognition.onerror = (event: any) => {
          console.warn("[SiteAiWidget] Recognition error:", event.error)
          setIsMicListening(false)
        }

        recognition.onend = () => {
          setIsMicListening(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  const toggleMic = () => {
    unlockAudioContext()
    stopAudio()

    if (!recognitionRef.current) {
      alert("Microphone voice input is supported in modern mobile & desktop browsers (Chrome, Safari, Edge).")
      return
    }

    if (isMicListening) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
      setIsMicListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsMicListening(true)
      } catch (e) {
        setIsMicListening(false)
      }
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

      const amplitude = isSpeaking ? 32 : isMicListening ? 26 : isThinking ? 16 : 8
      const bars = 36
      const barWidth = width / bars

      for (let i = 0; i < bars; i++) {
        const x = i * barWidth
        const sinVal = Math.sin(phase + i * 0.32)
        const cosVal = Math.cos(phase * 1.5 + i * 0.18)
        const barHeight = Math.abs(sinVal * cosVal * amplitude) + 4

        const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight)
        if (isSpeaking) {
          gradient.addColorStop(0, "rgba(52, 211, 153, 0.95)")
          gradient.addColorStop(0.5, "rgba(34, 211, 238, 0.9)")
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.95)")
        } else if (isMicListening) {
          gradient.addColorStop(0, "rgba(244, 63, 94, 0.95)")
          gradient.addColorStop(0.5, "rgba(251, 146, 60, 0.9)")
          gradient.addColorStop(1, "rgba(244, 63, 94, 0.95)")
        } else {
          gradient.addColorStop(0, "rgba(56, 189, 248, 0.8)")
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.7)")
        }

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x + 2, centerY - barHeight / 2, barWidth - 4, barHeight, 2.5)
        ctx.fill()
      }

      phase += isSpeaking ? 0.14 : isMicListening ? 0.11 : 0.04
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
    stopAudio()

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
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

      // Speak aloud in Deepgram Aura voice
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
    } catch (err) {
      console.error("[SiteAiWidget] Chat error:", err)
      setIsThinking(false)
      const fallbackReply = "Omniweb automates phone and web conversations with sub-250ms latency. How can I help you today?"
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
              : "inset-x-0 bottom-0 sm:inset-auto sm:bottom-6 sm:right-6 h-[85dvh] sm:h-[640px] max-h-[85dvh] sm:max-h-[calc(100dvh-4rem)] w-full sm:w-[420px] rounded-t-[2.25rem] sm:rounded-3xl border-t sm:border border-white/20"
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
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">Omniweb AI</h3>
                  <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0 text-[9px] font-mono text-cyan-300">
                    Deepgram Aura
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isSpeaking ? "Speaking aloud..." : isMicListening ? "Listening to mic..." : isThinking ? "Reasoning..." : "Ready to converse"}
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
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition ${
                    activeTab === "voice"
                      ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-cyan-300 ring-1 ring-cyan-400/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Headphones className="h-4 w-4 text-purple-400" />
                  Live Voice Call
                </button>
              </div>

              {/* ── VOICE CALL MODE ────────────────────────────────────── */}
              {activeTab === "voice" && (
                <div className="flex flex-1 flex-col items-center justify-between p-5 text-center">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                      <Sparkles className="h-3 w-3" />
                      Continuous Deepgram Aura Voice
                    </span>
                    <h4 className="text-base font-bold text-white">Hands-Free Conversational Voice</h4>
                    <p className="max-w-xs text-xs text-slate-300 leading-relaxed">
                      Tap the mic once to talk. The assistant responds with Deepgram speech and automatically listens for your reply.
                    </p>
                  </div>

                  {/* Equalizer Waveform Canvas */}
                  <div className="my-3 flex w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    <canvas ref={waveformCanvasRef} width={340} height={76} className="w-full" />
                    <div className="mt-2 flex items-center gap-2 text-xs font-mono text-slate-300">
                      <span className={`h-2.5 w-2.5 rounded-full ${isSpeaking ? "bg-emerald-400 animate-ping" : isMicListening ? "bg-rose-500 animate-pulse" : "bg-cyan-400"}`} />
                      <span>{isSpeaking ? "Agent Speaking" : isMicListening ? "Listening to you..." : isThinking ? "Reasoning..." : "Ready"}</span>
                    </div>
                  </div>

                  {/* Large Touch Microphone Button (WCAG 56px minimum) */}
                  <div className="flex flex-col items-center gap-2.5 mb-2">
                    <button
                      type="button"
                      onClick={toggleMic}
                      className={`flex h-18 w-18 items-center justify-center rounded-full transition-all shadow-2xl active:scale-90 ${
                        isMicListening
                          ? "bg-rose-600 text-white ring-4 ring-rose-500/40 animate-pulse scale-105"
                          : "bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white hover:scale-105 shadow-cyan-500/30"
                      }`}
                      style={{ minHeight: "68px", minWidth: "68px" }}
                      aria-label={isMicListening ? "Stop listening" : "Start speaking"}
                    >
                      {isMicListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                    </button>
                    <span className="text-xs font-semibold text-slate-300">
                      {isMicListening ? "Listening... tap to send" : "Tap to speak into microphone"}
                    </span>
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
                            <span>Omniweb Assistant</span>
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

                        {/* Speech Playback Trigger Button for Each Assistant Response */}
                        {msg.role === "assistant" && (
                          <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                unlockAudioContext()
                                playSpeech(msg.content)
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 transition hover:bg-white/10"
                              title="Listen to this message"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                              Listen Aloud
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
                      <span>Reasoning through Omniweb knowledge...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Suggestion Chips (Chat Mode) */}
              {activeTab === "chat" && messages.length <= 3 && (
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

              {/* Input Area (Prevents iOS zoom with text-base on mobile) */}
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
                      isMicListening
                        ? "bg-rose-600 text-white animate-pulse"
                        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                    title={isMicListening ? "Stop listening" : "Speak with microphone"}
                    aria-label="Toggle Microphone"
                  >
                    <Mic className="h-5 w-5" />
                  </button>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onFocus={() => unlockAudioContext()}
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
