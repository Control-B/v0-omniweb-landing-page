"use client"

import type { FormEvent } from "react"
import { useState } from "react"

type ProfileSettingsFormProps = {
  initialValues: {
    businessName: string
    industry: string
    websiteDomain: string
  }
}

const inputClassName = "mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"

export function ProfileSettingsForm({ initialValues }: ProfileSettingsFormProps) {
  const [businessName, setBusinessName] = useState(initialValues.businessName)
  const [industry, setIndustry] = useState(initialValues.industry)
  const [websiteDomain, setWebsiteDomain] = useState(initialValues.websiteDomain)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    const response = await fetch("/api/dashboard/workspace", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        businessName: businessName.trim(),
        industry: industry.trim(),
        websiteDomain: websiteDomain.trim(),
      }),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      setError(payload?.error ?? "Unable to update workspace right now.")
      setLoading(false)
      return
    }

    setMessage("Profile updated.")
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-medium text-slate-700">Business name</label>
        <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} className={inputClassName} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Industry</label>
        <input value={industry} onChange={(event) => setIndustry(event.target.value)} className={inputClassName} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Website domain</label>
        <input value={websiteDomain} onChange={(event) => setWebsiteDomain(event.target.value)} className={inputClassName} />
      </div>

      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  )
}