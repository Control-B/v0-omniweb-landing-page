"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { OmniwebLogo } from "@/components/brand-logo"

export const dynamic = "force-dynamic"

export default function GetStartedPage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim() || email.split("@")[0],
          email: email.trim(),
          password,
          business_name: companyName.trim() || "My Business",
          business_type: "general",
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account. Please try again.")
      }

      // Successfully signed up and session cookie set
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "mb-4 h-12 w-full rounded-xl border border-white/[0.08] bg-[#0f1a2e] px-4 text-white placeholder:text-slate-500 transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25"

  return (
    <div className="relative flex min-h-dvh overflow-x-hidden bg-[#050a12] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(6,182,212,0.08),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)]" />

      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/">
            <OmniwebLogo className="mb-10 justify-center cursor-pointer" textClassName="text-2xl font-bold tracking-tight text-cyan-200" />
          </Link>

          {/* Card */}
          <div className="rounded-[2rem] border border-white/[0.08] bg-[#0a1225]/90 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            <div className="mb-8 text-center">
              <h1 className="bg-gradient-to-r from-cyan-300 via-blue-200 to-purple-300 bg-clip-text text-2xl font-bold text-transparent">
                Get started with Omniweb
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Deploy your autonomous AI contact center and voice agent
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    First name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Company / Organization
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                className={inputClass}
              />

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={inputClass}
              />

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputClass}
              />

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min. 8 chars)"
                required
                minLength={8}
                className={inputClass}
              />

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 font-semibold text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 hover:shadow-[0_6px_30px_rgba(6,182,212,0.4)] disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account & Launch"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
              <Link href="/demo" className="font-medium text-cyan-400 hover:text-cyan-300">
                Try Live Demo first &rarr;
              </Link>
              <Link href="/signin" className="font-medium text-slate-300 hover:text-white">
                Sign in &rarr;
              </Link>
            </div>
          </div>

          {/* Trust signal */}
          <p className="mt-6 text-center text-xs text-slate-500">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-slate-400 hover:text-slate-300">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-slate-400 hover:text-slate-300">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
