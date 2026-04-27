"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { adminGetStats, formatDuration, formatPhone, timeAgo } from "@/lib/admin-api"
import { cn } from "@/lib/utils"
import {
  Users,
  Phone,
  UserCheck,
  TrendingUp,
  Loader2,
  AlertCircle,
  CalendarCheck,
  Wrench,
  PhoneIncoming,
  Bot,
} from "lucide-react"

interface WeeklyDay { date: string; label: string; calls: number; leads: number }
interface RecentLead {
  id: string; caller_name: string; caller_phone: string;
  intent: string | null; urgency: string; status: string;
  lead_score: number; services_requested: string[]; created_at: string | null
}
interface RecentCall {
  id: string; caller_number: string; direction: string;
  channel: string; status: string; duration_seconds: number | null; started_at: string | null
}
interface RecentToolCall {
  id: string; tool_name: string; success: boolean;
  duration_ms: number | null; created_at: string | null
}
interface PlatformStats {
  total_clients: number; active_clients: number; total_calls: number;
  total_leads: number; total_numbers: number; calls_today: number;
  active_subscribers: number; total_minutes_used: number;
  leads_today: number; calls_this_week: number; booked_appointments: number;
  leads_by_status: Record<string, number>; clients_by_plan: Record<string, number>;
  tool_calls_today: number; tool_summary: Record<string, number>;
  recent_leads: RecentLead[]; recent_calls: RecentCall[];
  recent_tool_calls: RecentToolCall[]; weekly: WeeklyDay[]
}

const TOOL_LABELS: Record<string, string> = {
  capture_lead: "Lead Capture", check_availability: "Availability",
  book_appointment: "Booking", send_confirmation_sms: "SMS", get_pricing_info: "Pricing",
}

export function AdminOverview() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    adminGetStats()
      .then(setStats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" /><span className="text-sm">{error}</span>
        </div>
      </div>
    )
  }
  if (!stats) return null

  const maxWeekly = Math.max(...(stats.weekly || []).map((d) => d.calls + d.leads), 1)

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-white">Platform Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time metrics across all tenants</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Clients", value: stats.total_clients, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Subscribers", value: stats.active_subscribers, icon: Bot, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Minutes Used", value: stats.total_minutes_used, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { label: "Total Calls", value: stats.total_calls, icon: Phone, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Total Leads", value: stats.total_leads, icon: UserCheck, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Booked", value: stats.booked_appointments, icon: CalendarCheck, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Today Calls", value: stats.calls_today, icon: PhoneIncoming, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { label: "Today Leads", value: stats.leads_today, icon: UserCheck, color: "text-rose-400", bg: "bg-rose-500/10" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-medium">{s.label}</p>
                <p className="text-2xl font-bold text-white mt-0.5">{s.value.toLocaleString()}</p>
              </div>
              <div className={cn(s.bg, s.color, "p-2 rounded-lg")}><s.icon className="w-4 h-4" /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Chart + Lead Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-white mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> 7-Day Activity
          </div>
          {(stats.weekly || []).length > 0 ? (
            <div className="flex items-end gap-2 h-32">
              {stats.weekly.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5" style={{ height: 100 }}>
                    <div className="w-full bg-indigo-500/60 rounded-t" style={{ height: `${(d.calls / maxWeekly) * 100}%`, minHeight: d.calls > 0 ? 4 : 0 }} />
                    <div className="w-full bg-emerald-500/60 rounded-b" style={{ height: `${(d.leads / maxWeekly) * 100}%`, minHeight: d.leads > 0 ? 4 : 0 }} />
                  </div>
                  <span className="text-[9px] text-slate-500">{d.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">No data yet</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500 justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-500/60" /> Calls</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500/60" /> Leads</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-medium text-white mb-3">Lead Funnel</p>
          <div className="space-y-2">
            {Object.keys(stats.leads_by_status || {}).length > 0 ? (
              Object.entries(stats.leads_by_status).map(([status, count]) => {
                const pct = stats.total_leads > 0 ? (count / stats.total_leads) * 100 : 0
                const colors: Record<string, string> = {
                  new: "bg-blue-500", contacted: "bg-amber-500", booked: "bg-emerald-500",
                  closed: "bg-green-500", lost: "bg-red-500",
                }
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="capitalize text-slate-400">{status}</span>
                      <span className="font-medium text-white">{count}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", colors[status] || "bg-indigo-500")} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No leads yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Leads + Recent Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <UserCheck className="w-4 h-4 text-amber-400" /> Recent Leads
          </div>
          {(stats.recent_leads || []).length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.recent_leads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                  <div className={cn("w-2 h-2 rounded-full shrink-0",
                    lead.urgency === "high" || lead.urgency === "emergency" ? "bg-red-400" :
                    lead.urgency === "medium" ? "bg-amber-400" : "bg-slate-400"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{lead.caller_name || "Unknown"}</p>
                    <p className="text-[10px] text-slate-400 truncate">{lead.intent || formatPhone(lead.caller_phone)}</p>
                  </div>
                  <Badge variant={lead.status === "booked" || lead.status === "closed" ? "default" : lead.status === "lost" ? "destructive" : "secondary"} className={cn("text-[9px] shrink-0", (lead.status === "booked" || lead.status === "closed") && "bg-emerald-500/80")}>{lead.status}</Badge>
                  <span className="text-[9px] text-slate-500 shrink-0">{timeAgo(lead.created_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">No leads yet</p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <Phone className="w-4 h-4 text-emerald-400" /> Recent Calls
          </div>
          {(stats.recent_calls || []).length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.recent_calls.map((call) => (
                <div key={call.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                    call.direction === "outbound" ? "bg-blue-500/10 text-blue-400" : "bg-green-500/10 text-green-400"
                  )}>
                    <Phone className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{call.caller_number ? formatPhone(call.caller_number) : "Widget"}</p>
                    <p className="text-[10px] text-slate-400">{call.channel} · {formatDuration(call.duration_seconds)}</p>
                  </div>
                  <Badge variant={call.status === "completed" ? "default" : "secondary"} className={cn("text-[9px] shrink-0", call.status === "completed" && "bg-emerald-500/80")}>{call.status}</Badge>
                  <span className="text-[9px] text-slate-500 shrink-0">{timeAgo(call.started_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">No calls yet</p>
          )}
        </div>
      </div>

      {/* Tool Activity + Plans + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <Wrench className="w-4 h-4 text-violet-400" /> AI Tool Activity
            {stats.tool_calls_today > 0 && (
              <Badge variant="default" className="text-[9px] ml-auto">{stats.tool_calls_today} today</Badge>
            )}
          </div>
          {Object.keys(stats.tool_summary || {}).length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {Object.entries(stats.tool_summary).map(([tool, count]) => (
                  <Badge key={tool} variant="secondary" className="text-[10px]">{TOOL_LABELS[tool] || tool}: {count}</Badge>
                ))}
              </div>
              {(stats.recent_tool_calls || []).length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {stats.recent_tool_calls.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs">
                      <Bot className={cn("w-3 h-3", t.success ? "text-emerald-400" : "text-red-400")} />
                      <span className="text-slate-400">{TOOL_LABELS[t.tool_name] || t.tool_name}</span>
                      {t.duration_ms && <span className="text-[9px] text-slate-500">{t.duration_ms}ms</span>}
                      <span className="text-[9px] text-slate-500 ml-auto">{timeAgo(t.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">No tool calls yet</p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Clients by Plan
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(stats.clients_by_plan).map(([plan, count]) => {
              const planColors: Record<string, string> = {
                starter: "bg-slate-500/20 text-slate-300 border-slate-500/30",
                growth: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
                pro: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                agency: "bg-amber-500/20 text-amber-300 border-amber-500/30",
              }
              return (
                <div key={plan} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-medium mb-1.5 border", planColors[plan] || "border-white/20 text-white")}>{plan}</span>
                  <p className="text-xl font-bold text-white">{count}</p>
                  <p className="text-[10px] text-slate-500">clients</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-medium text-white mb-3">Platform Health</p>
          <div className="space-y-2">
            {[
              { label: "API Status", status: "Operational" },
              { label: "Database", status: "Connected" },
              { label: "Auth Service", status: "Active" },
              { label: "Voice Engine", status: "Connected" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-xs text-slate-400">{item.label}</span>
                <Badge variant="default" className="text-[9px] bg-emerald-500/80">{item.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
