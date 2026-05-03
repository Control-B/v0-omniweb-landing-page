"use client"

import { useEffect, useState } from "react"
import { CalendarClock, Loader2, MailCheck, Save } from "lucide-react"

import { DashboardCard } from "@/components/saas/dashboard-card"

type SchedulingSettings = {
  bookingUrl?: string
  notificationEmail?: string
  resendFromEmail?: string
  resendReplyToEmail?: string
  appointmentInstructions?: string
  schedulingBehavior?: "booking_link_only" | "collect_request_then_link" | "collect_request_then_notify" | string
}

type SchedulingStatus = {
  status: string
  health?: { ok: boolean; status: string; message?: string | null }
  emailIdentity?: {
    configured: boolean
    sender?: string | null
    domain?: string | null
    status: string
    verified: boolean
    fallback: boolean
    message: string
  }
  config: {
    calcomUserId?: string | null
    defaultEventTypeId?: string | null
    eventTypeIds?: string[]
    bookingMode?: string
    status?: string
    settings?: SchedulingSettings
  }
}

const inputClassName =
  "mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"

const textareaClassName =
  "mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"

const behaviorOptions = [
  { value: "booking_link_only", label: "Booking link only" },
  { value: "collect_request_then_link", label: "Collect request, then show booking link" },
  { value: "collect_request_then_notify", label: "Collect request, then notify team" },
]

async function engineFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/engine${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.error || `Request failed (${response.status})`)
  }
  return payload as T
}

export function SchedulingEmailSettingsForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<SchedulingStatus | null>(null)
  const [eventTypeId, setEventTypeId] = useState("")
  const [bookingUrl, setBookingUrl] = useState("")
  const [notificationEmail, setNotificationEmail] = useState("")
  const [resendFromEmail, setResendFromEmail] = useState("")
  const [resendReplyToEmail, setResendReplyToEmail] = useState("")
  const [appointmentInstructions, setAppointmentInstructions] = useState("")
  const [schedulingBehavior, setSchedulingBehavior] = useState("collect_request_then_link")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function load() {
    setLoading(true)
    setError("")
    try {
      const data = await engineFetch<SchedulingStatus>("/scheduling/status")
      const settings = data.config.settings || {}
      setStatus(data)
      setEventTypeId(data.config.defaultEventTypeId || "")
      setBookingUrl(settings.bookingUrl || "")
      setNotificationEmail(settings.notificationEmail || "")
      setResendFromEmail(settings.resendFromEmail || "")
      setResendReplyToEmail(settings.resendReplyToEmail || "")
      setAppointmentInstructions(settings.appointmentInstructions || "")
      setSchedulingBehavior(settings.schedulingBehavior || "collect_request_then_link")
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load scheduling settings.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function save() {
    setSaving(true)
    setMessage("")
    setError("")
    try {
      const data = await engineFetch<SchedulingStatus>("/scheduling/config", {
        method: "PATCH",
        body: JSON.stringify({
          booking_url: bookingUrl.trim(),
          default_event_type_id: eventTypeId.trim(),
          notification_email: notificationEmail.trim(),
          resend_from_email: resendFromEmail.trim(),
          resend_reply_to_email: resendReplyToEmail.trim(),
          appointment_instructions: appointmentInstructions.trim(),
          scheduling_behavior: schedulingBehavior,
        }),
      })
      setStatus(data)
      setMessage("Scheduling email settings saved.")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save scheduling email settings.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardCard className="flex items-center gap-3 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        Loading scheduling email settings...
      </DashboardCard>
    )
  }

  return (
    <DashboardCard className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="dashboard-eyebrow">Scheduling</p>
          <h3 className="dashboard-card-title mt-2">Booking and email settings</h3>
          <p className="dashboard-body mt-2 max-w-3xl">
            Configure how your AI assistant collects appointment requests, where visitors book, and which email identity your
            customer confirmations use. The platform Resend API key stays on the backend.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
          <CalendarClock className="h-3.5 w-3.5 text-blue-600" />
          {status?.status || "not configured"}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white/70 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <CalendarClock className="h-4 w-4 text-blue-600" />
            Booking flow
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700">Cal.com booking URL</label>
            <input
              value={bookingUrl}
              onChange={(event) => setBookingUrl(event.target.value)}
              className={inputClassName}
              placeholder="https://cal.com/your-business/consultation"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Use your tenant-specific booking page. If blank, the engine falls back to its platform default.
            </p>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700">Cal.com event type ID</label>
            <input
              value={eventTypeId}
              onChange={(event) => setEventTypeId(event.target.value)}
              className={inputClassName}
              placeholder="Optional event type ID"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Optional. Use this when the tenant should book against a specific Cal.com event type.
            </p>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700">Assistant scheduling behavior</label>
            <select
              value={schedulingBehavior}
              onChange={(event) => setSchedulingBehavior(event.target.value)}
              className={inputClassName}
            >
              {behaviorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700">Appointment instructions</label>
            <textarea
              value={appointmentInstructions}
              onChange={(event) => setAppointmentInstructions(event.target.value)}
              className={textareaClassName}
              placeholder="Example: Ask what service they need, whether it is urgent, and whether mornings or afternoons work best."
            />
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white/70 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <MailCheck className="h-4 w-4 text-emerald-600" />
            Email identity
          </div>

          {status?.emailIdentity ? (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                status.emailIdentity.verified
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <div className="font-semibold">
                {status.emailIdentity.verified ? "Verified sender" : "Platform sender fallback"}
              </div>
              <p className="mt-1 leading-5">{status.emailIdentity.message}</p>
              {status.emailIdentity.domain ? (
                <p className="mt-1 text-xs opacity-80">
                  Domain: {status.emailIdentity.domain} · Status: {status.emailIdentity.status}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700">Team notification email</label>
            <input
              value={notificationEmail}
              onChange={(event) => setNotificationEmail(event.target.value)}
              className={inputClassName}
              type="email"
              placeholder="team@yourbusiness.com"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Your team receives appointment request notifications here.
            </p>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700">Sender email</label>
            <input
              value={resendFromEmail}
              onChange={(event) => setResendFromEmail(event.target.value)}
              className={inputClassName}
              placeholder="Your Business <appointments@yourbusiness.com>"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              If this domain is verified in Resend, emails send from this address. Otherwise Omniweb's platform sender is used
              and this address can still be used as the reply path.
            </p>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-slate-700">Reply-to email</label>
            <input
              value={resendReplyToEmail}
              onChange={(event) => setResendReplyToEmail(event.target.value)}
              className={inputClassName}
              type="email"
              placeholder="frontdesk@yourbusiness.com"
            />
          </div>
        </section>
      </div>

      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:w-auto sm:px-6"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save scheduling settings"}
        </button>
      </div>
    </DashboardCard>
  )
}
