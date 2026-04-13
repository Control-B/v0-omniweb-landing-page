"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { adminGetAgents, timeAgo } from "@/lib/admin-api"
import { cn } from "@/lib/utils"
import { Bot, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"

const LANGUAGE_FLAGS: Record<string, string> = {
  ar: "🇸🇦", de: "🇩🇪", en: "🇺🇸", es: "🇪🇸", fr: "🇫🇷", hi: "🇮🇳",
  it: "🇮🇹", ja: "🇯🇵", ko: "🇰🇷", nl: "🇳🇱", pl: "🇵🇱", pt: "🇧🇷",
  ru: "🇷🇺", tr: "🇹🇷", uk: "🇺🇦", zh: "🇨🇳",
}
const LANGUAGE_LABELS: Record<string, string> = {
  ar: "Arabic", de: "German", en: "English", es: "Spanish", fr: "French", hi: "Hindi",
  it: "Italian", ja: "Japanese", ko: "Korean", nl: "Dutch", pl: "Polish", pt: "Portuguese",
  ru: "Russian", tr: "Turkish", uk: "Ukrainian", zh: "Chinese",
}

interface Agent {
  id: string; client_id: string; client_name: string; client_email: string;
  business_name: string | null; plan: string; is_active: boolean;
  agent_name: string; elevenlabs_agent_id: string | null;
  language: string; supported_languages: string[];
  greeting: string; system_prompt: string;
  call_count: number; lead_count: number;
  created_at: string | null; updated_at: string | null
}

export function AdminAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    adminGetAgents()
      .then((res) => setAgents(res.agents || []))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
  if (error) return <div className="flex items-center justify-center h-full"><div className="flex items-center gap-2 text-red-400"><AlertCircle className="w-5 h-5" /><span className="text-sm">{error}</span></div></div>

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Agents</h1>
          <p className="text-sm text-slate-400 mt-1">All AI agents deployed across client accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-white">{agents.length}</span>
          <span className="text-sm text-slate-400">deployed</span>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <Bot className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-white font-medium">No agents deployed yet</p>
          <p className="text-xs text-slate-500 mt-1">Agents will appear here when clients are configured</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => {
            const isExpanded = expandedId === agent.id
            const planColors: Record<string, string> = {
              starter: "bg-slate-500/20 text-slate-300", growth: "bg-indigo-500/20 text-indigo-300",
              pro: "bg-emerald-500/20 text-emerald-300", agency: "bg-amber-500/20 text-amber-300",
            }
            return (
              <div key={agent.id} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setExpandedId(isExpanded ? null : agent.id)}>
                  <div className={cn("flex items-center justify-center w-11 h-11 rounded-xl shrink-0", agent.is_active ? "bg-indigo-500/10 text-indigo-400" : "bg-red-500/10 text-red-400")}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{agent.agent_name}</p>
                      <Badge variant={agent.is_active ? "default" : "destructive"} className={cn("text-[9px]", agent.is_active && "bg-emerald-500/80")}>{agent.is_active ? "live" : "inactive"}</Badge>
                      <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium", planColors[agent.plan] || "bg-white/10 text-white")}>{agent.plan}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{agent.business_name || agent.client_name} · {agent.client_email}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-5">
                    <div className="text-center"><p className="text-sm font-bold text-white">{agent.call_count}</p><p className="text-[9px] text-slate-500">Calls</p></div>
                    <div className="text-center"><p className="text-sm font-bold text-white">{agent.lead_count}</p><p className="text-[9px] text-slate-500">Leads</p></div>
                    <div className="text-center"><p className="text-sm text-white">{LANGUAGE_FLAGS[agent.language] ?? "🌐"}</p><p className="text-[9px] text-slate-500">{LANGUAGE_LABELS[agent.language] ?? agent.language}</p></div>
                  </div>
                  <div className="text-slate-400 shrink-0">{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
                </div>
                {isExpanded && (
                  <div className="border-t border-white/10 p-5 bg-white/[0.02] space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { label: "Agent ID", value: agent.elevenlabs_agent_id || "not linked" },
                        { label: "Client ID", value: agent.client_id },
                        { label: "Created", value: agent.created_at ? new Date(agent.created_at).toLocaleDateString() : "—" },
                        { label: "Last Updated", value: agent.updated_at ? timeAgo(agent.updated_at) : "—" },
                      ].map((f) => (
                        <div key={f.label} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-[10px] text-slate-500 font-medium">{f.label}</p>
                          <p className="text-xs text-white mt-0.5 font-mono truncate">{f.value}</p>
                        </div>
                      ))}
                    </div>
                    {agent.greeting && (
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium mb-1">Welcome Message</p>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10"><p className="text-sm text-white">{agent.greeting}</p></div>
                      </div>
                    )}
                    {agent.system_prompt && (
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium mb-1">Instructions Preview</p>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap">{agent.system_prompt.slice(0, 500)}{agent.system_prompt.length > 500 && "…"}</p>
                        </div>
                      </div>
                    )}
                    {agent.supported_languages.length > 0 && (
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium mb-1">Supported Languages ({agent.supported_languages.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {agent.supported_languages.map((code) => (
                            <Badge key={code} variant="outline" className="text-[11px] px-2 py-0.5 gap-1">
                              <span>{LANGUAGE_FLAGS[code] ?? "🌐"}</span>{LANGUAGE_LABELS[code] ?? code}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
