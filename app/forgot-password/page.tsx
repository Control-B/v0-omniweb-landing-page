"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react"
import { OmniwebLogo } from "@/components/brand-logo"
import { getPublicEngineUrl } from "@/lib/engine-url"

export const dynamic = "force-dynamic"

const ENGINE_URL = getPublicEngineUrl()

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"email" | "done">("email")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Call engine forgot password endpoint
      await fetch(`${ENGINE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch(() => null)

      // Always show success to prevent email enumeration
      setStep("done")
    } catch {
      setStep("done")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh overflow-x-hidden bg-[#050a12] text-white">
      <div className="pointer-events-none absolute inset-0 kling-canvas" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.24] kling-grid-overlay" />

      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <OmniwebLogo className="mb-10 justify-center" textClassName="text-2xl font-bold tracking-tight text-cyan-200" />

          <div className="rounded-[2rem] border border-white/[0.08] bg-[#0a1225]/90 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                <KeyRound className="h-6 w-6" />
              </div>
              <h1 className="bg-gradient-to-r from-cyan-300 via-blue-200 to-purple-300 bg-clip-text text-2xl font-bold text-transparent">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {step === "email" && "Enter your account email and we'll send you recovery instructions."}
                {step === "done" && "Check your inbox for password reset instructions."}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {step === "email" ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      autoFocus
                      className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#0f1a2e] pl-10 pr-4 text-white placeholder:text-slate-500 transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25 text-sm"
                    />
                    <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-500" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 font-bold uppercase tracking-wider text-xs text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Instructions"}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-300">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                  <p className="mt-3 text-sm font-semibold text-white">Instructions Sent</p>
                  <p className="mt-1 text-xs text-slate-300">
                    If an account is associated with <span className="font-semibold text-cyan-300">{email}</span>, you will receive an email with reset instructions shortly.
                  </p>
                </div>
                <Link
                  href="/signin"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white/10 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/15 border border-white/15"
                >
                  Return to Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}

            <p className="mt-6 text-center text-sm text-slate-400">
              Remember your password?{" "}
              <Link href="/signin" className="font-medium text-cyan-400 transition-colors hover:text-cyan-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
