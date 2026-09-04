"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
  Square,
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
  const [wasInterrupted, setWasInterrupted] = useState(false)
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
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null)
  const hasUserInteractedRef = useRef(false)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const isSpeakingRef = useRef(false)
  const callStateRef = useRef<"idle" | "connecting" | "active" | "ended">("idle")
  const isMicListeningRef = useRef(false)
  const activeScenarioRef = useRef(activeScenario)

  useEffect(() => {
    isSpeakingRef.current = isSpeaking
  }, [isSpeaking])

  useEffect(() => {
    callStateRef.current = callState
  }, [callState])

  useEffect(() => {
    isMicListeningRef.current = isMicListening
  }, [isMicListening])

  useEffect(() => {
    activeScenarioRef.current = activeScenario
  }, [activeScenario])

  // Unlock AudioContext for lowest latency playback
  const unlockAudio = useCallback(() => {
    if (typeof window === "undefined") return
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtxClass && !audioContextRef.current) {
        audioContextRef.current = new AudioCtxClass()
      }
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(() => {})
      }
    } catch (e) {}
  }, [])

  // Immediate Audio Cutoff (<10ms) for Barge-in Interruption
  const stopAudioImmediate = useCallback(() => {
    // 1. Abort in-flight network requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // 2. Stop Web Audio Buffer Source
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop()
      } catch (e) {}
      audioSourceRef.current = null
    }

    // 3. Stop HTMLAudio element
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause()
        currentAudioRef.current.currentTime = 0
      } catch (e) {}
      currentAudioRef.current = null
    }

    // 4. Cancel Speech Synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }

    setIsSpeaking(false)
    isSpeakingRef.current = false
  }, [])

  // Start speech recognition listening for caller turn
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return
    unlockAudio()
    if (recognitionRef.current && !isMicListeningRef.current) {
      try {
        recognitionRef.current.start()
        setIsMicListening(true)
        isMicListeningRef.current = true
      } catch (e: any) {
        if (e?.name !== "InvalidStateError") {
          console.warn("[Simulator] startListening error:", e)
        }
      }
    }
  }, [unlockAudio])

  // Stop speech recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isMicListeningRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
      setIsMicListening(false)
      isMicListeningRef.current = false
    }
  }, [])

  // Instant Barge-In Interruption Handler
  const interruptAgent = useCallback(
    (reason: string = "User interrupted agent") => {
      stopAudioImmediate()
      setIsThinking(false)
      setWasInterrupted(true)
      setTimeout(() => setWasInterrupted(false), 2400)
      console.info(`[Simulator Barge-In] ${reason}`)

      // If call is active, immediately yield the floor to caller
      if (callStateRef.current === "active") {
        setTimeout(() => {
          startListening()
        }, 80)
      }
    },
    [stopAudioImmediate, startListening]
  )

  // Natural Human Studio Speech Synthesis with Automatic Turn-Taking
  const speakAloud = useCallback(
    async (textToSpeak: string) => {
      if (typeof window === "undefined" || isMuted) return
      stopAudioImmediate()

      setIsSpeaking(true)
      isSpeakingRef.current = true

      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const res = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: textToSpeak,
            personaId: activeScenarioRef.current.id,
            provider: voiceProvider,
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(`TTS HTTP error ${res.status}`)
        }

        const arrayBuffer = await res.arrayBuffer()

        // Web Audio API playback for lowest latency and instant cutoff
        if (audioContextRef.current) {
          if (audioContextRef.current.state === "suspended") {
            await audioContextRef.current.resume()
          }

          const bufferCopy = arrayBuffer.slice(0)
          const audioBuffer = await audioContextRef.current.decodeAudioData(bufferCopy)

          if (controller.signal.aborted) return

          const sourceNode = audioContextRef.current.createBufferSource()
          sourceNode.buffer = audioBuffer
          sourceNode.connect(audioContextRef.current.destination)
          audioSourceRef.current = sourceNode

          sourceNode.onended = () => {
            setIsSpeaking(false)
            isSpeakingRef.current = false
            audioSourceRef.current = null

            // AUTOMATIC TURN-TAKING: Yield turn to caller when agent finishes speaking
            if (callStateRef.current === "active") {
              setTimeout(() => {
                startListening()
              }, 120)
            }
          }

          sourceNode.start(0)
          return
        }

        // HTMLAudio Fallback
        const blob = new Blob([arrayBuffer], { type: "audio/mpeg" })
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)
        currentAudioRef.current = audio

        audio.onended = () => {
          setIsSpeaking(false)
          isSpeakingRef.current = false
          URL.revokeObjectURL(audioUrl)

          if (callStateRef.current === "active") {
            setTimeout(() => {
              startListening()
            }, 120)
          }
        }
        audio.onerror = () => {
          setIsSpeaking(false)
          isSpeakingRef.current = false
          URL.revokeObjectURL(audioUrl)
        }

        await audio.play()
      } catch (err: any) {
        if (err?.name === "AbortError") return

        console.warn("[Simulator] Studio Neural TTS stream fallback to Web Speech:", err)
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel()
          const utterance = new SpeechSynthesisUtterance(textToSpeak)
          utterance.rate = 1.05
          utterance.onend = () => {
            setIsSpeaking(false)
            isSpeakingRef.current = false
            if (callStateRef.current === "active") {
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
    [isMuted, stopAudioImmediate, voiceProvider, startListening]
  )

  // Scroll transcript container internally on new turns (never scrolls page window)
  useEffect(() => {
    if (!hasUserInteractedRef.current) {
      if (transcript.length > 1 || isThinking) {
        hasUserInteractedRef.current = true
      } else {
        return
      }
    }
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight
    }
  }, [transcript, isThinking])

  // Reactive Waveform Simulation (Clickable to interrupt)
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

      const amplitude =
        callState === "active" ? (isSpeaking ? 36 : isMicListening ? 28 : isThinking ? 18 : 10) : 4
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
            gradient.addColorStop(0, "rgba(168, 85, 247, 0.95)") // Magenta/purple for agent
            gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.9)")
            gradient.addColorStop(1, "rgba(34, 211, 238, 0.95)")
          } else if (isMicListening) {
            gradient.addColorStop(0, "rgba(52, 211, 153, 0.95)") // Emerald/cyan for caller turn
            gradient.addColorStop(0.5, "rgba(34, 211, 238, 0.9)")
            gradient.addColorStop(1, "rgba(16, 185, 129, 0.95)")
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

      phase += callState === "active" ? (isSpeaking ? 0.14 : isMicListening ? 0.11 : 0.07) : 0.02
      animationFrameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationFrameId)
  }, [callState, isThinking, isMicListening, isSpeaking])

  // Setup Browser Speech Recognition with Voice Activity Barge-In
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = false
        recognition.lang = "en-US"

        // Voice Barge-In: if user speaks while agent is speaking, cut audio immediately!
        recognition.onspeechstart = () => {
          if (isSpeakingRef.current) {
            interruptAgent("Caller voice speech detected during playback")
          }
        }

        recognition.onsoundstart = () => {
          if (isSpeakingRef.current) {
            interruptAgent("Caller sound detected during playback")
          }
        }

        recognition.onresult = (event: any) => {
          if (isSpeakingRef.current) {
            interruptAgent("Voice transcript arrived during playback")
          }

          const current = event.resultIndex
          const text = event.results[current][0].transcript
          if (text && text.trim()) {
            handleSendMessage(text.trim())
          }
        }

        recognition.onerror = (event: any) => {
          if (event.error !== "no-speech") {
            console.warn("[Simulator SpeechRecognition] error:", event.error)
          }
          setIsMicListening(false)
          isMicListeningRef.current = false
        }

        recognition.onend = () => {
          setIsMicListening(false)
          isMicListeningRef.current = false
        }

        recognitionRef.current = recognition
      }
    }
  }, [interruptAgent])

  const handleStartCall = () => {
    unlockAudio()
    setCallState("active")
    const greetingTurn = {
      speaker: "agent" as const,
      thought: `NLU Intent: session_start. Loaded ${activeScenario.title} profile.`,
      text: activeScenario.greeting,
    }
    setTranscript([greetingTurn])
    speakAloud(activeScenario.greeting)
  }

  const handleEndCall = () => {
    setCallState("ended")
    stopAudioImmediate()
    stopListening()
  }

  const toggleMicListening = () => {
    unlockAudio()

    // If agent is speaking, clicking mic interrupts agent immediately
    if (isSpeaking) {
      interruptAgent("Caller tapped mic button to interrupt")
      return
    }

    if (!recognitionRef.current) {
      alert("Microphone recognition is supported in modern browsers like Chrome, Edge, and Safari.")
      return
    }

    if (isMicListening) {
      stopListening()
    } else {
      if (callState !== "active") {
        setCallState("active")
        speakAloud(activeScenario.greeting)
      }
      startListening()
    }
  }

  const handleSelectScenario = (scenario: PersonaScenario) => {
    stopAudioImmediate()
    stopListening()
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
        const toolStr = t.toolCall
          ? `\n[Tool Executed: ${t.toolCall.name} -> ${JSON.stringify(t.toolCall.result)}]`
          : ""
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

  // Dynamic Question Answering & Intelligent Tool Execution via /api/chat
  const handleSendMessage = async (textToSend?: string) => {
    unlockAudio()
    const text = (textToSend || customInput).trim()
    if (!text) return

    // Stop previous audio immediately
    stopAudioImmediate()

    setCallState("active")
    const newTurns: PersonaScenario["sampleDialogue"] = [
      ...transcript,
      { speaker: "caller", text },
    ]
    setTranscript(newTurns)
    setCustomInput("")
    setIsThinking(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      // Send real conversational turn to /api/chat with persona context
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newTurns.map((t) => ({
            role: t.speaker === "caller" ? "user" : "assistant",
            content: t.text,
          })),
          personaId: activeScenario.id,
        }),
        signal: controller.signal,
      })

      const data = await res.json()
      const reply =
        data.reply ||
        "Omniweb AI provides sub-250ms conversational turn latency and native tool execution with full CRM synchronization."

      setIsThinking(false)

      const agentTurn: PersonaScenario["sampleDialogue"][0] = {
        speaker: "agent",
        thought:
          data.thought ||
          `NLU Intent: conversational_reasoning. Processed query for ${activeScenario.name}.`,
        toolCall: data.toolCall || {
          name: data.action ? "navigate_site" : "search_knowledge",
          params: { query: text },
          result: { success: true, matched_route: data.action?.href || "/demo" },
        },
        navigation: data.action
          ? {
              title: data.action.label,
              href: data.action.href,
              description: data.action.summary || "Direct platform route.",
            }
          : undefined,
        text: reply,
      }

      setTranscript([...newTurns, agentTurn])

      // Update HUD telemetry
      setActiveAgentHUD((prev) => ({
        ...prev,
        intent: data.thought?.split(".")[0]?.replace("NLU Intent: ", "") || "conversational_turn",
        lastTool: agentTurn.toolCall?.name || "search_knowledge",
      }))

      // Speak aloud in persona voice with turn-taking handoff
      speakAloud(reply)
    } catch (err: any) {
      if (err?.name === "AbortError") return

      console.error("[Simulator] Error calling chat API:", err)
      setIsThinking(false)
      const fallbackText =
        "Omniweb automates customer conversations with sub-250ms latency. How can I help you today?"
      const agentTurn: PersonaScenario["sampleDialogue"][0] = {
        speaker: "agent",
        thought: "NLU Intent: conversational_fallback.",
        text: fallbackText,
      }
      setTranscript([...newTurns, agentTurn])
      speakAloud(fallbackText)
    }
  }

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-slate-950/95 via-[#060c18]/95 to-slate-950/95 p-3.5 sm:p-6 lg:p-8 shadow-2xl shadow-black/80 backdrop-blur-2xl">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3.5 py-1 text-xs sm:text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
            <RadioTower className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            Live Voice Studio
          </div>
          <h2 className="mt-2.5 text-2xl font-bold tracking-tight text-white lg:text-3xl">
            Autonomous Contact Center & Site AI Concierge
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-slate-300">
            Powered by <strong className="text-white">LiveKit OSS</strong> WebRTC media transport,{" "}
            <strong className="text-white">Deepgram Aura & Nova-3</strong> Studio Neural Voice, and{" "}
            <strong className="text-white">LangGraph</strong> multi-agent swarms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Voice Model Provider Switcher */}
          <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-1">
            <button
              onClick={() => setVoiceProvider("deepgram")}
              className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                voiceProvider === "deepgram"
                  ? "bg-cyan-500 text-black font-semibold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🎙️ Deepgram Aura
            </button>
            <button
              onClick={() => setVoiceProvider("elevenlabs")}
              className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                voiceProvider === "elevenlabs"
                  ? "bg-purple-500 text-white font-semibold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ✨ ElevenLabs
            </button>
          </div>

          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 py-1.5 px-3 text-xs sm:text-sm font-medium"
          >
            <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            LiveKit OSS (WebRTC Active)
          </Badge>
        </div>
      </div>

      {/* Persona / Scenario Selector */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
            Select Specialist Persona & Scenario
          </label>
          <span className="text-xs sm:text-sm text-cyan-400 font-semibold">4 Active Swarms Available</span>
        </div>
        <div className="mt-3 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {SCENARIOS.map((scenario) => {
            const isSelected = scenario.id === activeScenario.id
            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario)}
                className={`flex flex-col items-start rounded-2xl border p-4 sm:p-5 text-left transition-all ${
                  isSelected
                    ? "border-cyan-400/60 bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-transparent shadow-lg shadow-cyan-500/15"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {scenario.name}
                  </span>
                  {isSelected ? (
                    <span className="h-3 w-3 shrink-0 rounded-full bg-cyan-400 ring-4 ring-cyan-400/25" />
                  ) : (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-white/25" />
                  )}
                </div>
                <span className="mt-1 text-sm font-semibold text-cyan-300">{scenario.title}</span>
                <span className="mt-2.5 text-sm leading-relaxed text-slate-300">{scenario.description}</span>
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
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/90 p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
                    isSpeaking
                      ? "border-purple-400/50 bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/30 scale-105"
                      : isMicListening
                      ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/30"
                      : "border-cyan-400/30 bg-cyan-500/10 text-cyan-400 shadow-md"
                  }`}
                >
                  <Bot className="h-6 w-6" />
                  {callState === "active" && (
                    <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                      <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                          isSpeaking ? "bg-purple-400" : isMicListening ? "bg-emerald-400" : "bg-cyan-400"
                        }`}
                      />
                      <span
                        className={`relative inline-flex h-3.5 w-3.5 rounded-full ${
                          isSpeaking ? "bg-purple-500" : isMicListening ? "bg-emerald-500" : "bg-cyan-500"
                        }`}
                      />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                    {activeScenario.name}
                    {isSpeaking && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300">
                        <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                        Speaking
                      </span>
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {voiceProvider === "deepgram" ? activeScenario.voiceName : "ElevenLabs Turbo v2.5"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm font-semibold ${
                    wasInterrupted
                      ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
                      : callState === "active"
                      ? isSpeaking
                        ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40"
                        : "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                      : callState === "connecting"
                      ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      wasInterrupted
                        ? "bg-amber-400 animate-bounce"
                        : callState === "active"
                        ? isSpeaking
                          ? "bg-purple-400 animate-ping"
                          : "bg-emerald-400 animate-pulse"
                        : "bg-slate-500"
                    }`}
                  />
                  {wasInterrupted
                    ? "INTERRUPTED"
                    : callState === "active"
                    ? isSpeaking
                      ? "AGENT SPEAKING"
                      : "YOUR TURN (CALL LIVE)"
                    : callState === "connecting"
                    ? "CONNECTING LIVEKIT..."
                    : "IDLE"}
                </span>
              </div>
            </div>

            {/* Reactive Waveform Canvas (Clickable to interrupt) */}
            <div
              onClick={() => {
                if (isSpeaking) {
                  interruptAgent("User clicked waveform canvas")
                }
              }}
              className={`mt-5 rounded-2xl border transition-all p-3 cursor-pointer ${
                isSpeaking
                  ? "border-purple-500/40 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:border-purple-400"
                  : isMicListening
                  ? "border-emerald-500/30 bg-emerald-950/20"
                  : "border-white/5 bg-slate-950/80"
              }`}
              title={isSpeaking ? "Click to interrupt agent" : "Waveform active"}
            >
              <canvas ref={canvasRef} width={380} height={70} className="w-full h-[70px]" />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-cyan-400" />
                  LiveKit: {livekitMode === "oss" ? "OSS (WebRTC sub-250ms)" : "Cloud"}
                </span>
                <span className="flex items-center gap-1">
                  <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                  Neural Voice:{" "}
                  {wasInterrupted
                    ? "Interrupted — yielding floor"
                    : isSpeaking
                    ? "Deepgram Aura (tap to cut in)"
                    : isMicListening
                    ? "Mic Active (Your Turn)"
                    : "Ready"}
                </span>
              </div>
            </div>

            {/* Call Control Buttons & Live Mic Streaming */}
            <div className="mt-6 flex flex-col gap-3">
              {/* Dynamic Instant Barge-In / Interrupt Button */}
              {isSpeaking && (
                <button
                  type="button"
                  onClick={() => interruptAgent("User clicked Interrupt Agent button")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 py-3 text-sm font-bold text-white shadow-xl shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-95 animate-pulse"
                >
                  <Square className="h-4 w-4 fill-current" />
                  Interrupt Agent (Yield Floor to You)
                </button>
              )}

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
                      title={
                        isSpeaking
                          ? "Interrupt agent"
                          : isMicListening
                          ? "Mute Microphone"
                          : "Unmute / Speak into Mic"
                      }
                      className={`h-12 w-12 rounded-2xl border-white/10 transition-all ${
                        isSpeaking
                          ? "bg-purple-600 text-white animate-pulse"
                          : isMicListening
                          ? "bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-400 animate-pulse"
                          : "bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      {isSpeaking ? (
                        <Zap className="h-5 w-5 text-amber-300 animate-bounce" />
                      ) : isMicListening ? (
                        <Mic className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <MicOff className="h-5 w-5" />
                      )}
                    </Button>
                  </>
                )}
              </div>

              {callState === "active" && (
                <p className="text-center text-xs sm:text-sm text-slate-300">
                  {wasInterrupted ? (
                    <span className="text-amber-300 font-semibold flex items-center justify-center gap-1">
                      <Zap className="h-3.5 w-3.5 animate-bounce" />
                      Interrupted — listening to you now...
                    </span>
                  ) : isSpeaking ? (
                    <span className="text-purple-300 font-medium">
                      🔊 Agent is speaking... Speak or tap "Interrupt" anytime to cut in.
                    </span>
                  ) : isMicListening ? (
                    <span className="text-emerald-400 font-medium flex items-center justify-center gap-1.5">
                      <Radio className="h-3.5 w-3.5 animate-pulse" />
                      Your turn: Listening to microphone... Speak naturally!
                    </span>
                  ) : (
                    <span>Click the microphone button to speak or use the suggested questions below.</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Quick Scenario Suggested Prompts */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h4 className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Suggested Test Questions & Actions
            </h4>
            <div className="mt-3 space-y-2">
              {activeScenario.suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left text-sm text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-white group"
                >
                  <span className="group-hover:text-cyan-200">"{prompt}"</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-cyan-400" />
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
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">
                <Zap className="h-4 w-4 text-purple-400" />
                LangGraph State & Tool Execution HUD
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                Deterministic Policy Plane
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                <span className="text-xs uppercase font-medium text-slate-400">Active Agent</span>
                <p className="mt-1 text-sm font-semibold text-cyan-300 truncate">{activeAgentHUD.activeAgent}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                <span className="text-xs uppercase font-medium text-slate-400">Sentiment</span>
                <p className="mt-1 text-sm font-semibold text-emerald-300 capitalize">{activeAgentHUD.sentiment}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                <span className="text-xs uppercase font-medium text-slate-400">Turn Latency</span>
                <p className="mt-1 text-sm font-semibold text-amber-300">{activeScenario.latencyMs}ms</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                <span className="text-xs uppercase font-medium text-slate-400">Active Tool</span>
                <p className="mt-1 text-sm font-semibold text-violet-300 truncate">{activeAgentHUD.lastTool}()</p>
              </div>
            </div>
          </div>

          {/* Dual-Channel Live Transcript Box */}
          <div className="flex flex-col h-[440px] rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-950/90 p-3.5 sm:p-5 shadow-2xl">
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Live Dual-Channel Speech Transcript
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                  {transcript.length} turns
                </span>
              </div>

              {/* Transcript Actions (Copy & Download) */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyTranscript}
                  className="h-8 rounded-lg border-white/10 bg-white/5 px-3 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  {copiedTranscript ? (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3.5 w-3.5" />
                      Copy Transcript
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadTranscript}
                  className="h-8 rounded-lg border-white/10 bg-white/5 px-3 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <Download className="mr-1 h-3.5 w-3.5" />
                  JSON
                </Button>
              </div>
            </div>

            {/* Message Stream */}
            <div ref={transcriptContainerRef} className="mt-4 flex-1 space-y-4 overflow-y-auto pr-2">
              {transcript.map((turn, idx) => (
                <div key={idx} className={`flex flex-col ${turn.speaker === "caller" ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    {turn.speaker === "caller" ? (
                      <>
                        <span>Caller (Live Microphone / WebRTC)</span>
                        <User className="h-3.5 w-3.5 text-cyan-400" />
                      </>
                    ) : (
                      <>
                        <Bot className="h-3.5 w-3.5 text-purple-400" />
                        <span className="text-purple-300">{activeScenario.name} (AI Specialist)</span>
                      </>
                    )}
                  </div>

                  {/* Agent Internal Thought / Tool Calling Bubble */}
                  {turn.thought && (
                    <div className="mb-1.5 max-w-[90%] rounded-xl border border-purple-500/20 bg-purple-950/40 p-3 text-xs sm:text-sm text-purple-200">
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-purple-300">
                        <Activity className="h-3.5 w-3.5" />
                        [Agent Brain Trace]
                      </div>
                      <p className="mt-1 font-mono text-purple-200/90 leading-relaxed">{turn.thought}</p>

                      {turn.toolCall && (
                        <div className="mt-2 rounded-lg bg-black/40 p-2 font-mono text-xs">
                          <span className="text-cyan-400 font-semibold">➔ Tool Execution: {turn.toolCall.name}()</span>
                          <div className="text-slate-300 mt-0.5">Payload: {JSON.stringify(turn.toolCall.params)}</div>
                          <div className="text-emerald-400 mt-0.5">Output: {JSON.stringify(turn.toolCall.result)}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Spoken Turn Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed ${
                      turn.speaker === "caller"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md shadow-cyan-600/20"
                        : "border border-white/10 bg-slate-900 text-slate-100 rounded-tl-none"
                    }`}
                  >
                    {turn.text}
                  </div>

                  {/* Interactive Site Navigation Action Card */}
                  {turn.navigation && (
                    <div className="mt-2 max-w-[85%] rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 p-3.5 shadow-lg shadow-cyan-950/30">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Compass className="h-5 w-5 text-cyan-400 shrink-0 animate-spin-slow" />
                          <div>
                            <p className="text-sm font-semibold text-white">{turn.navigation.title}</p>
                            {turn.navigation.description && (
                              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{turn.navigation.description}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          className="h-8 rounded-xl bg-cyan-500 px-3.5 text-xs sm:text-sm font-semibold text-black hover:bg-cyan-400 shrink-0"
                        >
                          <Link href={turn.navigation.href}>
                            Visit Page
                            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-400 animate-pulse py-2">
                  <Bot className="h-4 w-4" />
                  <span>Agent is reasoning and executing tools...</span>
                </div>
              )}
            </div>

            {/* Text Input Row for testing */}
            <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
              <input
                type="text"
                value={customInput}
                onChange={(e) => {
                  if (isSpeaking) interruptAgent("Caller started typing")
                  setCustomInput(e.target.value)
                }}
                onFocus={() => {
                  unlockAudio()
                  if (isSpeaking) interruptAgent("Caller focused input box")
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about Omniweb services, pricing, or say 'Take me to Shopify'..."
                className="h-11 flex-1 rounded-xl border border-white/10 bg-slate-900 px-3.5 sm:px-4 text-base sm:text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
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
              <h4 className="text-base font-semibold text-white">Supervisor Intervention HUD</h4>
              <p className="text-xs sm:text-sm text-slate-400">
                Live supervisor monitoring, whisper coaching, and warm transfer controls
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={supervisorMode === "monitor" ? "default" : "outline"}
              onClick={() => setSupervisorMode("monitor")}
              className={
                supervisorMode === "monitor"
                  ? "bg-amber-500 text-black hover:bg-amber-400 text-xs sm:text-sm font-semibold"
                  : "border-white/10 text-white text-xs sm:text-sm"
              }
            >
              Listen-In (Silent)
            </Button>
            <Button
              size="sm"
              variant={supervisorMode === "whisper" ? "default" : "outline"}
              onClick={() => setSupervisorMode("whisper")}
              className={
                supervisorMode === "whisper"
                  ? "bg-cyan-500 text-black hover:bg-cyan-400 text-xs sm:text-sm font-semibold"
                  : "border-white/10 text-white text-xs sm:text-sm"
              }
            >
              Whisper Coach
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => alert("Barge-In Mode Activated: Supervisor audio unmuted to caller.")}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold"
            >
              Barge-In Takeover
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
