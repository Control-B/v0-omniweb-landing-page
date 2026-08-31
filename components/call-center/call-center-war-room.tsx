"use client"

import { useState } from "react"
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock,
  Headphones,
  Mic,
  Phone,
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  Radio,
  RadioTower,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Volume2,
  XCircle,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type ActiveCall = {
  id: string
  callerNumber: string
  callerName: string
  channel: "Inbound SIP" | "WebRTC" | "Outbound Campaign"
  duration: string
  activeAgent: string
  intent: string
  sentiment: "positive" | "neutral" | "frustrated"
  queueWaitSeconds: number
  audioWave: number[]
}

const INITIAL_ACTIVE_CALLS: ActiveCall[] = [
  {
    id: "call-live-101",
    callerNumber: "+1 (555) 234-5678",
    callerName: "Sarah Jenkins",
    channel: "Inbound SIP",
    duration: "1m 42s",
    activeAgent: "Alex Vance (Billing)",
    intent: "billing_inquiry",
    sentiment: "neutral",
    queueWaitSeconds: 2,
    audioWave: [12, 24, 45, 18, 32, 60, 42, 19, 30, 52, 28, 14],
  },
  {
    id: "call-live-102",
    callerNumber: "+1 (800) 412-9901",
    callerName: "David Miller",
    channel: "WebRTC",
    duration: "3m 15s",
    activeAgent: "Marcus Vance (Sales Closer)",
    intent: "sales_qualification",
    sentiment: "positive",
    queueWaitSeconds: 0,
    audioWave: [30, 48, 62, 50, 42, 68, 55, 34, 48, 60, 39, 22],
  },
  {
    id: "call-live-103",
    callerNumber: "+1 (555) 789-0123",
    callerName: "Elena Rostova",
    channel: "Inbound SIP",
    duration: "0m 58s",
    activeAgent: "Sophia Martinez (Dispatch)",
    intent: "emergency_hvac",
    sentiment: "frustrated",
    queueWaitSeconds: 1,
    audioWave: [50, 72, 85, 60, 68, 90, 75, 52, 64, 80, 58, 30],
  },
  {
    id: "call-live-104",
    callerNumber: "+1 (555) 345-6789",
    callerName: "Michael Chang",
    channel: "Outbound Campaign",
    duration: "2m 04s",
    activeAgent: "Chloe Bennett (E-Commerce)",
    intent: "cart_recovery",
    sentiment: "positive",
    queueWaitSeconds: 0,
    audioWave: [15, 32, 28, 40, 22, 35, 48, 30, 25, 42, 20, 10],
  },
]

type PendingApproval = {
  id: string
  callerName: string
  action: string
  amount: string
  reason: string
  agent: string
  requestedAt: string
}

export function CallCenterWarRoom() {
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>(INITIAL_ACTIVE_CALLS)
  const [selectedCall, setSelectedCall] = useState<ActiveCall | null>(INITIAL_ACTIVE_CALLS[0])
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([
    {
      id: "appr_98a42f",
      callerName: "Sarah Jenkins",
      action: "Issue Courtesy Credit",
      amount: "$150.00",
      reason: "Downtime during Tuesday migration",
      agent: "Alex Vance (Billing)",
      requestedAt: "45s ago",
    },
  ])

  const handleApprove = (id: string) => {
    setPendingApprovals((prev) => prev.filter((a) => a.id !== id))
    alert(`Approval ${id} confirmed. LangGraph checkpoint resumed and credit processed.`)
  }

  const handleReject = (id: string) => {
    setPendingApprovals((prev) => prev.filter((a) => a.id !== id))
    alert(`Approval ${id} rejected. Agent notified to propose alternative courtesy offering.`)
  }

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Call Concurrency</span>
            <RadioTower className="h-4 w-4 text-emerald-400 animate-pulse" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">42 <span className="text-sm font-normal text-emerald-400">/ 500 lines</span></p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>100% Zero Queue Wait Time</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">First Contact Resolution</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">91.4%</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Autonomous containment</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Turn Latency</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">224ms</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <span>Deepgram Nova-3 + Gemini 2.0</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">CSAT Satisfaction Score</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">4.92 <span className="text-sm font-normal text-slate-400">/ 5.0</span></p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-400 font-medium">
            <span>Based on 1,420 calls today</span>
          </div>
        </div>
      </div>

      {/* Main War Room Active Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Active Calls Matrix (8 cols) */}
        <div className="space-y-4 lg:col-span-8">
          <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                <h3 className="text-lg font-bold text-white">Live Active Calls Matrix</h3>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                {activeCalls.length} Active Swarms
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              {activeCalls.map((call) => {
                const isSelected = selectedCall?.id === call.id
                return (
                  <div
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className={`flex flex-col gap-3 rounded-2xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between cursor-pointer ${
                      isSelected
                        ? "border-cyan-400/60 bg-cyan-950/20 shadow-md shadow-cyan-500/10"
                        : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                        <PhoneCall className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{call.callerName}</span>
                          <span className="text-xs text-slate-400">{call.callerNumber}</span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs">
                          <span className="text-cyan-300 font-medium">{call.activeAgent}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">{call.channel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Audio Waveform Snippet */}
                    <div className="flex items-center gap-1 px-2">
                      {call.audioWave.map((h, i) => (
                        <span
                          key={i}
                          style={{ height: `${h * 0.3}px` }}
                          className="w-1 rounded-full bg-gradient-to-t from-cyan-500 to-purple-500 animate-pulse"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <span className="font-mono text-xs font-semibold text-amber-300">{call.duration}</span>
                        <p className="text-[10px] text-slate-400">{call.intent}</p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          alert(`Listening in silently to ${call.callerName}...`)
                        }}
                        className="h-8 rounded-xl border-white/10 bg-white/5 text-xs text-white hover:bg-white/10"
                      >
                        <Headphones className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                        Listen
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Human-in-the-Loop Pending Approvals (4 cols) */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-3xl border border-amber-500/30 bg-slate-950/90 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                Pending HITL Approvals
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                {pendingApprovals.length} Action Needed
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              {pendingApprovals.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                  No pending high-risk approvals. All agents operating within policy limits.
                </div>
              ) : (
                pendingApprovals.map((appr) => (
                  <div key={appr.id} className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{appr.action}</span>
                      <span className="font-mono text-xs font-bold text-amber-300">{appr.amount}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-300">Caller: <span className="text-white font-medium">{appr.callerName}</span></p>
                    <p className="mt-1 text-[11px] text-slate-400">Reason: "{appr.reason}"</p>
                    <p className="mt-1 text-[10px] text-purple-300 font-mono">Agent: {appr.agent}</p>

                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(appr.id)}
                        className="h-8 flex-1 rounded-xl bg-emerald-500 text-xs font-semibold text-black hover:bg-emerald-400"
                      >
                        Approve Action
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(appr.id)}
                        className="h-8 flex-1 rounded-xl border-white/10 text-xs text-white hover:bg-white/10"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
