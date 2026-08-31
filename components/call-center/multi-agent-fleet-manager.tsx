"use client"

import { useState } from "react"
import {
  Activity,
  Bot,
  CheckCircle2,
  Cpu,
  Layers,
  Lock,
  Mic,
  Plus,
  RadioTower,
  Save,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  UserCheck,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type FleetAgent = {
  id: string
  name: string
  role: string
  specialty: string
  status: "active" | "standby"
  voiceModel: string
  voiceName: string
  tools: string[]
  temperature: number
  interruptionEnabled: boolean
  maxTurnLatencyMs: number
}

const FLEET_AGENTS: FleetAgent[] = [
  {
    id: "agent-rec-01",
    name: "Front Desk Coordinator",
    role: "receptionist",
    specialty: "Inbound discovery, language detection, and routing",
    status: "active",
    voiceModel: "Deepgram Nova-3 + Cartesia",
    voiceName: "Rachel (Warm & Professional)",
    tools: ["lookup_customer", "create_lead", "search_knowledge", "check_availability"],
    temperature: 0.5,
    interruptionEnabled: true,
    maxTurnLatencyMs: 240,
  },
  {
    id: "agent-bill-02",
    name: "Alex Vance",
    role: "billing",
    specialty: "Invoice review, payment links, and refund dispute triage",
    status: "active",
    voiceModel: "Deepgram Nova-3 + Cartesia",
    voiceName: "Marcus (Authoritative & Precise)",
    tools: ["lookup_customer", "get_invoices", "request_refund", "search_knowledge"],
    temperature: 0.3,
    interruptionEnabled: true,
    maxTurnLatencyMs: 220,
  },
  {
    id: "agent-sales-03",
    name: "Marcus Vance",
    role: "sales",
    specialty: "Enterprise lead qualification, proposals, and CRM sync",
    status: "active",
    voiceModel: "Gemini 2.0 Multimodal Live",
    voiceName: "David (Charismatic & Persuasive)",
    tools: ["lookup_customer", "create_lead", "check_availability", "book_appointment"],
    temperature: 0.7,
    interruptionEnabled: true,
    maxTurnLatencyMs: 195,
  },
  {
    id: "agent-supp-04",
    name: "Elena Rostova",
    role: "support",
    specialty: "Tier-1 diagnostics, troubleshooting scripts, and ticketing",
    status: "active",
    voiceModel: "Deepgram Nova-3 + Cartesia",
    voiceName: "Elena (Clear & Patient)",
    tools: ["lookup_customer", "search_knowledge", "create_ticket", "check_availability"],
    temperature: 0.4,
    interruptionEnabled: true,
    maxTurnLatencyMs: 250,
  },
  {
    id: "agent-sched-05",
    name: "Chloe Bennett",
    role: "scheduling",
    specialty: "Executive calendar booking, rescheduling, and SMS alerts",
    status: "active",
    voiceModel: "ElevenLabs Turbo v2.5",
    voiceName: "Chloe (Friendly & Efficient)",
    tools: ["check_availability", "book_appointment", "search_knowledge"],
    temperature: 0.3,
    interruptionEnabled: true,
    maxTurnLatencyMs: 210,
  },
  {
    id: "agent-ret-06",
    name: "James Sterling",
    role: "retention",
    specialty: "Churn defense, approved credit offers, and cancellation policy",
    status: "active",
    voiceModel: "Deepgram Nova-3 + Cartesia",
    voiceName: "James (Empathetic & Calm)",
    tools: ["lookup_customer", "get_invoices", "request_refund", "search_knowledge"],
    temperature: 0.5,
    interruptionEnabled: true,
    maxTurnLatencyMs: 230,
  },
]

export function MultiAgentFleetManager() {
  const [agents, setAgents] = useState<FleetAgent[]>(FLEET_AGENTS)
  const [selectedAgent, setSelectedAgent] = useState<FleetAgent>(FLEET_AGENTS[0])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Autonomous Agent Fleet Manager</h2>
          <p className="text-xs text-slate-400">Configure specialist agent personas, voice models, tool bounds, and latency budgets</p>
        </div>

        <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
          6 Autonomous Swarm Roles Active
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Agent Cards Grid (5 cols) */}
        <div className="space-y-3 lg:col-span-5">
          {agents.map((agent) => {
            const isSelected = selectedAgent.id === agent.id
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                  isSelected
                    ? "border-cyan-400/60 bg-cyan-950/20 shadow-lg shadow-cyan-500/10"
                    : "border-white/5 bg-slate-950/80 hover:border-white/15 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">{agent.name}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                    {agent.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-cyan-300 mt-0.5">{agent.specialty}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{agent.voiceModel}</span>
                  <span>•</span>
                  <span>{agent.tools.length} Tools Bound</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Agent Editor Pane (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-bold text-white text-lg">{selectedAgent.name}</h3>
                <p className="text-xs text-slate-400">Role: <span className="font-mono text-cyan-300">{selectedAgent.role}</span></p>
              </div>

              <Button size="sm" className="rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400">
                <Save className="mr-1.5 h-4 w-4" />
                Save Agent Profile
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Voice Model Engine</label>
                <input
                  type="text"
                  value={selectedAgent.voiceModel}
                  readOnly
                  className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-slate-900 px-3 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Latency Budget</label>
                <input
                  type="text"
                  value={`${selectedAgent.maxTurnLatencyMs}ms target`}
                  readOnly
                  className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-slate-900 px-3 text-xs text-amber-300 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Bound Tool Allowlist (Strict RBAC)</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedAgent.tools.map((t) => (
                  <Badge key={t} className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1 font-mono text-xs">
                    {t}()
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Specialist Instructions & Safety Guardrails</label>
              <textarea
                readOnly
                rows={4}
                value={`Specialist Role: ${selectedAgent.specialty}. Governed by deterministic policy engine. High-risk mutations require supervisor approval.`}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/90 p-4 text-xs leading-relaxed text-slate-300 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
