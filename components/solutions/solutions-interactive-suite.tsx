"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Mic,
  Pause,
  PhoneCall,
  Play,
  Shield,
  Sparkles,
  Volume2,
  VolumeX,
  Workflow,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const INDUSTRY_VOICE_SAMPLES = [
  {
    id: "contractor",
    industry: "Contractors & Trades",
    voiceName: "Orion",
    tone: "Decisive, Professional & Direct",
    accentColor: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    bgGradient: "from-cyan-500/10 to-blue-600/10",
    transcript: [
      { speaker: "AI (Orion)", text: "Thanks for calling Precision Roofing & Gutters. My name is Orion. Are you calling regarding an emergency leak repair, or to schedule a free inspection?" },
      { speaker: "Caller", text: "Hi, yeah, we had heavy wind last night and some shingles blew off near the chimney." },
      { speaker: "AI (Orion)", text: "I can help with that immediately. Let me verify your service zip code so I can dispatch our on-call crew. What is your address or zip?" },
      { speaker: "Caller", text: "It's 75201 in Dallas." },
      { speaker: "AI (Orion)", text: "Perfect, we have a technician in North Dallas today. I have an emergency inspection window between 1:00 PM and 3:00 PM today, or tomorrow morning at 9:00 AM. Which works better for you?" },
    ],
    metrics: { pickupTime: "1.2s", qualificationAccuracy: "99.4%", bookedRate: "+42%" },
  },
  {
    id: "ecommerce",
    industry: "E-Commerce & Shopify",
    voiceName: "Luna",
    tone: "Consultative, Upbeat & Knowledgeable",
    accentColor: "text-orange-400",
    borderColor: "border-orange-500/30",
    bgGradient: "from-orange-500/10 to-pink-600/10",
    transcript: [
      { speaker: "AI (Luna)", text: "Hi there! Welcome to Urban Chic Support. I'm Luna. I can help with sizing recommendations, tracking an active order, or return policies. What can I check for you?" },
      { speaker: "Caller", text: "Hey Luna, I'm looking at the Merino Wool Overcoat. Does it run true to size, or should I size up for layering?" },
      { speaker: "AI (Luna)", text: "Great question! That coat has a tailored European cut. If you plan to wear thick sweaters underneath, we recommend sizing up one size. Also, orders placed today qualify for free expedited 2-day shipping!" },
      { speaker: "Caller", text: "Awesome, does it qualify for free returns if it doesn't fit?" },
      { speaker: "AI (Luna)", text: "Yes, 100%! We provide pre-paid return labels within 30 days. Would you like me to send a 15% VIP discount code directly to your phone right now?" },
    ],
    metrics: { pickupTime: "0.8s", qualificationAccuracy: "98.7%", bookedRate: "+31% Cart Recovery" },
  },
  {
    id: "healthcare",
    industry: "Healthcare & Dental",
    voiceName: "Athena",
    tone: "Empathetic, Reassuring & HIPAA-Conscious",
    accentColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgGradient: "from-emerald-500/10 to-teal-600/10",
    transcript: [
      { speaker: "AI (Athena)", text: "Good afternoon, thank you for calling Summit Family Dental. This is Athena. Are you an existing patient, or would you like to schedule a first-time appointment?" },
      { speaker: "Caller", text: "Hi, I have a broken molar that started throbbing this morning." },
      { speaker: "AI (Athena)", text: "I'm so sorry you're in pain. We reserve priority emergency slots daily for acute discomfort. Dr. Summit has an opening today at 3:15 PM or tomorrow at 8:30 AM. Can you make it in at 3:15?" },
      { speaker: "Caller", text: "Yes, 3:15 PM today would be a lifesaver." },
      { speaker: "AI (Athena)", text: "You're booked for 3:15 PM. I'm sending your digital intake link by SMS now so you won't need to fill out paperwork when you arrive. If swelling worsens before then, please call us back immediately." },
    ],
    metrics: { pickupTime: "1.1s", qualificationAccuracy: "100%", bookedRate: "-55% No-Shows" },
  },
  {
    id: "legal",
    industry: "Legal & Financial",
    voiceName: "Helios",
    tone: "Authoritative, Confidential & Thorough",
    accentColor: "text-violet-400",
    borderColor: "border-violet-500/30",
    bgGradient: "from-violet-500/10 to-purple-600/10",
    transcript: [
      { speaker: "AI (Helios)", text: "Thank you for reaching Apex Legal Partners. I am Helios, an AI intake assistant. All information shared is held strictly confidential. What type of legal matter are you inquiring about?" },
      { speaker: "Caller", text: "I was involved in a commercial truck accident on I-35 last Tuesday and the other insurer is calling me." },
      { speaker: "AI (Helios)", text: "Understood. First, we strongly advise not signing any statements until our attorneys review the crash report. Were there any medical treatments or emergency admissions following the collision?" },
      { speaker: "Caller", text: "Yes, I was taken to the ER for a fractured collarbone." },
      { speaker: "AI (Helios)", text: "This qualifies for an immediate free case review with our Senior Partner, Attorney Vance. I am paging him now for a direct callback within 15 minutes. May I confirm your primary mobile number?" },
    ],
    metrics: { pickupTime: "0.9s", qualificationAccuracy: "99.8%", bookedRate: "+68% Case Intake" },
  },
]

export const INDUSTRY_ROI_PROFILES = [
  {
    name: "Contractors & Trades (Roofing, HVAC, Plumbing)",
    avgTicket: 1800,
    monthlyVolume: 450,
    conversionLift: 0.35,
    description: "High-ticket emergency jobs where the first contractor to pick up wins the deal.",
  },
  {
    name: "E-Commerce & DTC Brands",
    avgTicket: 140,
    monthlyVolume: 8000,
    conversionLift: 0.18,
    description: "High-traffic web stores recovering abandoned carts with real-time pre-purchase advice.",
  },
  {
    name: "Healthcare & Dental Clinics",
    avgTicket: 2200,
    monthlyVolume: 650,
    conversionLift: 0.28,
    description: "Multi-provider practices eliminating after-hours voicemail leakage and patient no-shows.",
  },
  {
    name: "Legal & Financial Services",
    avgTicket: 4200,
    monthlyVolume: 320,
    conversionLift: 0.45,
    description: "High-value intake qualification where every captured lead represents thousands in retainer fees.",
  },
  {
    name: "Agencies & Professional Studios",
    avgTicket: 3500,
    monthlyVolume: 500,
    conversionLift: 0.30,
    description: "Consultative agencies qualifying budget, timeline, and scope automatically 24/7.",
  },
]

export const QUALIFICATION_WORKFLOWS = [
  {
    industry: "Contractors & Home Services",
    steps: [
      { step: "01", title: "Sub-250ms Instant Pickup", desc: "No hold music. The AI answers in the customer's native tone immediately." },
      { step: "02", title: "Service Area Verification", desc: "Instantly checks zip code against active crew travel boundaries via API." },
      { step: "03", title: "Scope & Urgency Intake", desc: "Determines emergency status, job scope, property type, and budget expectations." },
      { step: "04", title: "Cal.com Dispatch & SMS", desc: "Locks an inspection slot, syncs to CRM (Jobber / ServiceTitan), and triggers instant SMS confirmation." },
    ],
  },
  {
    industry: "E-Commerce & Shopify",
    steps: [
      { step: "01", title: "Cart & Browse Detection", desc: "Triggers on exit-intent or product page hesitation with personalized product context." },
      { step: "02", title: "Live Catalog & Inventory RAG", desc: "Answers sizing, fabric, return policy, and stock levels in under 200ms." },
      { step: "03", title: "Incentive & Objection Handling", desc: "Offers dynamic discounts or reassurance on shipping timelines to close checkout." },
      { step: "04", title: "Order Sync & Post-Purchase", desc: "Pushes checkout recovery signals to Klaviyo and creates automated follow-up sequences." },
    ],
  },
  {
    industry: "Healthcare & Dental",
    steps: [
      { step: "01", title: "Compassionate Triage", desc: "Greets patient warmly, assesses acute pain levels, and flags emergency keywords." },
      { step: "02", title: "Insurance & Provider Match", desc: "Validates in-network carrier eligibility and matches with the correct physician." },
      { step: "03", title: "Slot Allocation & Intake Link", desc: "Books the EHR calendar (Dentrix / Epic) and sends SMS intake forms beforehand." },
      { step: "04", title: "Automated Reminder Loops", desc: "Conducts conversational confirmation calls 24h prior, cutting no-shows by 55%." },
    ],
  },
]

export function IndustryVoiceSamplePlayer() {
  const [activeVoice, setActiveVoice] = useState(INDUSTRY_VOICE_SAMPLES[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 2
        })
      }, 100)
    } else {
      setProgress(0)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <div className="rounded-3xl sm:rounded-[2.5rem] border border-white/10 bg-[#08101f]/90 p-4 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-2xl">
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-cyan-300">
          <Headphones className="h-3.5 w-3.5" />
          Ultra-Low Latency Voice Preview
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
          Hear Autonomous Voice Agents in Action
        </h2>
        <p className="mt-3 text-sm text-slate-300">
          Powered by Deepgram Aura streaming voices and Gemini 2.0 reasoning. Sub-250ms latency with zero robotic delays.
        </p>
      </div>

      {/* Voice Selection Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {INDUSTRY_VOICE_SAMPLES.map((sample) => {
          const isActive = sample.id === activeVoice.id
          return (
            <button
              key={sample.id}
              onClick={() => {
                setActiveVoice(sample)
                setIsPlaying(false)
              }}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-300"
                  : "border border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              <span>{sample.industry}</span>
              <span className="text-[10px] opacity-75">({sample.voiceName})</span>
            </button>
          )
        })}
      </div>

      {/* Active Voice Player Card */}
      <div className={`rounded-2xl border ${activeVoice.borderColor} bg-gradient-to-br ${activeVoice.bgGradient} p-4 sm:p-6 lg:p-8`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{activeVoice.voiceName} Voice Agent</h3>
              <span className={`text-xs font-bold uppercase tracking-wider ${activeVoice.accentColor}`}>
                • {activeVoice.industry}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300">{activeVoice.tone}</p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Waveform Animation */}
            <div className="flex items-center gap-1 h-9 px-2.5 sm:px-3 rounded-lg bg-black/40 border border-white/10">
              {[40, 75, 95, 60, 85, 45, 90, 65, 30, 80].map((height, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPlaying ? "bg-cyan-400 animate-pulse" : "bg-white/20"
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(20, (height * (progress % 50)) / 25)}%` : "25%",
                  }}
                />
              ))}
            </div>

            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold uppercase tracking-wider text-xs text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500"
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pause Audio
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4 fill-white" /> Play Voice Sample
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Live Call Dialogue Transcript */}
        <div className="mt-6 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Call Interaction Transcript:</p>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
            {activeVoice.transcript.map((line, idx) => {
              const isAi = line.speaker.startsWith("AI")
              return (
                <div
                  key={idx}
                  className={`rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? "bg-white/10 border border-white/15 text-white font-medium ml-4"
                      : "bg-black/30 border border-white/5 text-slate-300 mr-4"
                  }`}
                >
                  <span className={`font-bold block mb-1 text-xs ${isAi ? activeVoice.accentColor : "text-slate-400"}`}>
                    {line.speaker}:
                  </span>
                  {line.text}
                </div>
              )
            })}
          </div>
        </div>

        {/* Proven Industry KPIs */}
        <div className="mt-6 pt-5 sm:pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-center">
          <div className="rounded-xl border border-white/5 bg-black/30 p-2.5 sm:p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Speed to Answer</p>
            <p className="mt-1 text-base font-extrabold text-white">{activeVoice.metrics.pickupTime}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Qualification Accuracy</p>
            <p className="mt-1 text-base font-extrabold text-emerald-400">{activeVoice.metrics.qualificationAccuracy}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Conversion Impact</p>
            <p className="mt-1 text-base font-extrabold text-cyan-300">{activeVoice.metrics.bookedRate}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function IndustryRoiCalculator() {
  const [profileIndex, setProfileIndex] = useState(0)
  const profile = INDUSTRY_ROI_PROFILES[profileIndex]

  const [monthlyVolume, setMonthlyVolume] = useState(profile.monthlyVolume)
  const [ticketSize, setTicketSize] = useState(profile.avgTicket)
  const [liftRate, setLiftRate] = useState(Math.round(profile.conversionLift * 100))

  // When profile switches, update state
  useEffect(() => {
    setMonthlyVolume(profile.monthlyVolume)
    setTicketSize(profile.avgTicket)
    setLiftRate(Math.round(profile.conversionLift * 100))
  }, [profileIndex, profile])

  // Calculations
  const extraDealsPerMonth = Math.max(1, Math.round((monthlyVolume * (liftRate / 100) * 0.12)))
  const monthlyRevenueGain = extraDealsPerMonth * ticketSize
  const annualRevenueGain = monthlyRevenueGain * 12
  const omniwebMonthlyCost = 299 // Growth plan
  const roiMultiple = (monthlyRevenueGain / omniwebMonthlyCost).toFixed(1)

  return (
    <div className="rounded-3xl sm:rounded-[2.5rem] border border-white/10 bg-[#08101f]/90 p-4 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-2xl">
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
          <Calculator className="h-3.5 w-3.5" />
          Industry ROI Calculator
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
          Estimate Your Revenue Lift by Industry
        </h2>
        <p className="mt-3 text-sm text-slate-300">
          Model how sub-250ms instant response and automated qualification convert missed calls into closed transactions.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2 items-center">
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Select Your Industry Profile:
            </label>
            <select
              value={profileIndex}
              onChange={(e) => setProfileIndex(Number(e.target.value))}
              className="w-full rounded-xl border border-white/15 bg-[#0e1930] px-4 py-3 text-sm text-white font-semibold focus:border-cyan-500 focus:outline-none"
            >
              {INDUSTRY_ROI_PROFILES.map((p, i) => (
                <option key={p.name} value={i}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-400">{profile.description}</p>
          </div>

          {/* Slider 1: Monthly Calls / Inquiries */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Monthly Inbound Calls &amp; Chats:
              </span>
              <span className="text-lg font-extrabold text-cyan-400">{monthlyVolume.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="100"
              max="15000"
              step="50"
              value={monthlyVolume}
              onChange={(e) => setMonthlyVolume(Number(e.target.value))}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-cyan-400"
            />
          </div>

          {/* Slider 2: Average Ticket / Deal Size */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Average Value per Closed Deal / Order:
              </span>
              <span className="text-lg font-extrabold text-emerald-400">${ticketSize.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="50"
              max="10000"
              step="50"
              value={ticketSize}
              onChange={(e) => setTicketSize(Number(e.target.value))}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-emerald-400"
            />
          </div>

          {/* Slider 3: Expected Conversion Lift */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Missed Lead Recovery Rate:
              </span>
              <span className="text-lg font-extrabold text-purple-400">+{liftRate}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="1"
              value={liftRate}
              onChange={(e) => setLiftRate(Number(e.target.value))}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-purple-400"
            />
          </div>
        </div>

        {/* Dynamic ROI Display */}
        <div className="rounded-2xl border border-emerald-500/30 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,95,70,0.08))] p-8 shadow-xl text-center">
          <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
            Estimated Impact
          </span>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Net Monthly Revenue Gain
          </p>
          <p className="mt-1 text-5xl font-black text-emerald-300 sm:text-6xl">
            ${monthlyRevenueGain.toLocaleString()}
          </p>
          <p className="mt-2 text-sm font-bold text-white">
            ≈ ${annualRevenueGain.toLocaleString()} in added annual gross profit
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-left">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-[11px] font-semibold uppercase text-slate-400">Extra Closed Deals</p>
              <p className="mt-1 text-2xl font-extrabold text-white">+{extraDealsPerMonth} /mo</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-[11px] font-semibold uppercase text-slate-400">Omniweb ROI</p>
              <p className="mt-1 text-2xl font-extrabold text-cyan-300">{roiMultiple}× ROI</p>
            </div>
          </div>

          <Button
            size="lg"
            asChild
            className="mt-8 h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500"
          >
            <Link href="/get-started">
              Launch Swarm for This Industry <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function IndustryQualificationWorkflow() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(QUALIFICATION_WORKFLOWS[0])

  return (
    <div className="rounded-3xl sm:rounded-[2.5rem] border border-white/10 bg-[#08101f]/90 p-4 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-2xl">
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-purple-300">
          <Workflow className="h-3.5 w-3.5" />
          Deterministic Execution Logic
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
          Automated Industry Qualification Flows
        </h2>
        <p className="mt-3 text-sm text-slate-300">
          Every conversation follows a structured state machine with deterministic API calls and supervisor oversight.
        </p>
      </div>

      {/* Workflow Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {QUALIFICATION_WORKFLOWS.map((wf) => {
          const isActive = wf.industry === selectedWorkflow.industry
          return (
            <button
              key={wf.industry}
              onClick={() => setSelectedWorkflow(wf)}
              className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25 ring-1 ring-purple-300"
                  : "border border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white"
              }`}
            >
              {wf.industry}
            </button>
          )
        })}
      </div>

      {/* Steps Visual Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {selectedWorkflow.steps.map((s, idx) => (
          <div
            key={s.step}
            className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-white/20 hover:bg-white/[0.05]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-extrabold text-purple-300 border border-purple-500/30">
                {s.step}
              </span>
              {idx < 3 && <ChevronRight className="hidden lg:block h-4 w-4 text-slate-500" />}
            </div>
            <h4 className="text-sm font-bold text-white">{s.title}</h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
