"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const inputClassName = "mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-500/10"

type OnboardingFormProps = {
  initialBusinessName?: string
}

export function OnboardingForm({ initialBusinessName = "" }: OnboardingFormProps) {
  const router = useRouter()
  const [businessName, setBusinessName] = useState(initialBusinessName)
  const [industry, setIndustry] = useState("")
  const [websiteDomain, setWebsiteDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    const response = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ businessName, industry, websiteDomain }),
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      setError(payload?.error ?? "Unable to create your workspace right now.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-medium text-white/80">Business name</label>
        <input
          value={businessName}
          onChange={(event) => setBusinessName(event.target.value)}
          className={inputClassName}
          placeholder="Acme Home Services"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-white/80">Business industry</label>
        <input
          value={industry}
          onChange={(event) => setIndustry(event.target.value)}
          className={inputClassName}
          placeholder="Contractors, professional services, ecommerce..."
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-white/80">Website domain</label>
        <input
          value={websiteDomain}
          onChange={(event) => setWebsiteDomain(event.target.value)}
          className={inputClassName}
          placeholder="example.com or https://example.com"
          required
        />
        <p className="mt-2 text-xs text-white/45">We’ll normalize and save the clean domain for your widget and workspace.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-5 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(59,130,246,0.3)] transition hover:from-cyan-400 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating workspace..." : "Create my AI workspace"}
      </button>
    </form>
  )
}
