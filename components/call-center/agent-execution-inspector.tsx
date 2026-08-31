"use client"

import { useState } from "react"
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Eye,
  FileCode,
  Layers,
  Lock,
  RadioTower,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserCheck,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export type GraphStep = {
  id: string
  title: string
  plane: "Real-Time (LiveKit)" | "Gateway" | "LangGraph Core" | "Specialist Swarm" | "Tool Layer" | "HITL Policy"
  status: "completed" | "active" | "pending"
  latencyMs: number
  summary: string
  details: Record<string, any>
}

const DEFAULT_GRAPH_STEPS: GraphStep[] = [
  {
    id: "step-1-livekit",
    title: "1. Inbound WebRTC / SIP Telephony Audio",
    plane: "Real-Time (LiveKit)",
    status: "completed",
    latencyMs: 42,
    summary: "LiveKit AgentSession accepted media stream via Twilio SIP trunk (+1 800-555-0199).",
    details: {
      channel: "SIP_PSTN",
      audioCodec: "Opus 24kHz",
      vad: "Silero VAD",
      callerNumber: "+1 555-234-5678",
    },
  },
  {
    id: "step-2-identity",
    title: "2. Identity Verification & Context Hydration",
    plane: "Gateway",
    status: "completed",
    latencyMs: 18,
    summary: "Resolved tenant_id. Match found: Sarah Jenkins (Enterprise Tier, Customer #849201).",
    details: {
      tenant_id: "dlPBhYBUzIpAeeA8FImeGXYz",
      customer_id: "cust_849201",
      auth_level: "caller_id_verified",
      active_mfa: false,
    },
  },
  {
    id: "step-3-nlu",
    title: "3. Intent & Risk Classification (Gemini 2.0 Flash)",
    plane: "LangGraph Core",
    status: "completed",
    latencyMs: 84,
    summary: "Intent classified: billing_inquiry & refund_request ($150). Urgency: Medium, Sentiment: Neutral.",
    details: {
      intent: "billing_inquiry",
      secondary_intents: ["refund_request"],
      sentiment: "neutral",
      risk_level: "high_risk",
      model: "gemini-2.0-flash",
    },
  },
  {
    id: "step-4-router",
    title: "4. Supervisor Router State Transition",
    plane: "LangGraph Core",
    status: "completed",
    latencyMs: 12,
    summary: "Diverted workflow from [Receptionist] to [Billing Specialist Agent]. Checkpoint persisted.",
    details: {
      source_node: "classifier_node",
      target_node: "billing_agent_node",
      checkpoint_id: "chk_984b20a",
      state_version: 3,
    },
  },
  {
    id: "step-5-agent",
    title: "5. Specialist Agent Reasoning (Alex Vance)",
    plane: "Specialist Swarm",
    status: "completed",
    latencyMs: 130,
    summary: "Alex Vance analyzed recent $299 invoice breakdown and prepared courtesy credit recommendation.",
    details: {
      agent_role: "Billing & Dispute Specialist",
      model: "gemini-2.0-flash",
      tools_selected: ["get_invoices", "request_refund"],
    },
  },
  {
    id: "step-6-tool",
    title: "6. Tool Execution: request_refund($150.00)",
    plane: "Tool Layer",
    status: "completed",
    latencyMs: 38,
    summary: "Invoked billing.request_refund(). Policy Engine evaluated: Amount exceeds $50 threshold.",
    details: {
      tool: "request_refund",
      amount: 150.0,
      threshold: 50.0,
      decision: "REQUIRE_APPROVAL",
    },
  },
  {
    id: "step-7-hitl",
    title: "7. Human-in-the-Loop Supervisor Gate",
    plane: "HITL Policy",
    status: "active",
    latencyMs: 65,
    summary: "Workflow paused at checkpoint. Approval ticket #appr_98a42f dispatched to Supervisor War Room.",
    details: {
      approval_id: "appr_98a42f",
      assigned_to: "Shift Supervisor Queue",
      action: "Approve $150 courtesy credit",
      timeout_seconds: 300,
    },
  },
]

export function AgentExecutionInspector() {
  const [selectedStep, setSelectedStep] = useState<GraphStep>(DEFAULT_GRAPH_STEPS[2])

  return (
    <div className="rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-slate-950/95 to-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl lg:p-8">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
            <Layers className="h-3.5 w-3.5" />
            Agentic Execution Graph Inspector
          </div>
          <h3 className="mt-2 text-2xl font-bold text-white">Live State Machine Execution Trace</h3>
          <p className="text-xs text-slate-400">
            Inspect the exact deterministic step-by-step reasoning, tool invocations, checkpointing, and HITL gates.
          </p>
        </div>

        <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-300">
          LangGraph 0.2 Engine
        </Badge>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Step Flow List (7 cols) */}
        <div className="space-y-3 lg:col-span-7">
          {DEFAULT_GRAPH_STEPS.map((step, idx) => {
            const isSelected = selectedStep.id === step.id
            return (
              <div
                key={step.id}
                onClick={() => setSelectedStep(step)}
                className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? "border-purple-500/70 bg-purple-950/30 shadow-lg shadow-purple-500/10"
                    : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                }`}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-purple-300">
                  {step.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-400 animate-spin" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-purple-200">{step.title}</span>
                    <span className="text-[11px] font-mono text-purple-300">{step.latencyMs}ms</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                      {step.plane}
                    </span>
                    <span className="text-xs text-slate-300 truncate">{step.summary}</span>
                  </div>
                </div>

                <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "text-purple-400 translate-x-1" : "text-slate-600"}`} />
              </div>
            )
          })}
        </div>

        {/* Selected Step Deep Trace Inspector (5 cols) */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-purple-500/30 bg-slate-950/90 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase">
                <Terminal className="h-4 w-4 text-purple-400" />
                State Node Telemetry
              </div>
              <span className="text-[10px] font-mono text-slate-400">{selectedStep.id}</span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold">Node Name</span>
                <p className="mt-0.5 text-sm font-semibold text-white">{selectedStep.title}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold">Execution Summary</span>
                <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">{selectedStep.summary}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold">State Payload Snapshot</span>
                <pre className="mt-1.5 max-h-56 overflow-auto rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-[11px] text-cyan-300">
                  {JSON.stringify(selectedStep.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return <ArrowRight className={className} />
}
