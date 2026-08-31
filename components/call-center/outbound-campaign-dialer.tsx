"use client"

import { useState } from "react"
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  PhoneCall,
  PhoneForwarded,
  PhoneOutgoing,
  Play,
  Plus,
  RadioTower,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Campaign = {
  id: string
  name: string
  status: "running" | "paused" | "completed" | "scheduled"
  concurrency: number
  totalContacts: number
  dialed: number
  connected: number
  bookedAppointments: number
  agentPersona: string
  amdAccuracy: string
}

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-001",
    name: "Enterprise Q3 Outbound Inbound Lead Follow-Up",
    status: "running",
    concurrency: 50,
    totalContacts: 1200,
    dialed: 480,
    connected: 394,
    bookedAppointments: 62,
    agentPersona: "Marcus Vance (Enterprise Closer)",
    amdAccuracy: "99.4%",
  },
  {
    id: "camp-002",
    name: "Commercial HVAC Emergency Readiness Outreach",
    status: "scheduled",
    concurrency: 25,
    totalContacts: 650,
    dialed: 0,
    connected: 0,
    bookedAppointments: 0,
    agentPersona: "Sophia Martinez (Dispatch Specialist)",
    amdAccuracy: "99.1%",
  },
  {
    id: "camp-003",
    name: "SaaS Renewal & Proactive Retention Campaign",
    status: "completed",
    concurrency: 100,
    totalContacts: 3400,
    dialed: 3400,
    connected: 2980,
    bookedAppointments: 412,
    agentPersona: "Alex Vance (Retention & Billing)",
    amdAccuracy: "99.7%",
  },
]

export function OutboundCampaignDialer() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>(INITIAL_CAMPAIGNS[0])

  return (
    <div className="space-y-6">
      {/* Campaign Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Outbound Dials Today</span>
            <PhoneOutgoing className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">3,880</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>82.4% Live Answer Rate</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Appointments Booked</span>
            <Calendar className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">474</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Synced to Cal.com / Google Calendar</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Answering Machine Detection</span>
            <Bot className="h-4 w-4 text-purple-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">99.4%</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-400 font-medium">
            <span>Instant Voicemail Bypass & Message Drop</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Compliance & DNC</span>
            <ShieldCheck className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">100%</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <span>TCPA & STIR/SHAKEN Verified</span>
          </div>
        </div>
      </div>

      {/* Campaign List Table */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Outbound AI Power Dialer Campaigns</h3>
            <p className="text-xs text-slate-400">Autonomous high-concurrency lead qualification and booking swarms</p>
          </div>

          <Button className="rounded-xl bg-cyan-500 font-semibold text-black hover:bg-cyan-400">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Campaign
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              onClick={() => setSelectedCampaign(camp)}
              className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-cyan-400/30 hover:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <PhoneOutgoing className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{camp.name}</span>
                    <Badge
                      className={`text-[10px] ${
                        camp.status === "running"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : camp.status === "scheduled"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {camp.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Agent: <span className="text-cyan-300">{camp.agentPersona}</span> • Concurrency: <span className="text-white font-mono">{camp.concurrency} lines</span>
                  </p>
                </div>
              </div>

              {/* Progress & Conversion */}
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[11px] text-slate-500">Progress</span>
                  <p className="font-mono text-sm font-semibold text-white">
                    {camp.dialed} / {camp.totalContacts} ({Math.round((camp.dialed / (camp.totalContacts || 1)) * 100)}%)
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Booked Calls</span>
                  <p className="font-mono text-sm font-semibold text-emerald-400">{camp.bookedAppointments} booked</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
