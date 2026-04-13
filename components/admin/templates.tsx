"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { adminGetTemplates, adminCreateTemplate, adminUpdateTemplate, adminDeleteTemplate } from "@/lib/admin-api"
import { cn } from "@/lib/utils"
import { Plus, Loader2, AlertCircle, Pencil, Trash2, X, Check, FileText, Star } from "lucide-react"

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flag: "��🇸" }, { code: "es", label: "Spanish", flag: "🇪��" },
  { code: "fr", label: "French", flag: "🇫🇷" }, { code: "de", label: "German", flag: "🇩🇪" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" }, { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "pt", label: "Portuguese", flag: "🇧🇷" }, { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" }, { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "zh", label: "Chinese", flag: "🇨🇳" }, { code: "nl", label: "Dutch", flag: "🇳🇱" },
  { code: "pl", label: "Polish", flag: "🇵🇱" }, { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "tr", label: "Turkish", flag: "🇹🇷" }, { code: "uk", label: "Ukrainian", flag: "🇺🇦" },
]
const ALL_LANGUAGE_CODES = LANGUAGE_OPTIONS.map((l) => l.code)

interface Template {
  id: string; name: string; description: string | null; industry: string | null;
  agent_name: string; greeting: string; supported_languages: string[];
  system_prompt: string | null; is_default: boolean; is_active: boolean; created_at: string
}

const EMPTY_FORM = {
  name: "", description: "", industry: "", agent_name: "", greeting: "",
  supported_languages: ALL_LANGUAGE_CODES, system_prompt: "", is_default: false, is_active: true,
}

export function AdminTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function fetchTemplates() {
    setLoading(true)
    try { const res = await adminGetTemplates(); setTemplates(Array.isArray(res) ? res : res.templates || []) }
    catch (e: unknown) { setError((e as Error).message) }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchTemplates() }, [])

  function openCreate() { setForm({ ...EMPTY_FORM }); setEditingId(null); setShowForm(true) }
  function openEdit(t: Template) {
    setForm({ name: t.name, description: t.description || "", industry: t.industry || "", agent_name: t.agent_name, greeting: t.greeting, supported_languages: t.supported_languages ?? ["en"], system_prompt: t.system_prompt || "", is_default: t.is_default, is_active: t.is_active })
    setEditingId(t.id); setShowForm(true)
  }
  function closeForm() { setShowForm(false); setEditingId(null) }

  async function handleSave() {
    setSaving(true)
    try { if (editingId) await adminUpdateTemplate(editingId, form); else await adminCreateTemplate(form); closeForm(); fetchTemplates() }
    catch (e: unknown) { alert("Failed to save: " + (e as Error).message) }
    finally { setSaving(false) }
  }
  async function handleDelete(t: Template) {
    if (!confirm(`Delete template "${t.name}"? This cannot be undone.`)) return
    try { await adminDeleteTemplate(t.id); fetchTemplates() }
    catch (e: unknown) { alert("Failed to delete: " + (e as Error).message) }
  }

  function updateField(key: string, value: unknown) { setForm((f) => ({ ...f, [key]: value })) }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Agent Templates</h1><p className="text-sm text-slate-400 mt-1">Pre-built agent configurations for new clients</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 h-9 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"><Plus className="w-4 h-4" />New Template</button>
      </div>

      {error && <div className="flex items-center gap-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}

      {showForm && (
        <div className="rounded-xl border border-indigo-500/30 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">{editingId ? "Edit Template" : "Create Template"}</h3>
            <button onClick={closeForm} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs text-slate-400 font-medium block mb-1.5">Template Name *</label><Input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g. Auto Mechanic" className="bg-white/5 border-white/10 text-white" /></div>
            <div><label className="text-xs text-slate-400 font-medium block mb-1.5">Industry</label><Input value={form.industry} onChange={(e) => updateField("industry", e.target.value)} placeholder="e.g. Automotive" className="bg-white/5 border-white/10 text-white" /></div>
            <div><label className="text-xs text-slate-400 font-medium block mb-1.5">Agent Name *</label><Input value={form.agent_name} onChange={(e) => updateField("agent_name", e.target.value)} placeholder="e.g. Max" className="bg-white/5 border-white/10 text-white" /></div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1.5">Languages ({form.supported_languages.length} selected)</label>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const on = form.supported_languages.includes(lang.code)
                  return (
                    <button key={lang.code} type="button" onClick={() => { if (lang.code === "en") return; const next = on ? form.supported_languages.filter((c: string) => c !== lang.code) : [...form.supported_languages, lang.code]; updateField("supported_languages", next) }}
                      className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs transition-colors", on ? "border-indigo-500 bg-indigo-500/10 text-white" : "border-white/10 text-slate-400 hover:border-white/30", lang.code === "en" ? "cursor-default" : "cursor-pointer")}>
                      <span>{lang.flag}</span><span>{lang.code.toUpperCase()}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="md:col-span-2"><label className="text-xs text-slate-400 font-medium block mb-1.5">Description</label><Input value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Brief description" className="bg-white/5 border-white/10 text-white" /></div>
            <div className="md:col-span-2"><label className="text-xs text-slate-400 font-medium block mb-1.5">Greeting Message *</label><textarea value={form.greeting} onChange={(e) => updateField("greeting", e.target.value)} placeholder="Hello! Thanks for calling..." rows={3} className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none" /></div>
            <div className="md:col-span-2"><label className="text-xs text-slate-400 font-medium block mb-1.5">System Prompt</label><textarea value={form.system_prompt} onChange={(e) => updateField("system_prompt", e.target.value)} placeholder="You are a helpful AI assistant..." rows={4} className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none" /></div>
            <div className="md:col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_default} onChange={(e) => updateField("is_default", e.target.checked)} className="w-4 h-4 rounded accent-indigo-500" /><span className="text-sm text-white">Default template</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => updateField("is_active", e.target.checked)} className="w-4 h-4 rounded accent-indigo-500" /><span className="text-sm text-white">Active</span></label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={closeForm} className="h-9 px-4 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name || !form.agent_name || !form.greeting} className="flex items-center gap-2 h-9 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}{editingId ? "Update" : "Create"}</button>
          </div>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="text-center py-20 text-slate-400 text-sm">No templates yet. Create one to get started.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className={cn("rounded-xl border border-white/10 bg-white/5 p-5 relative", !t.is_active && "opacity-60")}>
              {t.is_default && <div className="absolute top-3 right-3"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /></div>}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-indigo-400" /></div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{t.name}</h3>
                  {t.industry && <Badge variant="outline" className="mt-1">{t.industry}</Badge>}
                </div>
              </div>
              {t.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{t.description}</p>}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs"><span className="text-slate-400">Agent</span><span className="text-white font-medium">{t.agent_name}</span></div>
                <div className="flex items-center justify-between text-xs"><span className="text-slate-400">Languages</span><span className="text-white font-medium">{t.supported_languages?.length ?? 1} enabled</span></div>
                <div className="flex items-center justify-between text-xs"><span className="text-slate-400">Status</span><Badge variant={t.is_active ? "default" : "secondary"} className={cn("text-[10px]", t.is_active && "bg-emerald-500/80")}>{t.is_active ? "Active" : "Inactive"}</Badge></div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                <button onClick={() => openEdit(t)} className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><Pencil className="w-3.5 h-3.5" />Edit</button>
                <button onClick={() => handleDelete(t)} className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" />Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
