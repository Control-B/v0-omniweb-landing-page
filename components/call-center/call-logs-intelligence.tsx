"use client"

import { useState } from "react"
import {
  Activity,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Headphones,
  Pause,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Volume2,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type CallLogRecord = {
  id: string
  callerNumber: string
  callerName: string
  timestamp: string
  duration: string
  agent: string
  intent: string
  sentiment: "positive" | "neutral" | "frustrated"
  csat: number
  costUsd: number
  summary: string
  actionItems: string[]
  turns: Array<{ speaker: "caller" | "agent"; text: string; timestamp: string }>
}

const SAMPLE_CALL_LOGS: CallLogRecord[] = [
  {
    id: "call-rec-98401",
    callerNumber: "+1 (555) 234-5678",
    callerName: "Sarah Jenkins",
    timestamp: "Today at 2:14 PM",
    duration: "2m 18s",
    agent: "Alex Vance (Billing Specialist)",
    intent: "billing_inquiry",
    sentiment: "positive",
    csat: 5.0,
    costUsd: 0.21,
    summary: "Customer inquired regarding rate increase on August invoice ($299 vs $199). Agent explained 2,400 additional inbound telephony minutes. Customer requested $150 downtime credit; agent created priority approval ticket.",
    actionItems: [
      "Supervisor to review courtesy credit #appr_98a42f ($150)",
      "Send SMS confirmation upon approval",
    ],
    turns: [
      { speaker: "caller", text: "Hi, I noticed a $299 charge on my account today and I wanted to know what caused the rate increase.", timestamp: "0:04" },
      { speaker: "agent", text: "Hello! I have your account open in front of me. Your base plan is $199 for 10 autonomous agents, and the additional $100 corresponds to 2,400 inbound telephony minutes utilized during your recent marketing campaign.", timestamp: "0:12" },
      { speaker: "caller", text: "Got it! Could you issue a $150 courtesy credit since we had downtime on Tuesday?", timestamp: "0:35" },
      { speaker: "agent", text: "I completely understand and apologize for that downtime. Because this request is for $150, I have dispatched an instant authorization ticket directly to our shift supervisor. You will receive an SMS confirmation the moment it is approved!", timestamp: "0:48" },
    ],
  },
  {
    id: "call-rec-98402",
    callerNumber: "+1 (800) 412-9901",
    callerName: "David Miller",
    timestamp: "Today at 1:40 PM",
    duration: "3m 45s",
    agent: "Marcus Vance (Sales Closer)",
    intent: "sales_qualification",
    sentiment: "positive",
    csat: 4.9,
    costUsd: 0.34,
    summary: "High-value enterprise lead qualification for 50 human agent seat migration. Agent presented $4,200/mo autonomous swarm pricing and booked executive briefing for Tuesday at 2pm.",
    actionItems: [
      "Executive calendar invite sent for Tuesday 2:00 PM EST",
      "Pushed lead profile to HubSpot CRM with 0.96 score",
    ],
    turns: [
      { speaker: "caller", text: "We have 50 reps in our support department and want to explore autonomous voice agents.", timestamp: "0:05" },
      { speaker: "agent", text: "At 50 seats, Omniweb typically reduces monthly spend from $175,000 down to under $4,200 with zero hold times. Let's schedule an executive briefing—would Tuesday at 2pm work?", timestamp: "0:19" },
      { speaker: "caller", text: "Tuesday at 2pm is perfect, send it to david@acme.com.", timestamp: "0:42" },
    ],
  },
]

export function CallLogsIntelligence() {
  const [logs, setLogs] = useState<CallLogRecord[]>(SAMPLE_CALL_LOGS)
  const [selectedLog, setSelectedLog] = useState<CallLogRecord>(SAMPLE_CALL_LOGS[0])
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Call Intelligence & Recording Archive</h2>
          <p className="text-xs text-slate-400">Searchable audio recordings, synchronized transcripts, and automated QA scorecards</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Call Log List (5 cols) */}
        <div className="space-y-3 lg:col-span-5">
          {logs.map((log) => {
            const isSelected = selectedLog.id === log.id
            return (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                  isSelected
                    ? "border-cyan-400/60 bg-cyan-950/20 shadow-lg shadow-cyan-500/10"
                    : "border-white/5 bg-slate-950/80 hover:border-white/15 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">{log.callerName}</span>
                  <span className="font-mono text-xs text-slate-400">{log.duration}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{log.callerNumber}</span>
                  <span className="text-amber-400 font-mono flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {log.csat}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px]">
                  <span className="rounded bg-black/40 px-2 py-0.5 text-cyan-300 font-medium">{log.intent}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{log.timestamp}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Call Deep Intelligence Player (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Audio Player & QA Rubrics */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-bold text-white text-lg">{selectedLog.callerName}</h3>
                <p className="text-xs text-slate-400">{selectedLog.agent} • {selectedLog.timestamp}</p>
              </div>

              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                Cost: ${selectedLog.costUsd.toFixed(2)}
              </Badge>
            </div>

            {/* Audio Player Bar */}
            <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Call Audio Waveform</span>
                <span>{selectedLog.duration}</span>
              </div>
              <div className="h-8 w-full flex items-center gap-1">
                {Array.from({ length: 48 }).map((_, i) => (
                  <span
                    key={i}
                    style={{ height: `${Math.max(6, Math.sin(i * 0.3) * 28 + 6)}px` }}
                    className="flex-1 rounded-full bg-cyan-500/60 hover:bg-cyan-400 transition"
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-center gap-3">
                <Button
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="rounded-full bg-cyan-500 text-black font-semibold hover:bg-cyan-400"
                >
                  {isPlaying ? <Pause className="mr-1.5 h-4 w-4" /> : <Play className="mr-1.5 h-4 w-4" />}
                  {isPlaying ? "Pause Recording" : "Play Recording"}
                </Button>
              </div>
            </div>

            {/* AI Executive Summary */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                AI Call Dossier & Summary
              </h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                {selectedLog.summary}
              </p>
            </div>

            {/* Action Items */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Extracted Action Items
              </h4>
              <div className="mt-2 space-y-1.5">
                {selectedLog.actionItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Synchronized Diarized Transcript */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Synchronized Diarized Transcript
              </h4>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {selectedLog.turns.map((turn, i) => (
                  <div key={i} className="text-xs space-y-1">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>[{turn.timestamp}]</span>
                      <span className={turn.speaker === "caller" ? "text-cyan-400" : "text-purple-400"}>
                        {turn.speaker.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-300 pl-4 border-l border-white/10">{turn.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
