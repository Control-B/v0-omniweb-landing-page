"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Copy, Loader2, RefreshCw, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { fetchWidgetSettings, saveWidgetSettings } from "@/lib/saas/widgetService"
import type { WidgetSettingsRecord } from "@/lib/saas/types"

const sectionClassName = "rounded-[1.75rem] border border-slate-200 bg-white/80 p-5 shadow-[0_10px_25px_rgba(148,163,184,0.08)]"
const inputClassName = "mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
const textareaClassName = "mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"

type WidgetFormState = {
  widgetEnabled: boolean
  voiceEnabled: boolean
  widgetPosition: "bottom-right" | "bottom-left"
  widgetPrimaryColor: string
  widgetWelcomeMessage: string
  allowedDomainsText: string
}

function toFormState(settings: WidgetSettingsRecord): WidgetFormState {
  return {
    widgetEnabled: settings.widgetEnabled,
    voiceEnabled: settings.voiceEnabled,
    widgetPosition: settings.widgetPosition,
    widgetPrimaryColor: settings.widgetPrimaryColor,
    widgetWelcomeMessage: settings.widgetWelcomeMessage,
    allowedDomainsText: settings.allowedDomains.join("\n"),
  }
}

function splitDomains(value: string): string[] {
  return value
    .split(/\n|,/) 
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatLastSeen(value: string | null) {
  if (!value) return "Not installed"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Installed"
  return `Installed · Last seen ${date.toLocaleString()}`
}

export function WidgetInstallCard() {
  const [settings, setSettings] = useState<WidgetSettingsRecord | null>(null)
  const [form, setForm] = useState<WidgetFormState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError("")
        const next = await fetchWidgetSettings()
        if (cancelled) return
        setSettings(next)
        setForm(toFormState(next))
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load widget settings.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const installStatusTone = useMemo(() => {
    return settings?.widgetInstalled ? "text-emerald-600" : "text-amber-600"
  }, [settings?.widgetInstalled])

  const updateField = <K extends keyof WidgetFormState>(key: K, value: WidgetFormState[K]) => {
    setForm((current) => current ? { ...current, [key]: value } : current)
    setMessage("")
    setError("")
  }

  const copyCode = async () => {
    if (!settings?.embedCode) return
    await navigator.clipboard.writeText(settings.embedCode)
    setCopied(true)
    setMessage("Embed code copied.")
    window.setTimeout(() => setCopied(false), 1500)
  }

  const reloadStatus = async () => {
    try {
      setChecking(true)
      setError("")
      const next = await fetchWidgetSettings()
      setSettings(next)
      setForm(toFormState(next))
      setMessage(next.widgetInstalled ? "Install verified from the latest widget activity." : "No install ping detected yet.")
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to verify install status.")
    } finally {
      setChecking(false)
    }
  }

  const submit = async () => {
    if (!form) return
    try {
      setSaving(true)
      setError("")
      const next = await saveWidgetSettings({
        widgetEnabled: form.widgetEnabled,
        voiceEnabled: form.voiceEnabled,
        widgetPosition: form.widgetPosition,
        widgetPrimaryColor: form.widgetPrimaryColor,
        widgetWelcomeMessage: form.widgetWelcomeMessage,
        allowedDomains: splitDomains(form.allowedDomainsText),
      })
      setSettings(next)
      setForm(toFormState(next))
      setMessage("Widget settings saved.")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save widget settings.")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form || !settings) {
    return (
      <section className={sectionClassName}>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading widget installation settings…
        </div>
      </section>
    )
  }

  return (
    <section className={sectionClassName}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Widget install</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Install once, control remotely from the dashboard</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Copy this script and paste it before the closing <code className="rounded bg-slate-100 px-1 text-slate-700">&lt;/body&gt;</code> tag on your website. After that, you can manage the AI widget from this dashboard without touching code again.
          </p>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-full border border-current/10 bg-white px-4 py-2 text-sm font-semibold ${installStatusTone}`}>
          <CheckCircle2 className="h-4 w-4" />
          {formatLastSeen(settings.widgetLastSeenAt)}
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Embed code</p>
              <Button type="button" variant="outline" size="sm" className="border-white/15 bg-white/10 text-white hover:bg-white/15" onClick={copyCode}>
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy code"}
              </Button>
            </div>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-all text-xs leading-6 text-cyan-100">{settings.embedCode}</pre>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Widget enabled</p>
                  <p className="mt-1 text-sm text-slate-600">Block or allow the public widget without changing code on the site.</p>
                </div>
                <Switch checked={form.widgetEnabled} onCheckedChange={(checked) => updateField("widgetEnabled", checked)} />
              </div>
            </label>

            <label className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Voice enabled</p>
                  <p className="mt-1 text-sm text-slate-600">Show the voice action in the widget when voice is part of your rollout.</p>
                </div>
                <Switch checked={form.voiceEnabled} onCheckedChange={(checked) => updateField("voiceEnabled", checked)} />
              </div>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Widget position</span>
              <select className={inputClassName} value={form.widgetPosition} onChange={(event) => updateField("widgetPosition", event.target.value as WidgetFormState["widgetPosition"])}>
                <option value="bottom-right">Bottom right</option>
                <option value="bottom-left">Bottom left</option>
              </select>
            </label>

            <label className="block rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Primary color</span>
              <div className="mt-2 flex items-center gap-3">
                <input type="color" value={form.widgetPrimaryColor} onChange={(event) => updateField("widgetPrimaryColor", event.target.value)} className="h-11 w-14 rounded-xl border border-slate-200 bg-white px-1" />
                <Input value={form.widgetPrimaryColor} onChange={(event) => updateField("widgetPrimaryColor", event.target.value)} />
              </div>
            </label>
          </div>

          <label className="block rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Allowed domains</span>
            <p className="mt-1 text-sm">Use one domain per line. `www` and non-`www` are normalized together.</p>
            <textarea className={textareaClassName} value={form.allowedDomainsText} onChange={(event) => updateField("allowedDomainsText", event.target.value)} placeholder="example.com\nshop.example.com" />
          </label>

          <label className="block rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Welcome message</span>
            <textarea className={textareaClassName} value={form.widgetWelcomeMessage} onChange={(event) => updateField("widgetWelcomeMessage", event.target.value)} placeholder="Welcome! How can I help you today?" />
          </label>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Install status</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex items-center justify-between gap-3"><span>Public widget ID</span><span className="font-mono text-xs text-slate-900">{settings.publicWidgetId}</span></li>
              <li className="flex items-center justify-between gap-3"><span>Install state</span><span className={settings.widgetInstalled ? "font-semibold text-emerald-600" : "font-semibold text-amber-600"}>{settings.widgetInstalled ? "Installed" : "Not installed"}</span></li>
              <li className="flex items-center justify-between gap-3"><span>Last seen</span><span className="text-right text-slate-900">{settings.widgetLastSeenAt ? new Date(settings.widgetLastSeenAt).toLocaleString() : "Never"}</span></li>
            </ul>
            <Button type="button" variant="outline" className="mt-5 w-full justify-center" onClick={reloadStatus} disabled={checking}>
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Verify install
            </Button>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Remote control summary</p>
            <p className="mt-2">This widget now handshakes with the backend using the public widget ID, validates the current domain, and only loads when the account is active and the widget is enabled.</p>
          </div>

          <Button type="button" className="w-full justify-center rounded-2xl bg-slate-900 text-white hover:bg-slate-800" onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save widget settings
          </Button>

          {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}
          {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
        </div>
      </div>
    </section>
  )
}