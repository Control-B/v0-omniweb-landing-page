"use client"

import { useEffect, useRef, useState } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Flame,
  Headphones,
  Info,
  Mic,
  MicOff,
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
  suggestedPrompts: string[]
  sampleDialogue: Array<{
    speaker: "caller" | "agent"
    text: string
    thought?: string
    toolCall?: { name: string; params: Record<string, any>; result: Record<string, any> }
  }>
}

export const SCENARIOS: PersonaScenario[] = [
  {
    id: "billing-investigation",
    name: "Alex Vance",
    title: "Senior Billing & Disputes Specialist",
    industry: "SaaS & Enterprise Telecom",
    avatarTone: "cyan",
    voiceName: "Deepgram Nova-3 + Cartesia Studio Voice",
    latencyMs: 240,
    description: "Resolves high-value billing disputes, reconciles historical invoice ledgers, and handles refund policies with Human-in-the-Loop governance.",
    suggestedPrompts: [
      "Can you explain why my invoice was $299 this month instead of $199?",
      "I was double billed during our migration, can I get a $150 credit?",
      "What is your refund policy if we cancel before the renewal date?",
    ],
    sampleDialogue: [
      {
        speaker: "caller",
        text: "Hi, I noticed a $299 charge on my account today and I wanted to know what caused the rate increase.",
      },
      {
        speaker: "agent",
        thought: "NLU Intent: billing_inquiry (high confidence 0.98). Calling lookup_customer and get_invoices to inspect active subscription and ledger.",
        toolCall: {
          name: "get_invoices",
          params: { customer_id: "cust_849201", limit: 2 },
          result: {
            status: "paid",
            invoice_id: "INV-2026-0881",
            amount: 299.0,
            items: ["Omniweb AI Contact Center (10 Agents)", "Twilio SIP Inbound Minutes (2,400 min)"],
          },
        },
        text: "Hello! I have your account open in front of me. Your base plan is $199 for 10 autonomous agents, and the additional $100 corresponds to 2,400 inbound telephony minutes utilized during your recent marketing campaign.",
      },
      {
        speaker: "caller",
        text: "Got it! Could you issue a $150 courtesy credit since we had downtime on Tuesday?",
      },
      {
        speaker: "agent",
        thought: "NLU Intent: refund_request ($150.00). Policy Engine flags HIGH_RISK (limit: $50). Triggering Human-in-the-Loop approval gate.",
        toolCall: {
          name: "request_refund",
          params: { customer_id: "cust_849201", amount: 150.0, reason: "Downtime credit request" },
          result: { status: "pending_human_approval", approval_id: "appr_98a42f", message: "Dispatched to Supervisor War Room" },
        },
        text: "I completely understand and apologize for that downtime. Because this request is for $150, I have dispatched an instant authorization ticket directly to our shift supervisor. You will receive an SMS confirmation the moment it is approved!",
      },
    ],
  },
  {
    id: "emergency-dispatch",
    name: "Sophia Martinez",
    title: "Emergency Dispatch & Triage Coordinator",
    industry: "Home Services & Emergency HVAC",
    avatarTone: "rose",
    voiceName: "ElevenLabs Ultra-Low Latency Turbo v2.5",
    latencyMs: 210,
    description: "24/7 emergency triage that screens urgency, geo-routes technicians, and dispatches rapid response teams in under 60 seconds.",
    suggestedPrompts: [
      "Our commercial freezer stopped cooling and we have $40k of inventory at risk!",
      "I have water flooding my basement from a burst pipe, need help now!",
      "What is your emergency dispatch callout rate for after-hours service?",
    ],
    sampleDialogue: [
      {
        speaker: "caller",
        text: "Emergency! Our commercial cooling unit died and temperatures are rising fast!",
      },
      {
        speaker: "agent",
        thought: "NLU Urgency: CRITICAL. Intent: emergency_dispatch. Extracting location and assigning nearest Tier-1 on-call technician.",
        toolCall: {
          name: "create_ticket",
          params: { category: "hardware_emergency", severity: "critical", issue_summary: "Commercial cooling failure" },
          result: { ticket_id: "TICK-EMERG-492", assigned_queue: "Immediate On-Call Dispatch", sla_hours: 1 },
        },
        text: "I am treating this with highest urgency. I have locked in Emergency Ticket #492 and alerted our nearest on-call commercial technician in your zone. They are en route with an estimated ETA of 28 minutes. Can I confirm your street address?",
      },
    ],
  },
  {
    id: "high-ticket-closer",
    name: "Marcus Vance",
    title: "Enterprise Solutions & Closing Specialist",
    industry: "B2B SaaS & Automation",
    avatarTone: "emerald",
    voiceName: "Gemini 2.0 Multimodal Live Voice",
    latencyMs: 195,
    description: "Qualifies high-intent inbound prospects, analyzes seat replacement ROI, and schedules executive product walkthroughs.",
    suggestedPrompts: [
      "We operate a 50-person call center costing $180k/mo. How does Omniweb compare?",
      "Can we integrate Omniweb with Salesforce CRM and custom SIP trunks?",
      "I want to book an executive demo for our leadership team next Tuesday at 2pm.",
    ],
    sampleDialogue: [
      {
        speaker: "caller",
        text: "We currently have 50 human agents handling customer service and want to explore autonomous AI swarms. What is the pricing and migration timeline?",
      },
      {
        speaker: "agent",
        thought: "NLU Intent: sales_qualification. High-value opportunity (50 seats). Calling CRM lead creation and checking executive calendar availability.",
        toolCall: {
          name: "create_lead",
          params: { caller_name: "Enterprise Prospect", intent: "50-Seat Call Center Migration", budget_range: "$5,000+/mo", urgency: "high" },
          result: { lead_id: "lead_88492", status: "enterprise_qualified", lead_score: 0.96 },
        },
        text: "At 50 seats, Omniweb typically reduces monthly operational spend from roughly $175,000 down to under $4,200 while eliminating hold times completely. I have reserved an executive architecture briefing for your team—would Tuesday at 2:00 PM EST work for you?",
      },
    ],
  },
]

export function LiveCallCenterSimulator() {
  const [activeScenario, setActiveScenario] = useState<PersonaScenario>(SCENARIOS[0])
  const [callState, setCallState] = useState<"idle" | "connecting" | "active" | "ended">("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [transcript, setTranscript] = useState<PersonaScenario["sampleDialogue"]>(SCENARIOS[0].sampleDialogue)
  const [customInput, setCustomInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [activeAgentHUD, setActiveAgentHUD] = useState({
    activeAgent: "Alex Vance (Billing Specialist)",
    intent: "billing_inquiry",
    confidence: 0.98,
    sentiment: "positive",
    urgency: "medium",
    lastTool: "get_invoices",
    turnLatency: "240ms",
  })
  const [supervisorMode, setSupervisorMode] = useState<"monitor" | "whisper" | "barge">("monitor")
  const [whisperText, setWhisperText] = useState("")
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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

      const amplitude = callState === "active" ? (isThinking ? 18 : 26) : 4
      const bars = 48
      const barWidth = width / bars

      for (let i = 0; i < bars; i++) {
        const x = i * barWidth
        const sinVal = Math.sin(phase + i * 0.28)
        const cosVal = Math.cos(phase * 1.4 + i * 0.15)
        const barHeight = Math.abs(sinVal * cosVal * amplitude) + 4

        const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight)
        if (callState === "active") {
          gradient.addColorStop(0, "rgba(34, 211, 238, 0.9)")
          gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.9)")
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.9)")
        } else {
          gradient.addColorStop(0, "rgba(148, 163, 184, 0.3)")
          gradient.addColorStop(1, "rgba(100, 116, 139, 0.2)")
        }

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x + 2, centerY - barHeight / 2, barWidth - 4, barHeight, 3)
        ctx.fill()
      }

      phase += callState === "active" ? 0.08 : 0.02
      animationFrameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationFrameId)
  }, [callState, isThinking])

  const handleStartCall = () => {
    setCallState("connecting")
    setTimeout(() => {
      setCallState("active")
      setTranscript(activeScenario.sampleDialogue)
    }, 900)
  }

  const handleEndCall = () => {
    setCallState("ended")
  }

  const handleSelectScenario = (scenario: PersonaScenario) => {
    setActiveScenario(scenario)
    setTranscript(scenario.sampleDialogue)
    if (callState === "ended") setCallState("idle")
  }

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || customInput
    if (!text.trim()) return

    setCallState("active")
    const newTurns: PersonaScenario["sampleDialogue"] = [
      ...transcript,
      { speaker: "caller", text },
    ]
    setTranscript(newTurns)
    setCustomInput("")
    setIsThinking(true)

    // Simulate AI Agent Reasoning & Response
    setTimeout(() => {
      setIsThinking(false)
      let agentTurn: PersonaScenario["sampleDialogue"][0]

      if (text.toLowerCase().includes("book") || text.toLowerCase().includes("appointment") || text.toLowerCase().includes("tuesday")) {
        agentTurn = {
          speaker: "agent",
          thought: "NLU Intent: appointment_booking. Invoking check_availability and book_appointment tool contracts.",
          toolCall: {
            name: "book_appointment",
            params: { appointment_date: "Next Tuesday", appointment_time: "2:00 PM EST", topic: "Executive Briefing" },
            result: { booking_id: "cal_84920", confirmed_time: "Next Tuesday at 2:00 PM EST", calendar_invite_sent: true },
          },
          text: "I have confirmed and booked your executive briefing for next Tuesday at 2:00 PM EST. Calendar invites and preparation context have been sent to your email!",
        }
      } else if (text.toLowerCase().includes("refund") || text.toLowerCase().includes("credit") || text.toLowerCase().includes("$")) {
        agentTurn = {
          speaker: "agent",
          thought: "NLU Intent: refund_request. Amount exceeds automatic threshold. Triggering Human-in-the-Loop policy approval.",
          toolCall: {
            name: "request_refund",
            params: { amount: 150.0, reason: "Customer dispute request" },
            result: { status: "pending_human_approval", approval_id: "appr_0918c" },
          },
          text: "I have logged that request into our supervisor queue with Priority 1. Our shift supervisor has been alerted and will confirm the credit momentarily.",
        }
      } else {
        agentTurn = {
          speaker: "agent",
          thought: "NLU Intent: general_inquiry. Searching tenant-isolated knowledge base (pgvector) for accurate grounding.",
          toolCall: {
            name: "search_knowledge",
            params: { query: text },
            result: { total_found: 2, top_chunk: "Omniweb Autonomous Contact Center SLA commitments" },
          },
          text: "Omniweb's autonomous contact center provides sub-300ms conversational turn latency, 99.8% first-contact resolution, and native tool execution with full CRM synchronization.",
        }
      }

      setTranscript([...newTurns, agentTurn])
    }, 1100)
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
            Autonomous Contact Center Simulator
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Test real-time conversational voice turns, dual-channel speaker diarization, live tool calls, and supervisor monitoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            LiveKit WebRTC Active
          </Badge>
          <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            Latency: {activeScenario.latencyMs}ms
          </Badge>
        </div>
      </div>

      {/* Persona / Scenario Selector */}
      <div className="mt-6">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Select Specialist Persona & Scenario</label>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
                  <span className="font-semibold text-white">{scenario.name}</span>
                  {isSelected && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
                </div>
                <span className="mt-0.5 text-xs text-cyan-300">{scenario.title}</span>
                <span className="mt-2 text-[11px] text-slate-400 line-clamp-2">{scenario.description}</span>
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
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400 shadow-md">
                  <Bot className="h-6 w-6" />
                  {callState === "active" && (
                    <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500" />
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{activeScenario.name}</h3>
                  <p className="text-xs text-slate-400">{activeScenario.voiceName}</p>
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
                  {callState === "active" ? "CALL IN PROGRESS" : callState === "connecting" ? "CONNECTING SIP..." : "IDLE"}
                </span>
              </div>
            </div>

            {/* Reactive Waveform Canvas */}
            <div className="mt-5 rounded-2xl border border-white/5 bg-slate-950/80 p-3">
              <canvas ref={canvasRef} width={380} height={70} className="w-full h-[70px]" />
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Audio: 24kHz Opus / WebRTC</span>
                <span>VAD: Silero Active</span>
              </div>
            </div>

            {/* Call Control Buttons */}
            <div className="mt-6 flex items-center justify-center gap-4">
              {callState !== "active" ? (
                <Button
                  size="lg"
                  onClick={handleStartCall}
                  className="h-13 flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-cyan-400"
                >
                  <PhoneCall className="mr-2 h-5 w-5 animate-bounce" />
                  Start Inbound Call
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={handleEndCall}
                    className="h-12 flex-1 rounded-2xl bg-rose-600 font-semibold text-white hover:bg-rose-500"
                  >
                    <PhoneOff className="mr-2 h-5 w-5" />
                    Hang Up Call
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`h-12 w-12 rounded-2xl border-white/10 ${isMuted ? "bg-rose-500/20 text-rose-300" : "bg-white/5 text-white"}`}
                  >
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Quick Scenario Suggested Prompts */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Suggested Test Prompts
            </h4>
            <div className="mt-3 space-y-2">
              {activeScenario.suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left text-xs text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-white"
                >
                  <span>"{prompt}"</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
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
                Agent Brain Reasoning & Tool Execution HUD
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
                LangGraph State Machine
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                <span className="text-[10px] uppercase text-slate-400">Intent</span>
                <p className="mt-1 font-semibold text-cyan-300 truncate">{activeAgentHUD.intent}</p>
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
                <p className="mt-1 font-semibold text-violet-300 truncate">crm.lookup()</p>
              </div>
            </div>
          </div>

          {/* Dual-Channel Live Transcript Box */}
          <div className="flex flex-col h-[380px] rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Live Dual-Channel Speech Transcript
              </span>
              <span className="text-xs text-slate-400">{transcript.length} turns recorded</span>
            </div>

            {/* Message Stream */}
            <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-2">
              {transcript.map((turn, idx) => (
                <div key={idx} className={`flex flex-col ${turn.speaker === "caller" ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                    {turn.speaker === "caller" ? (
                      <>
                        <span>Caller (+1 555-234-5678)</span>
                        <User className="h-3 w-3 text-cyan-400" />
                      </>
                    ) : (
                      <>
                        <Bot className="h-3 w-3 text-purple-400" />
                        <span className="text-purple-300">{activeScenario.name} (AI Agent)</span>
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
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse py-2">
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
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message to speak to the AI agent..."
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
