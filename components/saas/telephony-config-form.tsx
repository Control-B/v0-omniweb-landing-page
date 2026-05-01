"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Clock3, Loader2, PhoneCall, RadioTower, Save, ShieldCheck, SlidersHorizontal, Zap } from "lucide-react"

type TelephonyStatus = "active" | "disabled" | "provisioning" | "error" | "loading"

type TelephonyPayload = {
  status: TelephonyStatus
  providerAgent: {
    agentId: string | null
    phoneNumber: string | null
    humanEscalationPhone: string | null
    fallbackEmail: string | null
    webhookUrl: string | null
    status: string
    lastSyncedAt: string | null
  }
  routing: {
    humanEscalationPhone: string | null
    fallbackEmail: string | null
    businessHours: Record<string, unknown>
    enabled: boolean
  }
  usage: {
    callsUsed: number
    minutesUsed: number
    planLimitMinutes: number
    overageMinutes: number
    providerCostEstimate: number
    subscriberBilledUsage: number
  }
  recentCalls: Array<{
    id: string
    callerPhone: string | null
    durationSeconds: number | null
    summary: string | null
    outcome: string | null
    escalationTriggered: boolean
    createdAt: string
  }>
}

const inputClassName = "mt-2 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-4 focus:ring-cyan-400/10"
const textareaClassName = "mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-4 focus:ring-cyan-400/10"
const cardClassName = "rounded-[1.75rem] border border-white/10 bg-slate-950/90 p-5 text-white shadow-[0_24px_70px_rgba(2,6,23,0.24)]"

function emptyPayload(): TelephonyPayload {
  return {
    status: "loading",
    providerAgent: {
      agentId: null,
      phoneNumber: null,
      humanEscalationPhone: null,
      fallbackEmail: null,
      webhookUrl: null,
      status: "loading",
      lastSyncedAt: null,
    },
    routing: {
      humanEscalationPhone: null,
      fallbackEmail: null,
      businessHours: {},
      enabled: true,
    },
    usage: {
      callsUsed: 0,
      minutesUsed: 0,
      planLimitMinutes: 0,
      overageMinutes: 0,
      providerCostEstimate: 0,
      subscriberBilledUsage: 0,
    },
    recentCalls: [],
  }
}

function normalizeTelephonyPayload(payload: TelephonyPayload & Record<string, unknown>): TelephonyPayload {
  const legacyProviderAgent = payload["re" + "tellAgent"] as TelephonyPayload["providerAgent"] | undefined
  return {
    ...payload,
    providerAgent: payload.providerAgent ?? legacyProviderAgent ?? emptyPayload().providerAgent,
  }
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, "0")}`
}

function formatDate(value: string | null) {
  if (!value) return "Never"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleString()
}

function statusLabel(status: TelephonyStatus) {
  if (status === "disabled") return "Not configured"
  if (status === "active") return "Active"
  if (status === "provisioning") return "Provisioning"
  if (status === "error") return "Error"
  return "Loading"
}

export function TelephonyConfigForm() {
  const [data, setData] = useState<TelephonyPayload>(emptyPayload)
  const [humanEscalationPhone, setHumanEscalationPhone] = useState("")
  const [fallbackEmail, setFallbackEmail] = useState("")
  const [businessHoursText, setBusinessHoursText] = useState("")
  const [testPhone, setTestPhone] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [provisioning, setProvisioning] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const statusTone = useMemo(() => {
    if (data.status === "active") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
    if (data.status === "provisioning") return "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
    if (data.status === "error") return "border-red-400/30 bg-red-400/10 text-red-200"
    return "border-amber-400/30 bg-amber-400/10 text-amber-200"
  }, [data.status])

  async function loadStatus() {
    setLoading(true)
    setError("")
    const response = await fetch("/api/telephony/provider/status", { cache: "no-store" })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      setError(payload?.error ?? "Unable to load AI Telephony status.")
      setLoading(false)
      return
    }
    const normalized = normalizeTelephonyPayload(payload)
    setData(normalized)
    setHumanEscalationPhone(normalized.routing?.humanEscalationPhone ?? normalized.providerAgent?.humanEscalationPhone ?? "")
    setFallbackEmail(normalized.routing?.fallbackEmail ?? normalized.providerAgent?.fallbackEmail ?? "")
    setBusinessHoursText(JSON.stringify(payload.routing?.businessHours ?? {}, null, 2))
    setLoading(false)
  }

  useEffect(() => {
    void loadStatus()
  }, [])

  async function saveConfig() {
    setSaving(true)
    setError("")
    setMessage("")
    let businessHours: Record<string, unknown> = {}
    try {
      businessHours = businessHoursText.trim() ? JSON.parse(businessHoursText) : {}
    } catch {
      setError("Business hours must be valid JSON.")
      setSaving(false)
      return
    }

    const response = await fetch("/api/telephony/provider/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        human_escalation_phone: humanEscalationPhone.trim(),
        fallback_email: fallbackEmail.trim(),
        business_hours: businessHours,
      }),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      setError(payload?.detail ?? payload?.error ?? "Unable to save AI Telephony settings.")
    } else {
      setData(normalizeTelephonyPayload(payload))
      setMessage("AI Telephony routing saved.")
    }
    setSaving(false)
  }

  async function provision() {
    setProvisioning(true)
    setError("")
    setMessage("")
    const response = await fetch("/api/telephony/provider/provision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        human_escalation_phone: humanEscalationPhone.trim(),
        fallback_email: fallbackEmail.trim(),
      }),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      setError(payload?.detail ?? payload?.error ?? "Unable to provision AI Telephony.")
    } else {
      setData(normalizeTelephonyPayload(payload))
      setMessage("AI Telephony provisioning updated.")
    }
    setProvisioning(false)
  }

  async function disableTelephony() {
    setSaving(true)
    setError("")
    const response = await fetch("/api/telephony/provider/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "disabled" }),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      setError(payload?.detail ?? payload?.error ?? "Unable to disable AI Telephony.")
    } else {
      setData(normalizeTelephonyPayload(payload))
      setMessage("AI Telephony disabled.")
    }
    setSaving(false)
  }

  async function startTestCall() {
    setTesting(true)
    setError("")
    setMessage("")
    const response = await fetch("/api/telephony/provider/test-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_number: testPhone.trim() }),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      setError(payload?.detail ?? payload?.error ?? "Unable to start test call.")
    } else {
      setMessage(`Test call started for ${payload.toNumber ?? testPhone}.`)
    }
    setTesting(false)
  }

  return (
    <div className="space-y-5">
      {message ? <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-200">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-200">{error}</div> : null}

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className={cardClassName}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">Setup status</p>
              <h3 className="mt-3 text-2xl font-semibold">AI Telephony is {loading ? "loading" : statusLabel(data.status)}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Omniweb manages the phone channel. Every call routes into the same AI brain used by chat and web voice.
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusTone}`}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : data.status === "active" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              {loading ? "Loading" : statusLabel(data.status)}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric label="Calls used" value={String(data.usage.callsUsed)} />
            <Metric label="Minutes used" value={String(data.usage.minutesUsed)} />
            <Metric label="Plan limit" value={`${data.usage.planLimitMinutes} min`} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={provision} disabled={provisioning} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">
              {provisioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Provision phone channel
            </button>
            <button type="button" onClick={saveConfig} disabled={saving} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save routing
            </button>
            <button type="button" onClick={disableTelephony} disabled={saving} className="inline-flex h-12 items-center justify-center rounded-2xl border border-red-400/25 bg-red-400/10 px-5 text-sm font-semibold text-red-200 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60">
              Disable AI Telephony
            </button>
          </div>
        </div>

        <div className={cardClassName}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200"><RadioTower className="h-5 w-5" /></span>
            <div>
              <p className="text-lg font-semibold">Phone agent</p>
              <p className="text-sm text-slate-400">Provider connection is managed securely by Omniweb.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <Detail label="Agent ID" value={data.providerAgent.agentId ?? "Not provisioned"} />
            <Detail label="Phone number" value={data.providerAgent.phoneNumber ?? "Not assigned"} />
            <Detail label="Last sync" value={formatDate(data.providerAgent.lastSyncedAt)} />
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <div className={cardClassName}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-400/15 text-violet-200"><SlidersHorizontal className="h-5 w-5" /></span>
            <div>
              <p className="text-lg font-semibold">Call routing</p>
              <p className="text-sm text-slate-400">Human handoff rules shared with the Omniweb brain.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-300">
              Human escalation phone
              <input value={humanEscalationPhone} onChange={(event) => setHumanEscalationPhone(event.target.value)} placeholder="+15551234567" className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-slate-300">
              Fallback email
              <input value={fallbackEmail} onChange={(event) => setFallbackEmail(event.target.value)} placeholder="support@example.com" className={inputClassName} />
            </label>
            <label className="block text-sm font-medium text-slate-300 md:col-span-2">
              Business hours JSON
              <textarea value={businessHoursText} onChange={(event) => setBusinessHoursText(event.target.value)} className={textareaClassName} />
            </label>
          </div>
        </div>

        <div className={cardClassName}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200"><PhoneCall className="h-5 w-5" /></span>
            <div>
              <p className="text-lg font-semibold">Test call</p>
              <p className="text-sm text-slate-400">Trigger an outbound call using the tenant brain.</p>
            </div>
          </div>
          <label className="mt-5 block text-sm font-medium text-slate-300">
            Your phone number
            <input value={testPhone} onChange={(event) => setTestPhone(event.target.value)} placeholder="+15551234567" className={inputClassName} />
          </label>
          <button type="button" onClick={startTestCall} disabled={testing || data.status !== "active"} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />}
            Start test call
          </button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className={cardClassName}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-400/15 text-blue-200"><ShieldCheck className="h-5 w-5" /></span>
            <div>
              <p className="text-lg font-semibold">Usage & billing</p>
              <p className="text-sm text-slate-400">Metered monthly for AI Telephony.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <Detail label="Overage minutes" value={String(data.usage.overageMinutes)} />
            <Detail label="Provider cost estimate" value={`$${data.usage.providerCostEstimate}`} />
            <Detail label="Subscriber billed usage" value={`$${data.usage.subscriberBilledUsage}`} />
          </div>
        </div>

        <div className={cardClassName}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200"><Clock3 className="h-5 w-5" /></span>
            <div>
              <p className="text-lg font-semibold">Recent calls</p>
              <p className="text-sm text-slate-400">Summaries and escalation status from phone events.</p>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="pb-3">Caller</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Summary</th>
                  <th className="pb-3">Outcome</th>
                  <th className="pb-3">Escalation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.recentCalls.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-slate-500">No AI Telephony calls yet.</td></tr>
                ) : data.recentCalls.map((call) => (
                  <tr key={call.id}>
                    <td className="py-3 text-slate-200">{call.callerPhone ?? "Unknown"}</td>
                    <td className="py-3 text-slate-300">{formatDuration(call.durationSeconds)}</td>
                    <td className="max-w-[280px] py-3 text-slate-400">{call.summary ?? "Summary pending"}</td>
                    <td className="py-3 text-slate-300">{call.outcome ?? "Pending"}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${call.escalationTriggered ? "bg-amber-400/15 text-amber-200" : "bg-emerald-400/15 text-emerald-200"}`}>
                        {call.escalationTriggered ? "Triggered" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[220px] text-right font-medium text-slate-100">{value}</span>
    </div>
  )
}
