"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  Copy,
  Download,
  ExternalLink,
  Flame,
  Globe,
  Headphones,
  Info,
  Layers,
  Mic,
  MicOff,
  Navigation,
  Phone,
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  Radio,
  RadioTower,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export type PersonaScenario = {
  id: string
  name: string
  title: string
  industry: string
  avatarTone: "cyan" | "violet" | "emerald" | "amber" | "rose"
  voiceName: string
  latencyMs: number
  description: string
  greeting: string
  suggestedPrompts: string[]
  sampleDialogue: Array<{
    speaker: "caller" | "agent"
    text: string
    thought?: string
    toolCall?: { name: string; params: Record<string, any>; result: Record<string, any> }
    navigation?: { title: string; href: string; description?: string }
  }>
}

export const SCENARIOS: PersonaScenario[] = [
  {
    id: "site-concierge",
    name: "Elena Rostova",
    title: "Omniweb Site Concierge & Navigation AI",
    industry: "Platform Intelligence & Site Guide",
    avatarTone: "cyan",
    voiceName: "Deepgram Aura (Asteria Studio)",
    latencyMs: 185,
    greeting: "Hello! I am Elena Rostova, your Omniweb AI site concierge. I can answer questions about our services, pricing tiers, and guide you to any page on our website. How may I help you today?",
    description: "Answers all questions about Omniweb capabilities, service packages, pricing plans, and provides interactive real-time site navigation.",
    suggestedPrompts: [
      "What services does Omniweb AI offer for businesses?",
      "How much does the autonomous voice agent cost?",
      "Can you take me to the Shopify AI Storefront Assistant?",
      "Where can I see the Live Call Center War Room and outbound dialer?",
    ],
    sampleDialogue: [
      {
        speaker: "agent",
        thought: "NLU Intent: session_start. Loaded Omniweb service catalog, 3 pricing tiers, and full site map into memory.",
        text: "Hello! I am Elena Rostova, your Omniweb AI site concierge. I can answer questions about our services, pricing tiers, and guide you to any page on our website. How may I help you today?",
      },
    ],
  },
  {
    id: "billing-investigation",
    name: "Alex Vance",
    title: "Senior Billing & Disputes Specialist",
    industry: "SaaS & Enterprise Telecom",
    avatarTone: "violet",
    voiceName: "Deepgram Aura (Orion Studio)",
    latencyMs: 240,
    greeting: "Hello! Thanks for calling Omniweb Billing. I'm Alex Vance. How can I assist with your invoice or account today?",
    description: "Resolves high-value billing disputes, reconciles historical invoice ledgers, and handles refund policies with Human-in-the-Loop governance.",
    suggestedPrompts: [
      "Can you explain why my invoice was $299 this month instead of $199?",
      "I was double billed during our migration, can I get a $150 credit?",
      "What is your refund policy if we cancel before the renewal date?",
    ],
    sampleDialogue: [
      {
        speaker: "agent",
        thought: "NLU Intent: session_start. Initialized billing specialist ledger access.",
        text: "Hello! Thanks for calling Omniweb Billing. I'm Alex Vance. How can I assist with your invoice or account today?",
      },
    ],
  },
  {
    id: "high-ticket-closer",
    name: "Marcus Vance",
    title: "Enterprise Solutions & Closing Specialist",
    industry: "B2B SaaS & Automation",
    avatarTone: "emerald",
    voiceName: "Deepgram Aura (Zeus Studio)",
    latencyMs: 195,
    greeting: "Hi there! I'm Marcus Vance with Omniweb Enterprise Solutions. Are you looking to scale an inbound voice swarm or migrate an existing call center team?",
    description: "Qualifies high-intent inbound prospects, analyzes seat replacement ROI, and schedules executive product walkthroughs.",
    suggestedPrompts: [
      "We operate a 50-person call center costing $180k/mo. How does Omniweb compare?",
      "Can we integrate Omniweb with Salesforce CRM and custom SIP trunks?",
      "I want to book an executive demo for our leadership team next Tuesday at 2pm.",
    ],
    sampleDialogue: [
      {
        speaker: "agent",
        thought: "NLU Intent: session_start. Connected Enterprise ROI qualification model.",
        text: "Hi there! I'm Marcus Vance with Omniweb Enterprise Solutions. Are you looking to scale an inbound voice swarm or migrate an existing call center team?",
      },
    ],
  },
  {
    id: "emergency-dispatch",
    name: "Sophia Martinez",
    title: "Emergency Dispatch & Triage Coordinator",
    industry: "Home Services & Emergency HVAC",
    avatarTone: "rose",
    voiceName: "Deepgram Aura (Luna Studio)",
    latencyMs: 210,
    greeting: "Omniweb 24/7 Emergency Dispatch, this is Sophia Martinez. Are you reporting an urgent service failure or emergency outage?",
    description: "24/7 emergency triage that screens urgency, geo-routes technicians, and dispatches rapid response teams in under 60 seconds.",
    suggestedPrompts: [
      "Our commercial freezer stopped cooling and we have $40k of inventory at risk!",
      "I have water flooding my basement from a burst pipe, need help now!",
      "What is your emergency dispatch callout rate for after-hours service?",
    ],
    sampleDialogue: [
      {
        speaker: "agent",
        thought: "NLU Intent: session_start. SLA Priority queue armed for sub-60-second dispatch.",
        text: "Omniweb 24/7 Emergency Dispatch, this is Sophia Martinez. Are you reporting an urgent service failure or emergency outage?",
      },
    ],
  },
]

export function LiveCallCenterSimulator() {
  const [activeScenario, setActiveScenario] = useState<PersonaScenario>(SCENARIOS[0])
  const [callState, setCallState] = useState<"idle" | "connecting" | "active" | "ended">("idle")
  const [voiceProvider, setVoiceProvider] = useState<"deepgram" | "elevenlabs">("deepgram")
  const [isMuted, setIsMuted] = useState(false)
  const [isMicListening, setIsMicListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [copiedTranscript, setCopiedTranscript] = useState(false)
  const [transcript, setTranscript] = useState<PersonaScenario["sampleDialogue"]>(SCENARIOS[0].sampleDialogue)
  const [customInput, setCustomInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [livekitMode, setLivekitMode] = useState<"oss" | "cloud">("oss")
  const [activeAgentHUD, setActiveAgentHUD] = useState({
    activeAgent: "Elena Rostova (Site Concierge)",
    intent: "site_services_inquiry",
    confidence: 0.99,
    sentiment: "positive",
    urgency: "medium",
    lastTool: "navigate_site",
    turnLatency: "185ms",
  })
  const [supervisorMode, setSupervisorMode] = useState<"monitor" | "whisper" | "barge">("monitor")
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const transcriptEndRef = useRef<HTMLDivElement | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  // Natural Human Studio Speech Synthesis (Deepgram Aura / ElevenLabs)
  const speakAloud = async (textToSpeak: string) => {
    if (typeof window === "undefined") return

    // Stop any existing audio stream
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.src = ""
      currentAudioRef.current = null
    }

    setIsSpeaking(true)

    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSpeak,
          personaId: activeScenario.id,
          provider: voiceProvider,
        }),
      })

      if (!res.ok) {
        throw new Error(`TTS HTTP error ${res.status}`)
      }

      const blob = await res.blob()
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
      console.warn("Studio Neural TTS stream fallback:", err)
      // Browser Web Speech fallback only if network offline
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.rate = 1.05
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
      } else {
        setIsSpeaking(false)
      }
    }
  }

  // Scroll transcript to bottom on new turns
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [transcript, isThinking])

  // Reactive Waveform Simulation
  useEffect(() => {
    let animationFrameId: number
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let phase = 0

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const width = canvas.width
      const height = canvas.height
      const centerY = height / 2

      const amplitude = callState === "active" ? (isSpeaking ? 36 : isMicListening ? 28 : isThinking ? 18 : 10) : 4
      const bars = 48
      const barWidth = width / bars

      for (let i = 0; i < bars; i++) {
        const x = i * barWidth
        const sinVal = Math.sin(phase + i * 0.28)
        const cosVal = Math.cos(phase * 1.4 + i * 0.15)
        const barHeight = Math.abs(sinVal * cosVal * amplitude) + 4

        const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight)
        if (callState === "active") {
          if (isSpeaking) {
            gradient.addColorStop(0, "rgba(52, 211, 153, 0.95)")
            gradient.addColorStop(0.5, "rgba(34, 211, 238, 0.9)")
            gradient.addColorStop(1, "rgba(59, 130, 246, 0.95)")
          } else {
            gradient.addColorStop(0, "rgba(34, 211, 238, 0.9)")
            gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.9)")
            gradient.addColorStop(1, "rgba(59, 130, 246, 0.9)")
          }
        } else {
          gradient.addColorStop(0, "rgba(148, 163, 184, 0.3)")
          gradient.addColorStop(1, "rgba(100, 116, 139, 0.2)")
        }

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x + 2, centerY - barHeight / 2, barWidth - 4, barHeight, 3)
        ctx.fill()
      }

      phase += callState === "active" ? (isSpeaking ? 0.14 : 0.07) : 0.02
      animationFrameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationFrameId)
  }, [callState, isThinking, isMicListening, isSpeaking])

  // Setup Browser Speech Recognition (Deepgram / WebSpeech bridge)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = false
        recognition.lang = "en-US"

        recognition.onresult = (event: any) => {
          const current = event.resultIndex
          const text = event.results[current][0].transcript
          if (text && text.trim()) {
            handleSendMessage(text.trim())
          }
        }

        recognition.onerror = (event: any) => {
          console.warn("[SpeechRecognition] error:", event.error)
          setIsMicListening(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  const handleStartCall = () => {
    setCallState("connecting")
    setTimeout(() => {
      setCallState("active")
      const greetingTurn = {
        speaker: "agent" as const,
        thought: `NLU Intent: session_start. Loaded ${activeScenario.title} profile (Deepgram Aura / ElevenLabs Studio voice).`,
        text: activeScenario.greeting,
      }
      setTranscript([greetingTurn])
      // Speak the studio-grade greeting aloud!
      speakAloud(activeScenario.greeting)
    }, 500)
  }

  const handleEndCall = () => {
    setCallState("ended")
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    if (recognitionRef.current && isMicListening) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
      setIsMicListening(false)
    }
  }

  const toggleMicListening = () => {
    if (!recognitionRef.current) {
      alert("Microphone recognition is supported in modern browsers like Chrome, Edge, and Safari.")
      return
    }

    if (isMicListening) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
      setIsMicListening(false)
    } else {
      if (callState !== "active") {
        setCallState("active")
        speakAloud(activeScenario.greeting)
      }
      try {
        recognitionRef.current.start()
        setIsMicListening(true)
      } catch (e) {
        setIsMicListening(false)
      }
    }
  }

  const handleSelectScenario = (scenario: PersonaScenario) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setActiveScenario(scenario)
    const initialTurn = {
      speaker: "agent" as const,
      thought: `NLU Intent: session_start. Switched to ${scenario.title}.`,
      text: scenario.greeting,
    }
    setTranscript([initialTurn])
    if (callState === "active") {
      speakAloud(scenario.greeting)
    } else {
      setCallState("idle")
    }
    setActiveAgentHUD((prev) => ({
      ...prev,
      activeAgent: `${scenario.name} (${scenario.title.split("&")[0].trim()})`,
      turnLatency: `${scenario.latencyMs}ms`,
    }))
  }

  const handleCopyTranscript = () => {
    const formatted = transcript
      .map((t) => {
        const speakerName = t.speaker === "caller" ? "CALLER" : `${activeScenario.name} (AI)`
        const toolStr = t.toolCall ? `\n[Tool Executed: ${t.toolCall.name} -> ${JSON.stringify(t.toolCall.result)}]` : ""
        return `${speakerName}: ${t.text}${toolStr}`
      })
      .join("\n\n")

    navigator.clipboard.writeText(formatted)
    setCopiedTranscript(true)
    setTimeout(() => setCopiedTranscript(false), 2000)
  }

  const handleDownloadTranscript = () => {
    const data = {
      sessionId: `omniweb-session-${Date.now()}`,
      agent: activeScenario.name,
      agentTitle: activeScenario.title,
      timestamp: new Date().toISOString(),
      latencyAvgMs: activeScenario.latencyMs,
      turns: transcript,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `omniweb-transcript-${activeScenario.id}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || customInput
    if (!text.trim()) return

    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)

    setCallState("active")
    const newTurns: PersonaScenario["sampleDialogue"] = [
      ...transcript,
      { speaker: "caller", text },
    ]
    setTranscript(newTurns)
    setCustomInput("")
    setIsThinking(true)

    // Simulate AI Agent Reasoning, Deepgram transcription, and Navigation tool execution
    setTimeout(() => {
      setIsThinking(false)
      let agentTurn: PersonaScenario["sampleDialogue"][0]
      const textLower = text.toLowerCase()

      if (textLower.includes("price") || textLower.includes("pricing") || textLower.includes("cost") || textLower.includes("plan")) {
        agentTurn = {
          speaker: "agent",
          thought: "NLU Intent: pricing_inquiry. Invoking navigate_site for '/pricing' and search_knowledge for tier specifications.",
          toolCall: {
            name: "navigate_site",
            params: { query: "pricing", category: "Pricing" },
            result: { matched_route: "/pricing", recommended_path: "/pricing", title: "Platform Pricing & Plans" },
          },
          navigation: {
            title: "View Pricing Plans ($49 / $149 / Enterprise)",
            href: "/pricing",
            description: "Transparent per-seat and usage pricing with 14-day free trial.",
          },
          text: "Our plans are designed for teams of all sizes: Starter is $49 a month for 500 minutes, Pro Growth is $149 a month with multi-agent swarms and the live War Room, and Enterprise starts at $499 for dedicated SIP trunks and custom RAG. You can click the link in the transcript to view the full pricing table!",
        }
      } else if (textLower.includes("shopify") || textLower.includes("ecommerce") || textLower.includes("store") || textLower.includes("cart")) {
        agentTurn = {
          speaker: "agent",
          thought: "NLU Intent: shopify_solution_query. Calling navigate_site tool for '/solutions/shopify-ai-assistant'.",
          toolCall: {
            name: "navigate_site",
            params: { query: "shopify-ai-assistant", category: "Solutions" },
            result: { matched_route: "/solutions/shopify-ai-assistant", title: "Shopify AI Store Assistant" },
          },
          navigation: {
            title: "Shopify AI Storefront Assistant",
            href: "/solutions/shopify-ai-assistant",
            description: "Product catalog sync, sizing advice, and autonomous abandoned cart recovery.",
          },
          text: "Omniweb's Shopify AI Assistant directly indexes your product catalog, provides instant sizing and availability answers, and recovers abandoned carts on your checkout flow. I've linked the full walkthrough below!",
        }
      } else if (textLower.includes("war room") || textLower.includes("call center") || textLower.includes("dashboard") || textLower.includes("monitor") || textLower.includes("queue")) {
        agentTurn = {
          speaker: "agent",
          thought: "NLU Intent: war_room_navigation. Calling navigate_site for '/dashboard/call-center'.",
          toolCall: {
            name: "navigate_site",
            params: { query: "call center war room", category: "Dashboard" },
            result: { matched_route: "/dashboard/call-center", title: "Live Call Center War Room" },
          },
          navigation: {
            title: "Open Live Call Center War Room",
            href: "/dashboard/call-center",
            description: "Monitor live agent swarms, queue depths, and supervisor approval tickets.",
          },
          text: "You can access our real-time Live Call Center War Room at /dashboard/call-center. It features active swarm telemetry, live queue depth metrics, whisper coaching, and one-click barge-in takeover!",
        }
      } else if (textLower.includes("book") || textLower.includes("appointment") || textLower.includes("schedule") || textLower.includes("demo")) {
        agentTurn = {
          speaker: "agent",
          thought: "NLU Intent: appointment_booking. Invoking check_availability and book_appointment tool contracts.",
          toolCall: {
            name: "book_appointment",
            params: { appointment_date: "Next Tuesday", appointment_time: "2:00 PM EST", topic: "Omniweb Architecture Walkthrough" },
            result: { booking_id: "cal_84920", confirmed_time: "Next Tuesday at 2:00 PM EST", calendar_invite_sent: true },
          },
          navigation: {
            title: "Appointment Booking Confirmed",
            href: "/features/appointment-scheduling",
            description: "Review automated calendar sync and SMS confirmation sequences.",
          },
          text: "I have confirmed and reserved an executive architecture briefing for next Tuesday at 2:00 PM EST. Calendar invites and preparation context have been sent to your email!",
        }
      } else if (textLower.includes("services") || textLower.includes("what can you do") || textLower.includes("features") || textLower.includes("overview")) {
        agentTurn = {
          speaker: "agent",
          thought: "NLU Intent: services_catalog_discovery. Searching knowledge base and generating deep-link overview.",
          toolCall: {
            name: "search_knowledge",
            params: { query: "Omniweb platform capabilities and services", top_k: 3 },
            result: { total_found: 7, top_features: ["LiveKit Voice Swarms", "LangGraph Workflow State", "Lead Automation", "Shopify Assistant"] },
          },
          navigation: {
            title: "Explore All Platform Features",
            href: "/features",
            description: "Voice agents, chat assistants, CRM integration, and outbound dialers.",
          },
          text: "Omniweb delivers 7 core services: 1) Autonomous Inbound & Outbound AI Voice Swarms via LiveKit OSS, 2) 24/7 Web Chat Assistants, 3) High-Intent Lead Automation, 4) Two-Way Calendar Booking, 5) Outbound Campaign Power Dialer, 6) Shopify Storefront AI, and 7) Live Supervisor War Room with Human-in-the-Loop approval.",
        }
      } else {
        agentTurn = {
          speaker: "agent",
          thought: "NLU Intent: general_site_guidance. Searching tenant knowledge base (pgvector) and navigating site directory.",
          toolCall: {
            name: "navigate_site",
            params: { query: text },
            result: { total_matched: 3, top_recommendation: "/demo" },
          },
          navigation: {
            title: "Explore Live Agentic Lab",
            href: "/demo",
            description: "Interactive voice swarms, execution graph inspector, and ROI calculator.",
          },
          text: "Omniweb AI provides sub-250ms conversational turn latency, 99.8% first-contact resolution, and native tool execution with full CRM synchronization. Let me know which area you'd like to explore!",
        }
      }

      setTranscript([...newTurns, agentTurn])
      // Speak the human studio audio aloud!
      speakAloud(agentTurn.text)
    }, 850)
  }

  return (
    <div className="rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-slate-950/95 via-[#060c18]/95 to-slate-950/95 p-6 shadow-2xl shadow-black/80 backdrop-blur-2xl lg:p-8">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            <RadioTower className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            Live Voice Studio
          </div>
          <h2 className="mt-2.5 text-2xl font-bold tracking-tight text-white lg:text-3xl">
            Autonomous Contact Center & Site AI Concierge
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Powered by <strong>LiveKit OSS</strong> WebRTC media transport, <strong>Deepgram Aura & Nova-3</strong> Studio Neural Voice, and <strong>LangGraph</strong> multi-agent swarms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Voice Model Provider Switcher */}
          <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-1">
            <button
              onClick={() => setVoiceProvider("deepgram")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                voiceProvider === "deepgram"
                  ? "bg-cyan-500 text-black font-semibold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🎙️ Deepgram Aura
            </button>
            <button
              onClick={() => setVoiceProvider("elevenlabs")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                voiceProvider === "elevenlabs"
                  ? "bg-purple-500 text-white font-semibold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ✨ ElevenLabs
            </button>
          </div>

          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 py-1.5 px-3">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            LiveKit OSS (WebRTC Active)
          </Badge>
        </div>
      </div>

      {/* Persona / Scenario Selector */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Select Specialist Persona & Scenario</label>
          <span className="text-xs text-cyan-400 font-medium">4 Active Swarms Available</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SCENARIOS.map((scenario) => {
            const isSelected = scenario.id === activeScenario.id
            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario)}
                className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-cyan-400/60 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent shadow-lg shadow-cyan-500/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-semibold text-white text-sm">{scenario.name}</span>
                  {isSelected ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                  )}
                </div>
                <span className="mt-0.5 text-xs text-cyan-300 font-medium">{scenario.title}</span>
                <span className="mt-2 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{scenario.description}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Left Column: Softphone Console & Audio Waveform (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Audio Visualizer & Call Status Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                  isSpeaking
                    ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/30 scale-105"
                    : "border-cyan-400/30 bg-cyan-500/10 text-cyan-400 shadow-md"
                }`}>
                  <Bot className="h-6 w-6" />
                  {callState === "active" && (
                    <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-1.5">
                    {activeScenario.name}
                    {isSpeaking && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        <Volume2 className="h-3 w-3 animate-pulse" />
                        Speaking
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {voiceProvider === "deepgram" ? activeScenario.voiceName : "ElevenLabs Turbo v2.5"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    callState === "active"
                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                      : callState === "connecting"
                        ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
                        : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${callState === "active" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                  {callState === "active" ? "VOICE CALL LIVE" : callState === "connecting" ? "CONNECTING LIVEKIT..." : "IDLE"}
                </span>
              </div>
            </div>

            {/* Reactive Waveform Canvas */}
            <div className="mt-5 rounded-2xl border border-white/5 bg-slate-950/80 p-3">
              <canvas ref={canvasRef} width={380} height={70} className="w-full h-[70px]" />
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3 text-cyan-400" />
                  LiveKit: {livekitMode === "oss" ? "OSS (localhost:7880)" : "Cloud"}
                </span>
                <span className="flex items-center gap-1">
                  <Volume2 className="h-3 w-3 text-emerald-400" />
                  Neural Voice: {isSpeaking ? "Deepgram Studio (Playing)" : isMicListening ? "Mic Active" : "Ready"}
                </span>
              </div>
            </div>

            {/* Call Control Buttons & Live Mic Streaming */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center justify-center gap-3">
                {callState !== "active" ? (
                  <Button
                    size="lg"
                    onClick={handleStartCall}
                    className="h-13 flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-cyan-400"
                  >
                    <PhoneCall className="mr-2 h-5 w-5 animate-bounce" />
                    Start Inbound Voice Call
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={handleEndCall}
                      className="h-12 flex-1 rounded-2xl bg-rose-600 font-semibold text-white hover:bg-rose-500 shadow-lg shadow-rose-600/20"
                    >
                      <PhoneOff className="mr-2 h-5 w-5" />
                      Hang Up
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={toggleMicListening}
                      title={isMicListening ? "Mute Microphone" : "Unmute / Speak into Mic"}
                      className={`h-12 w-12 rounded-2xl border-white/10 transition-all ${
                        isMicListening
                          ? "bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-400 animate-pulse"
                          : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {isMicListening ? <Mic className="h-5 w-5 text-emerald-400" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                  </>
                )}
              </div>

              {callState === "active" && (
                <p className="text-center text-[11px] text-slate-400">
                  {isSpeaking ? (
                    <span className="text-emerald-400 font-medium">🔊 Agent is speaking aloud in natural studio voice...</span>
                  ) : isMicListening ? (
                    <span className="text-cyan-400 font-medium">🎤 Listening to your microphone... Speak anytime!</span>
                  ) : (
                    <span>Click the microphone button to speak or use the suggested questions below.</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Quick Scenario Suggested Prompts */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Suggested Test Questions & Actions
            </h4>
            <div className="mt-3 space-y-2">
              {activeScenario.suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left text-xs text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-white group"
                >
                  <span className="group-hover:text-cyan-200">"{prompt}"</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-cyan-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Dual-Channel Transcript & Agent Brain HUD (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Agent Brain & Live Execution HUD */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
                <Zap className="h-4 w-4 text-purple-400" />
                LangGraph State & Tool Execution HUD
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
                Deterministic Policy Plane
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                <span className="text-[10px] uppercase text-slate-400">Active Agent</span>
                <p className="mt-1 font-semibold text-cyan-300 truncate">{activeAgentHUD.activeAgent}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                <span className="text-[10px] uppercase text-slate-400">Sentiment</span>
                <p className="mt-1 font-semibold text-emerald-300 capitalize">{activeAgentHUD.sentiment}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                <span className="text-[10px] uppercase text-slate-400">Turn Latency</span>
                <p className="mt-1 font-semibold text-amber-300">{activeScenario.latencyMs}ms</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                <span className="text-[10px] uppercase text-slate-400">Active Tool</span>
                <p className="mt-1 font-semibold text-violet-300 truncate">{activeAgentHUD.lastTool}()</p>
              </div>
            </div>
          </div>

          {/* Dual-Channel Live Transcript Box */}
          <div className="flex flex-col h-[440px] rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Live Dual-Channel Speech Transcript
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                  {transcript.length} turns
                </span>
              </div>

              {/* Transcript Actions (Copy & Download) */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyTranscript}
                  className="h-7 rounded-lg border-white/10 bg-white/5 px-2.5 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  {copiedTranscript ? (
                    <>
                      <Check className="mr-1 h-3 w-3 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy Transcript
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadTranscript}
                  className="h-7 rounded-lg border-white/10 bg-white/5 px-2.5 text-[11px] text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <Download className="mr-1 h-3 w-3" />
                  JSON
                </Button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-2">
              {transcript.map((turn, idx) => (
                <div key={idx} className={`flex flex-col ${turn.speaker === "caller" ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                    {turn.speaker === "caller" ? (
                      <>
                        <span>Caller (Live Microphone / WebRTC)</span>
                        <User className="h-3 w-3 text-cyan-400" />
                      </>
                    ) : (
                      <>
                        <Bot className="h-3 w-3 text-purple-400" />
                        <span className="text-purple-300">{activeScenario.name} (AI Specialist)</span>
                      </>
                    )}
                  </div>

                  {/* Agent Internal Thought / Tool Calling Bubble */}
                  {turn.thought && (
                    <div className="mb-1.5 max-w-[90%] rounded-xl border border-purple-500/20 bg-purple-950/40 p-2.5 text-[11px] text-purple-200">
                      <div className="flex items-center gap-1 font-mono font-semibold text-purple-300">
                        <Activity className="h-3 w-3" />
                        [Agent Brain Trace]
                      </div>
                      <p className="mt-1 font-mono text-purple-200/90">{turn.thought}</p>

                      {turn.toolCall && (
                        <div className="mt-2 rounded-lg bg-black/40 p-2 font-mono text-[10px]">
                          <span className="text-cyan-400 font-semibold">➔ Tool Execution: {turn.toolCall.name}()</span>
                          <div className="text-slate-300 mt-0.5">Payload: {JSON.stringify(turn.toolCall.params)}</div>
                          <div className="text-emerald-400 mt-0.5">Output: {JSON.stringify(turn.toolCall.result)}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Spoken Turn Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      turn.speaker === "caller"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md shadow-cyan-600/20"
                        : "border border-white/10 bg-slate-900 text-slate-100 rounded-tl-none"
                    }`}
                  >
                    {turn.text}
                  </div>

                  {/* Interactive Site Navigation Action Card */}
                  {turn.navigation && (
                    <div className="mt-2 max-w-[85%] rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 p-3 shadow-lg shadow-cyan-950/30">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Compass className="h-4 w-4 text-cyan-400 shrink-0 animate-spin-slow" />
                          <div>
                            <p className="text-xs font-semibold text-white">{turn.navigation.title}</p>
                            {turn.navigation.description && (
                              <p className="text-[11px] text-slate-300 mt-0.5">{turn.navigation.description}</p>
                            )}
                          </div>
                        </div>
                        <Button asChild size="sm" className="h-8 rounded-xl bg-cyan-500 px-3 text-xs font-semibold text-black hover:bg-cyan-400 shrink-0">
                          <Link href={turn.navigation.href}>
                            Visit Page
                            <ExternalLink className="ml-1.5 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse py-2">
                  <Bot className="h-4 w-4" />
                  <span>Agent is reasoning and executing tools...</span>
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Text Input Row for testing */}
            <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about Omniweb services, pricing, or say 'Take me to Shopify'..."
                className="h-11 flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <Button
                onClick={() => handleSendMessage()}
                className="h-11 rounded-xl bg-cyan-500 px-4 font-semibold text-black hover:bg-cyan-400"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Supervisor Intervention & War Room Bar */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/80 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Headphones className="h-5 w-5 text-amber-400" />
            <div>
              <h4 className="text-sm font-semibold text-white">Supervisor Intervention HUD</h4>
              <p className="text-xs text-slate-400">Live supervisor monitoring, whisper coaching, and warm transfer controls</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={supervisorMode === "monitor" ? "default" : "outline"}
              onClick={() => setSupervisorMode("monitor")}
              className={supervisorMode === "monitor" ? "bg-amber-500 text-black hover:bg-amber-400" : "border-white/10 text-white"}
            >
              Listen-In (Silent)
            </Button>
            <Button
              size="sm"
              variant={supervisorMode === "whisper" ? "default" : "outline"}
              onClick={() => setSupervisorMode("whisper")}
              className={supervisorMode === "whisper" ? "bg-cyan-500 text-black hover:bg-cyan-400" : "border-white/10 text-white"}
            >
              Whisper Coach
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => alert("Barge-In Mode Activated: Supervisor audio unmuted to caller.")}
              className="bg-rose-600 hover:bg-rose-500 text-white"
            >
              Barge-In Takeover
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
