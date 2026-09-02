"use client"

import { useState } from "react"
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  ExternalLink,
  FileText,
  Headphones,
  Layers,
  MessageSquare,
  Phone,
  PhoneCall,
  RefreshCw,
  Search,
  Server,
  Shield,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  Zap,
} from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"

export type AdminPageId =
  | "overview"
  | "agents"
  | "sessions"
  | "clients"
  | "templates"
  | "team"
  | "client-detail"

const SYSTEM_NODES = [
  { name: "FastAPI Engine (GCP)", status: "Healthy", latency: "14ms", version: "v2.4.0", uptime: "99.98%" },
  { name: "LiveKit WebRTC Audio", status: "Operational", latency: "38ms", version: "v1.7.2", uptime: "100%" },
  { name: "Deepgram Nova-3 Streamer", status: "Streaming", latency: "92ms", version: "STT APIv2", uptime: "99.99%" },
  { name: "Gemini 2.0 Flash LLM Router", status: "Active", latency: "115ms", version: "gemini-2.0-flash", uptime: "99.95%" },
  { name: "PostgreSQL 16 + pgvector", status: "Connected", latency: "4ms", version: "PostgreSQL 16.3", uptime: "100%" },
  { name: "Redis Cache Cluster", status: "Ready", latency: "2ms", version: "v7.2-alpine", uptime: "100%" },
]

const AGENTS_FLEET = [
  { id: "agt-001", name: "Apex Front Desk Receptionist", type: "Voice + Telephony", model: "Gemini 2.0 Flash", voice: "Deepgram Aura (Athena)", status: "Active", callsHandled: "4,821", avgLatency: "210ms" },
  { id: "agt-002", name: "Inbound Pipeline Qualifier", type: "Web Voice & Chat", model: "Gemini 2.0 Flash", voice: "Deepgram Aura (Orion)", status: "Active", callsHandled: "3,412", avgLatency: "218ms" },
  { id: "agt-003", name: "Support & Knowledge RAG", type: "Chat Assistant", model: "Gemini 2.0 Flash", voice: "Text-Only", status: "Active", callsHandled: "6,920", avgLatency: "185ms" },
  { id: "agt-004", name: "Outbound Campaign Dialer", type: "Telephony Campaign", model: "Gemini 2.0 Flash", voice: "Deepgram Aura (Luna)", status: "Active", callsHandled: "2,190", avgLatency: "235ms" },
  { id: "agt-005", name: "Retention & Billing Specialist", type: "Voice + Barge-in", model: "Gemini 2.0 Pro", voice: "Deepgram Aura (Helios)", status: "Active", callsHandled: "1,147", avgLatency: "290ms" },
]

const RECENT_SESSIONS = [
  { id: "sess-9942", tenant: "SolarPro Energy Inc", caller: "+1 (555) 234-8921", channel: "Inbound Voice", duration: "2m 44s", outcome: "Booked Quote Assessment", sentiment: "98% Positive", time: "2 mins ago" },
  { id: "sess-9941", tenant: "Dr. Evans Family Dental", caller: "+1 (555) 891-3412", channel: "After-Hours Voice", duration: "1m 18s", outcome: "Emergency Callback Queued", sentiment: "92% Positive", time: "6 mins ago" },
  { id: "sess-9940", tenant: "Elite Roofing Group", caller: "Web Visitor #419", channel: "Interactive Chat", duration: "3m 05s", outcome: "Lead Qualified & Pushed to CRM", sentiment: "95% Positive", time: "11 mins ago" },
  { id: "sess-9939", tenant: "Apex Law Partners", caller: "+1 (555) 772-9014", channel: "Inbound Voice", duration: "4m 12s", outcome: "Intake Form Completed", sentiment: "89% Neutral", time: "18 mins ago" },
  { id: "sess-9938", tenant: "Urban Chic Boutique", caller: "Web Visitor #418", channel: "Interactive Chat", duration: "1m 45s", outcome: "Cart Recovery Promo Sent", sentiment: "96% Positive", time: "25 mins ago" },
]

const TENANTS_LIST = [
  { id: "ten-441", name: "SolarPro Energy Inc", email: "operations@solarpro.com", plan: "Scale / Enterprise ($499)", usage: "11,840 / 15,000", status: "Active", phone: "+1 (800) 412-9901" },
  { id: "ten-440", name: "Dr. Evans Family Dental", email: "office@evansdental.com", plan: "Growth / Pro ($299)", usage: "4,120 / 5,000", status: "Active", phone: "+1 (555) 332-1100" },
  { id: "ten-439", name: "Elite Roofing Group", email: "admin@eliteroofing.io", plan: "Growth / Pro ($299)", usage: "3,890 / 5,000", status: "Active", phone: "+1 (555) 789-2211" },
  { id: "ten-438", name: "Apex Law Partners", email: "contact@apexlaw.com", plan: "Scale / Enterprise ($499)", usage: "8,920 / 15,000", status: "Active", phone: "+1 (888) 991-0022" },
  { id: "ten-437", name: "Urban Chic Boutique", email: "support@urbanchic.shop", plan: "Starter ($149)", usage: "940 / 1,200", status: "Active", phone: "+1 (555) 441-8899" },
]

export default function AdminDashboardPage() {
  const [activePage, setActivePage] = useState<AdminPageId>("overview")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 600)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#050a12] text-white">
      {/* Admin Sidebar */}
      <AdminSidebar activePage={activePage} onNavigate={(page) => setActivePage(page)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#08101d] px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              System Health: All Clusters Operational
            </span>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
              Sub-250ms Audio Pipeline
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-8 border-white/10 bg-white/5 text-xs text-white hover:bg-white/10"
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Telemetry
            </Button>
            <div className="h-8 w-8 rounded-full border border-cyan-400/40 bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-300">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* VIEW 1: OVERVIEW */}
          {activePage === "overview" && (
            <div className="space-y-6">
              {/* Header Title */}
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
                  Omniweb Platform Telemetry &amp; Fleet Overview
                </h1>
                <p className="mt-1 text-xs text-slate-400">
                  Global autonomous call center nodes, LLM inference latency, and multi-tenant metrics.
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-[#0a1224] p-5 shadow-xl">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Tenants</span>
                    <Users className="h-4 w-4 text-cyan-400" />
                  </div>
                  <p className="mt-3 text-3xl font-black text-white">142</p>
                  <p className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> +18 new this month
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0a1224] p-5 shadow-xl">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Calls &amp; Chats</span>
                    <PhoneCall className="h-4 w-4 text-blue-400" />
                  </div>
                  <p className="mt-3 text-3xl font-black text-white">18,490</p>
                  <p className="mt-1 text-[11px] text-cyan-400">99.8% answered under 2s</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0a1224] p-5 shadow-xl">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Average Voice Latency</span>
                    <Zap className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="mt-3 text-3xl font-black text-white">214ms</p>
                  <p className="mt-1 text-[11px] text-emerald-400">LiveKit WebRTC + Deepgram</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0a1224] p-5 shadow-xl">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Pipeline Generated</span>
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="mt-3 text-3xl font-black text-white">$2.84M</p>
                  <p className="mt-1 text-[11px] text-slate-400">Client-reported bookings</p>
                </div>
              </div>

              {/* System Cluster Infrastructure */}
              <div className="rounded-2xl border border-white/10 bg-[#0a1224] p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs">
                      Core Infrastructure Nodes
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">GCP Zone: us-central1-a</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {SYSTEM_NODES.map((node) => (
                    <div
                      key={node.name}
                      className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{node.name}</p>
                          <p className="text-xs text-slate-400">{node.version}</p>
                        </div>
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          {node.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                        <span>Latency: <strong className="text-cyan-300">{node.latency}</strong></span>
                        <span>Uptime: <strong className="text-white">{node.uptime}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Sessions Stream */}
              <div className="rounded-2xl border border-white/10 bg-[#0a1224] p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs">
                      Live Inbound Interactions
                    </h2>
                  </div>
                  <button
                    onClick={() => setActivePage("sessions")}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    View all sessions <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-3">Session ID</th>
                        <th className="py-3 px-3">Tenant</th>
                        <th className="py-3 px-3">Caller / Channel</th>
                        <th className="py-3 px-3">Duration</th>
                        <th className="py-3 px-3">Outcome</th>
                        <th className="py-3 px-3">Sentiment</th>
                        <th className="py-3 px-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {RECENT_SESSIONS.map((sess) => (
                        <tr key={sess.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-3 font-mono text-cyan-400">{sess.id}</td>
                          <td className="py-3 px-3 font-semibold text-white">{sess.tenant}</td>
                          <td className="py-3 px-3 text-slate-300">{sess.caller} ({sess.channel})</td>
                          <td className="py-3 px-3 text-slate-400">{sess.duration}</td>
                          <td className="py-3 px-3 text-emerald-400 font-medium">{sess.outcome}</td>
                          <td className="py-3 px-3 text-slate-300">{sess.sentiment}</td>
                          <td className="py-3 px-3 text-slate-500">{sess.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: AGENTS FLEET */}
          {activePage === "agents" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Autonomous Agent Fleet</h1>
                <p className="mt-1 text-xs text-slate-400">
                  Active voice and chat swarms configured across tenant workspaces.
                </p>
              </div>

              <div className="grid gap-4">
                {AGENTS_FLEET.map((agent) => (
                  <div
                    key={agent.id}
                    className="rounded-2xl border border-white/10 bg-[#0a1224] p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{agent.name}</h3>
                        <p className="text-xs text-slate-400">
                          {agent.type} • Backbone: <strong className="text-cyan-300">{agent.model}</strong> • Voice: {agent.voice}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-slate-300">
                      <div>
                        <p className="text-[10px] uppercase text-slate-500">Handled</p>
                        <p className="font-bold text-white">{agent.callsHandled}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-500">Avg Latency</p>
                        <p className="font-bold text-emerald-400">{agent.avgLatency}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                        {agent.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: SESSIONS */}
          {activePage === "sessions" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Session History &amp; Logs</h1>
                <p className="mt-1 text-xs text-slate-400">
                  Full transcript archives, sentiment scores, and tool call traces.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0a1224] p-6 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-3">Session ID</th>
                        <th className="py-3 px-3">Tenant</th>
                        <th className="py-3 px-3">Caller / Channel</th>
                        <th className="py-3 px-3">Duration</th>
                        <th className="py-3 px-3">Outcome</th>
                        <th className="py-3 px-3">Sentiment</th>
                        <th className="py-3 px-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {RECENT_SESSIONS.map((sess) => (
                        <tr key={sess.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-3 font-mono text-cyan-400">{sess.id}</td>
                          <td className="py-3 px-3 font-semibold text-white">{sess.tenant}</td>
                          <td className="py-3 px-3 text-slate-300">{sess.caller} ({sess.channel})</td>
                          <td className="py-3 px-3 text-slate-400">{sess.duration}</td>
                          <td className="py-3 px-3 text-emerald-400 font-medium">{sess.outcome}</td>
                          <td className="py-3 px-3 text-slate-300">{sess.sentiment}</td>
                          <td className="py-3 px-3 text-slate-500">{sess.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: CLIENTS / TENANTS */}
          {activePage === "clients" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Registered Clients &amp; Workspaces</h1>
                <p className="mt-1 text-xs text-slate-400">
                  Active SaaS accounts, provisioned phone numbers, and usage metering.
                </p>
              </div>

              <div className="grid gap-4">
                {TENANTS_LIST.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="rounded-2xl border border-white/10 bg-[#0a1224] p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{tenant.name}</h3>
                        <span className="font-mono text-xs text-slate-500">({tenant.id})</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {tenant.email} • Assigned DID: <strong className="text-cyan-300">{tenant.phone}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-slate-300">
                      <div>
                        <p className="text-[10px] uppercase text-slate-500">Plan</p>
                        <p className="font-bold text-white">{tenant.plan}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-500">Conversation Usage</p>
                        <p className="font-bold text-cyan-400">{tenant.usage}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                        {tenant.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 5: TEMPLATES */}
          {activePage === "templates" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Industry Template Catalog</h1>
                <p className="mt-1 text-xs text-slate-400">
                  Manage turnkey AI voice and chat deployment configurations.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "Commerce Pro (Shopify)", category: "E-Commerce", deployments: 48, status: "Published" },
                  { name: "Local Pro (Contractors)", category: "Field Services", deployments: 52, status: "Published" },
                  { name: "Consultant Elite", category: "Professional", deployments: 24, status: "Published" },
                  { name: "Dental & Medical Intake", category: "Healthcare", deployments: 14, status: "Published" },
                  { name: "Legal Practice Qualifier", category: "Legal", deployments: 19, status: "Published" },
                  { name: "Agency Growth Suite", category: "Agency", deployments: 31, status: "Published" },
                ].map((tpl) => (
                  <div key={tpl.name} className="rounded-2xl border border-white/10 bg-[#0a1224] p-5 shadow-xl">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">{tpl.category}</span>
                    <h3 className="mt-1 text-base font-bold text-white">{tpl.name}</h3>
                    <p className="mt-3 text-xs text-slate-400">
                      Active Deployments: <strong className="text-white">{tpl.deployments} workspaces</strong>
                    </p>
                    <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                      <span className="text-emerald-400 font-semibold">{tpl.status}</span>
                      <button className="text-cyan-400 hover:text-cyan-300">Edit Template</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 6: TEAM */}
          {activePage === "team" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Admin Team &amp; Security Roles</h1>
                <p className="mt-1 text-xs text-slate-400">
                  Authorized team members and administrative access controls.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0a1224] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-bold text-white">Lead Administrator</h3>
                    <p className="text-xs text-slate-400">admin@omniweb.ai</p>
                  </div>
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 border border-purple-500/30">
                    Super Admin
                  </span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-bold text-white">DevOps &amp; Infrastructure</h3>
                    <p className="text-xs text-slate-400">devops@omniweb.ai</p>
                  </div>
                  <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30">
                    Cluster Admin
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Customer Support Lead</h3>
                    <p className="text-xs text-slate-400">support-lead@omniweb.ai</p>
                  </div>
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-500/30">
                    Support Tier-3
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
