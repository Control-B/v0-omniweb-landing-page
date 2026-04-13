"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { adminGetClient, adminPatchClient } from "@/lib/admin-api"
import { cn } from "@/lib/utils"
import { ArrowLeft, Loader2, AlertCircle, Phone, UserCheck, Hash, Bot, Calendar, Mail, Building2, Shield, Save, Check, Globe } from "lucide-react"

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

interface ClientDetail {
  id: string; name: string; email: string;
  business_name: string | null; business_type: string | null;
  plan: string; role: string; is_active: boolean;
  created_at: string; api_key: string;
  call_count: number; lead_count: number; number_count: number;
  agent_config?: { agent_name: string; greeting: string; language: string; supported_languages?: string[] } | null
}

interface AdminClientDetailProps { clientId: string; onBack: () => void }

const planOptions = ["starter", "growth", "pro", "agency"]

export function AdminClientDetail({ clientId, onBack }: AdminClientDetailProps) {
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editPlan, setEditPlan] = useState("")
  const [editActive, setEditActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLoading(true)
    adminGetClient(clientId)
      .then((c) => { setClient(c); setEditPlan(c.plan); setEditActive(c.is_active) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [clientId])

  async function handleSave() {
    if (!client) return
    setSaving(true)
    try {
      const updated = await adminPatchClient(client.id, { plan: editPlan, is_active: editActive })
      setClient({ ...client, ...updated }); setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) { alert("Failed to save: " + (e as Error).message) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
  if (error || !client) return <div className="flex items-center justify-center h-full"><div className="flex items-center gap-2 text-red-400"><AlertCircle className="w-5 h-5" /><span className="text-sm">{error || "Client not found"}</span></div></div>

  const infoFields = [
    { icon: Mail, label: "Email", value: client.email },
    { icon: Building2, label: "Business", value: client.business_name || "—" },
    { icon: Shield, label: "Role", value: client.role },
    { icon: Calendar, label: "Joined", value: new Date(client.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
  ]

  const statCards = [
    { label: "Calls", value: client.call_count, icon: Phone, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Leads", value: client.lead_count, icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Numbers", value: client.number_count, icon: Hash, color: "text-purple-400", bg: "bg-purple-500/10" },
  ]

  const planColors: Record<string, string> = {
    starter: "bg-slate-500/20 text-slate-300", growth: "bg-indigo-500/20 text-indigo-300",
    pro: "bg-emerald-500/20 text-emerald-300", agency: "bg-amber-500/20 text-amber-300",
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white truncate">{client.name}</h1>
            <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", planColors[client.plan] || "bg-white/10 text-white")}>{client.plan}</span>
            <Badge variant={client.is_active ? "default" : "destructive"} className={cn(client.is_active && "bg-emerald-500/80")}>{client.is_active ? "Active" : "Inactive"}</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">{client.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-slate-400 font-medium">{s.label}</p><p className="text-2xl font-bold text-white mt-1">{s.value}</p></div>
              <div className={cn(s.bg, s.color, "p-3 rounded-xl")}><s.icon className="w-5 h-5" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Client Information</h3>
          <div className="space-y-4">
            {infoFields.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0"><f.icon className="w-4 h-4 text-slate-400" /></div>
                <div className="min-w-0"><p className="text-[11px] text-slate-500">{f.label}</p><p className="text-sm text-white truncate">{f.value}</p></div>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0"><Shield className="w-4 h-4 text-slate-400" /></div>
              <div className="min-w-0"><p className="text-[11px] text-slate-500">API Key</p><p className="text-sm text-white font-mono truncate">{client.api_key?.slice(0, 12)}...</p></div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Manage Client</h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5">Subscription Plan</label>
              <select value={editPlan} onChange={(e) => setEditPlan(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                {planOptions.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5">Account Status</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setEditActive(true)} className={cn("flex-1 h-10 rounded-lg border text-sm font-medium transition-colors", editActive ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10")}>Active</button>
                <button onClick={() => setEditActive(false)} className={cn("flex-1 h-10 rounded-lg border text-sm font-medium transition-colors", !editActive ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10")}>Inactive</button>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="w-full h-10 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" />Saved</> : <><Save className="w-4 h-4" />Save Changes</>}
            </button>
          </div>
        </div>

        {client.agent_config && (
          <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Bot className="w-4 h-4 text-indigo-400" />Agent Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white/5"><p className="text-[11px] text-slate-500 font-medium">Agent Name</p><p className="text-sm text-white mt-1">{client.agent_config.agent_name}</p></div>
              <div className="p-4 rounded-lg bg-white/5"><p className="text-[11px] text-slate-500 font-medium">Language</p><p className="text-sm text-white mt-1">{LANGUAGE_FLAGS[client.agent_config.language] ?? "🌐"} {LANGUAGE_LABELS[client.agent_config.language] ?? client.agent_config.language}</p></div>
              <div className="p-4 rounded-lg bg-white/5"><p className="text-[11px] text-slate-500 font-medium">Greeting</p><p className="text-sm text-white mt-1 line-clamp-2">{client.agent_config.greeting}</p></div>
            </div>
            {client.agent_config.supported_languages && client.agent_config.supported_languages.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2"><Globe className="w-4 h-4 text-slate-400" /><p className="text-xs text-slate-400 font-medium">Supported Languages ({client.agent_config.supported_languages.length})</p></div>
                <div className="flex flex-wrap gap-1.5">
                  {client.agent_config.supported_languages.map((code: string) => (
                    <Badge key={code} variant="outline" className="text-[11px] px-2.5 py-0.5 gap-1"><span>{LANGUAGE_FLAGS[code] ?? "🌐"}</span>{LANGUAGE_LABELS[code] ?? code.toUpperCase()}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
