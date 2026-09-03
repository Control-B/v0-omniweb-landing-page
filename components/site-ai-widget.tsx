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
  ExternalLink,
  Headphones,
  Maximize2,
  MessageCircle,
  Mic,
  MicOff,
  Minimize2,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { inferAssistantAction, buildVoiceFollowUp, type AssistantAction } from "@/lib/assistant-navigation"
import { ASSISTANT_OPEN_EVENT, type AssistantOpenMode } from "@/lib/assistant-events"

type TranscriptMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  action?: AssistantAction | null
  timestamp: string
}

const QUICK_SUGGESTIONS = [
  { label: "💰 View Pricing Plans", query: "What are your pricing plans and costs?" },
  { label: "🎙️ Live Voice Demo", query: "Can you explain how the AI Voice Agents work?" },
  { label: "🛍️ Shopify Assistant", query: "Tell me about the Shopify AI Storefront Assistant" },
  { label: "🚀 Start Free Trial", query: "How do I get started with a 14-day free trial?" },
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
  const [messages, setMessages] = useState<TranscriptMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hello! I am your Omniweb AI Assistant powered by Deepgram. I can answer questions about our features, pricing, qualify your business needs, or navigate you directly to any page. How can I help you today?",
      timestamp: "Just now",
    },
  ])

  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Scroll chat container internally on new message (never hijack window scroll)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isThinking])

  // Listen for global omniweb:assistant-open event
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode?: AssistantOpenMode }>
      const mode = customEvent.detail?.mode || "chat"
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
  }, [])

  // Deepgram Aura Voice Synthesis via /api/voice/tts
  const speakText = useCallback(
    async (textToSpeak: string) => {
      if (isMuted || typeof window === "undefined") return

      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current.src = ""
        currentAudioRef.current = null
      }

      setIsSpeaking(true)

      try {
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
          throw new Error(`TTS HTTP error ${response.status}`)
        }

        const blob = await response.blob()
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        currentAudioRef.current = audio

        audio.onplay = () => setIsSpeaking(true)
        audio.onended = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }
        audio.onerror = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }

        await audio.play()
      } catch (err) {
        console.warn("[SiteAiWidget] Deepgram TTS stream fallback:", err)
        // Fallback to browser Web Speech if network TTS is unavailable
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel()
          const cleanText = textToSpeak.replace(/https?:\/\/[^\s]+/g, "").replace(/[\*#_`]/g, "")
          const utterance = new SpeechSynthesisUtterance(cleanText)
          utterance.rate = 1.05
          utterance.onend = () => setIsSpeaking(false)
          utterance.onerror = () => setIsSpeaking(false)
          window.speechSynthesis.speak(utterance)
        } else {
          setIsSpeaking(false)
        }
      }
    },
    [isMuted],
  )

  // Initialize Speech Recognition for Voice Mode (Deepgram Nova-3 / Web Speech Bridge)
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

  const toggleMicListening = () => {
    if (!recognitionRef.current) {
      alert("Microphone recognition is supported in Chrome, Edge, and Safari.")
      return
    }

    if (isMicListening) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
      setIsMicListening(false)
    } else {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        setIsSpeaking(false)
      }
      try {
        recognitionRef.current.start()
        setIsMicListening(true)
      } catch (e) {
        setIsMicListening(false)
      }
    }
  }

  // Waveform visualization in voice mode
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

  // Process user message & synthesize response
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim()
    if (!text) return

    const userMessage: TranscriptMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: "Just now",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsThinking(true)

    // Check if the user query contains an explicit or inferred site navigation intent
    const detectedAction = inferAssistantAction(text)

    setTimeout(() => {
      setIsThinking(false)
      const textLower = text.toLowerCase()
      let replyContent = ""
      let actionToTrigger: AssistantAction | null = detectedAction

      // 1. Feature Queries
      if (textLower.includes("shopify") || textLower.includes("store") || textLower.includes("cart") || textLower.includes("ecommerce")) {
        replyContent =
          "Omniweb's Shopify AI Assistant connects directly to your store catalog, answers product availability and sizing questions, and autonomously recovers abandoned checkouts. I've linked the Shopify overview below!"
        actionToTrigger = {
          type: "navigate",
          label: "View Shopify AI Assistant",
          href: "/solutions/shopify-ai-assistant",
          summary: "Opening Shopify AI Assistant overview.",
        }
      } else if (
        textLower.includes("pricing") ||
        textLower.includes("cost") ||
        textLower.includes("plans") ||
        textLower.includes("price") ||
        textLower.includes("how much")
      ) {
        replyContent =
          "Omniweb offers 3 transparent tiers: Starter at $49/mo (500 minutes), Pro Growth at $149/mo (2,500 minutes with Swarms and War Room), and Enterprise at $499/mo with dedicated SIP trunks and custom RAG. All plans include a 14-day free trial!"
        actionToTrigger = {
          type: "navigate",
          label: "View Pricing Plans ($49 / $149 / Enterprise)",
          href: "/pricing",
          summary: "Opening the Pricing page.",
        }
      } else if (textLower.includes("voice") || textLower.includes("phone") || textLower.includes("call") || textLower.includes("telephony")) {
        replyContent =
          "Our AI Voice Agents operate at sub-250ms latency using Deepgram Aura and LiveKit WebRTC. They handle inbound call triage, scheduling, high-ticket qualification, and live warm transfers with human-in-the-loop barge-in."
        actionToTrigger = {
          type: "navigate",
          label: "Explore AI Voice Agents",
          href: "/features/ai-voice-agents",
          summary: "Opening AI Voice Agents features.",
        }
      } else if (textLower.includes("war room") || textLower.includes("supervis") || textLower.includes("barge") || textLower.includes("monitor")) {
        replyContent =
          "The Supervisor War Room gives operations managers real-time telemetry, queue depth monitoring, live transcript streaming, whisper coaching, and instantaneous one-click barge-in takeover."
        actionToTrigger = {
          type: "navigate",
          label: "Open Call Center War Room",
          href: "/dashboard/call-center",
          summary: "Opening Live Call Center War Room.",
        }
      } else if (
        textLower.includes("start") ||
        textLower.includes("signup") ||
        textLower.includes("sign up") ||
        textLower.includes("trial") ||
        textLower.includes("register") ||
        textLower.includes("get started")
      ) {
        replyContent =
          "You can launch your first autonomous agent in under 5 minutes. No credit card required for the 14-day trial. Would you like me to open the setup wizard now?"
        actionToTrigger = {
          type: "lead",
          label: "Start 14-Day Free Trial",
          href: "/get-started",
          summary: "Opening Get Started onboarding.",
        }
      } else if (textLower.includes("feature") || textLower.includes("service") || textLower.includes("capabilities") || textLower.includes("what can you do")) {
        replyContent =
          "Omniweb is a complete contact center platform: 1) Inbound/Outbound Voice Swarms, 2) 24/7 AI Chat Concierge, 3) Automated Lead Qualification, 4) Two-Way Calendar Booking, 5) Power Outbound Dialers, 6) Shopify E-commerce AI, and 7) Supervisor Live War Room."
        actionToTrigger = {
          type: "navigate",
          label: "Explore All Features",
          href: "/features",
          summary: "Opening all features.",
        }
      } else if (textLower.includes("contact") || textLower.includes("sales") || textLower.includes("human") || textLower.includes("support")) {
        replyContent =
          "Our enterprise engineering and solutions team is available 24/7. You can reach us directly via the contact form or submit an architectural review request."
        actionToTrigger = {
          type: "navigate",
          label: "Open Contact Page",
          href: "/company#contact",
          summary: "Opening contact section.",
        }
      } else if (detectedAction) {
        replyContent = buildVoiceFollowUp(detectedAction)
      } else {
        // General lead qualification response
        replyContent =
          "Omniweb automates customer conversations across voice and web chat with sub-250ms turn latency. Are you looking to qualify inbound phone calls, automate website sales, or replace a traditional call center?"
      }

      const assistantMessage: TranscriptMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: replyContent,
        action: actionToTrigger,
        timestamp: "Just now",
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Speak aloud using Deepgram Aura
      speakText(replyContent)

      // If user explicitly asked to navigate, navigate automatically after a short delay
      if (
        actionToTrigger &&
        (textLower.includes("take me to") ||
          textLower.includes("go to") ||
          textLower.includes("navigate") ||
          textLower.includes("open") ||
          textLower.includes("show me the"))
      ) {
        setTimeout(() => {
          if (actionToTrigger?.href) {
            router.push(actionToTrigger.href)
          }
        }, 1200)
      }
    }, 600)
  }

  const handleStopSpeaking = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }

  return (
    <>
      {/* Floating Bottom-Right Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          className="fixed bottom-6 right-6 z-[9999] group flex h-14 items-center gap-3 rounded-full bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 p-1.5 pr-5 text-white shadow-[0_12px_36px_rgba(79,70,229,0.45)] ring-1 ring-white/20 transition-all hover:scale-105 hover:shadow-[0_18px_44px_rgba(79,70,229,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          aria-label="Open Omniweb AI Assistant"
        >
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/80 shadow-inner">
            <Bot className="h-5 w-5 text-cyan-400 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-200">AI Concierge</span>
            <span className="text-sm font-bold text-white">Ask Omniweb</span>
          </div>
        </button>
      )}

      {/* Expanded Floating Assistant Modal/Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-950/95 text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all ${
            isMinimized
              ? "h-16 w-80"
              : "h-[620px] max-h-[calc(100dvh-3rem)] w-[400px] max-w-[calc(100vw-2rem)]"
          }`}
        >
          {/* Top Header Bar */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.03] px-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-md">
                <Bot className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">Omniweb Assistant</h3>
                  <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0 text-[9px] font-mono text-cyan-300">
                    Deepgram Aura
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isSpeaking ? "Speaking..." : isMicListening ? "Listening to your mic..." : isThinking ? "Reasoning..." : "Ready to assist"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Voice Mute Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) handleStopSpeaking()
                  setIsMuted(!isMuted)
                }}
                className={`rounded-lg p-1.5 transition ${isMuted ? "text-red-400 hover:bg-red-500/10" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                title={isMuted ? "Unmute Voice" : "Mute Voice"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              {/* Minimize / Maximize */}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  handleStopSpeaking()
                  setIsOpen(false)
                }}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Mode Selector Tabs (Chat vs Voice) */}
              <div className="flex border-b border-white/10 bg-black/20 p-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-1.5 text-xs font-semibold transition ${
                    activeTab === "chat" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <MessageCircle className="h-3.5 w-3.5 text-cyan-400" />
                  Chat Assistant
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("voice")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-1.5 text-xs font-semibold transition ${
                    activeTab === "voice" ? "bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 ring-1 ring-cyan-500/30" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Headphones className="h-3.5 w-3.5 text-purple-400" />
                  Live Voice Call
                </button>
              </div>

              {/* VOICE CALL MODE */}
              {activeTab === "voice" && (
                <div className="flex flex-1 flex-col items-center justify-between p-6 text-center">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                      <Sparkles className="h-3 w-3" />
                      Deepgram Aura Studio Voice
                    </span>
                    <h4 className="text-base font-bold text-white">Interactive Voice Session</h4>
                    <p className="max-w-xs text-xs text-slate-400">
                      Speak naturally into your microphone. The assistant will answer features, pricing, and navigate to requested pages.
                    </p>
                  </div>

                  {/* Audio Waveform Canvas */}
                  <div className="my-4 flex w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <canvas ref={waveformCanvasRef} width={320} height={70} className="w-full" />
                    <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span className={`h-2 w-2 rounded-full ${isSpeaking ? "bg-emerald-400 animate-ping" : isMicListening ? "bg-rose-500 animate-pulse" : "bg-cyan-400"}`} />
                      <span>{isSpeaking ? "Speaking Aloud" : isMicListening ? "Listening..." : "Tap mic to talk"}</span>
                    </div>
                  </div>

                  {/* Mic Toggle Button */}
                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleMicListening}
                      className={`flex h-16 w-16 items-center justify-center rounded-full transition-all shadow-xl ${
                        isMicListening
                          ? "bg-rose-600 text-white ring-4 ring-rose-500/30 animate-pulse scale-110"
                          : "bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white hover:scale-105"
                      }`}
                    >
                      {isMicListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                    </button>
                    <span className="text-xs text-slate-400">
                      {isMicListening ? "Listening... click to send" : "Tap microphone to speak"}
                    </span>
                  </div>
                </div>
              )}

              {/* CHAT MESSAGES STREAM */}
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
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[88%] ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md"
                            : "border border-white/10 bg-slate-900/90 text-slate-100 rounded-tl-none shadow-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                        {/* Interactive Page Navigation Card */}
                        {msg.action && (
                          <div className="mt-3 rounded-xl border border-cyan-500/30 bg-cyan-950/40 p-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-cyan-300">{msg.action.label}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (msg.action?.href) router.push(msg.action.href)
                                }}
                                className="h-7 rounded-lg border-cyan-400/40 bg-cyan-500/20 px-2.5 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/30"
                              >
                                Navigate
                                <ArrowRight className="ml-1 h-3 w-3" />
                              </Button>
                            </div>
                            {msg.action.summary && <p className="mt-1 text-[11px] text-slate-300/80">{msg.action.summary}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Reasoning Indicator */}
                  {isThinking && (
                    <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse py-1">
                      <Bot className="h-3.5 w-3.5" />
                      <span>Assistant is reasoning...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Suggestion Chips (Chat Mode) */}
              {activeTab === "chat" && messages.length <= 3 && (
                <div className="border-t border-white/10 bg-white/[0.01] px-3 py-2">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                    {QUICK_SUGGESTIONS.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(chip.query)}
                        className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300 transition hover:border-cyan-400/40 hover:bg-white/10 hover:text-white"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-white/10 bg-slate-950/90 p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={toggleMicListening}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                      isMicListening ? "bg-rose-600 text-white animate-pulse" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                    title={isMicListening ? "Stop listening" : "Speak with microphone"}
                  >
                    <Mic className="h-4 w-4" />
                  </button>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about pricing, Shopify, features, or 'Take me to...'"
                    className="h-10 flex-1 rounded-xl border border-white/10 bg-slate-900 px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                  />

                  <Button
                    type="submit"
                    disabled={!inputMessage.trim() || isThinking}
                    className="h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-3.5 text-white hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40"
                  >
                    <ArrowUp className="h-4 w-4" />
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
