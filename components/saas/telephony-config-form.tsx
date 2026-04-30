"use client"

import type { FormEvent } from "react"
import { useState } from "react"

type TelephonyConfigFormProps = {
  initialConfig: {
    omniwebPhoneAgentId: string
    aiPhoneNumber: string
    escalationPhone: string
    escalationEmail: string
    escalationMessage: string
  }
}

const inputClassName = "mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
const textareaClassName = "mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"

export function TelephonyConfigForm({ initialConfig }: TelephonyConfigFormProps) {
  const [omniwebPhoneAgentId, setOmniwebPhoneAgentId] = useState(initialConfig.omniwebPhoneAgentId)
  const [aiPhoneNumber, setAiPhoneNumber] = useState(initialConfig.aiPhoneNumber)
  const [escalationPhone, setEscalationPhone] = useState(initialConfig.escalationPhone)
  const [escalationEmail, setEscalationEmail] = useState(initialConfig.escalationEmail)
  const [escalationMessage, setEscalationMessage] = useState(initialConfig.escalationMessage)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    const response = await fetch("/api/telephony/config", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        omniwebPhoneAgentId: omniwebPhoneAgentId.trim(),
        aiPhoneNumber: aiPhoneNumber.trim(),
        escalationPhone: escalationPhone.trim(),
        escalationEmail: escalationEmail.trim(),
        escalationMessage: escalationMessage.trim(),
      }),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      setError(payload?.error ?? "Unable to save AI Telephony right now.")
      setLoading(false)
      return
    }

    setMessage("AI Telephony saved.")
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_360px]">
      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#1d4ed8_0%,#06b6d4_100%)]" />
        <div className="pt-4">
          <p className="text-lg font-semibold text-slate-900">Omniweb AI phone setup</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Omniweb AI phone agent ID</label>
              <input value={omniwebPhoneAgentId} onChange={(event) => setOmniwebPhoneAgentId(event.target.value)} className={inputClassName} />
              <p className="mt-2 text-sm text-slate-500">Use the same AI brain as the Omniweb voice experience.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">AI telephone number</label>
              <input value={aiPhoneNumber} onChange={(event) => setAiPhoneNumber(event.target.value)} className={inputClassName} />
              <p className="mt-2 text-sm text-slate-500">The Omniweb AI phone number customers receive calls from.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Human escalation phone</label>
              <input value={escalationPhone} onChange={(event) => setEscalationPhone(event.target.value)} className={inputClassName} />
              <p className="mt-2 text-sm text-slate-500">Owner or team number for human transfer/escalation.</p>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Escalation email fallback</label>
              <input value={escalationEmail} onChange={(event) => setEscalationEmail(event.target.value)} className={inputClassName} />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Escalation message</label>
              <textarea value={escalationMessage} onChange={(event) => setEscalationMessage(event.target.value)} rows={3} className={textareaClassName} />
            </div>
          </div>

          {message ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
          {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save AI Telephony"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <p className="text-lg font-semibold text-slate-900">Call Us widget behavior</p>
        <p className="mt-4 text-sm leading-7 text-slate-600">This is separate from Ask AI. It appears as a Call Us option, collects the shopper phone number, and starts an Omniweb AI phone conversation.</p>
        <p className="mt-4 text-sm leading-7 text-slate-600">If the AI cannot resolve the request, it uses the human escalation phone and fallback email you set here.</p>
      </section>
    </form>
  )
}
