"use client"

import { useSignIn } from "@clerk/nextjs/legacy"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { getPublicEngineUrl } from "@/lib/engine-url"
import { OmniwebLogo } from "@/components/brand-logo"

const ENGINE_URL = getPublicEngineUrl()

export default function ForgotPasswordPage() {
  const { signIn, isLoaded } = useSignIn()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [step, setStep] = useState<"email" | "code" | "done">("email")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050a12]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    )
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Use Clerk's forgot password flow
      const result = await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })
      if (result) {
        setStep("code")
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message
      if (msg) {
        setError(msg)
      } else {
        // Fallback — send to engine's forgot-password endpoint
        try {
          const res = await fetch(`${ENGINE_URL}/api/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          })
          if (res.ok) {
            setStep("done")
          } else {
            setError("If an account exists with that email, we've sent reset instructions.")
            setStep("done")
          }
        } catch {
          // Always show success to prevent email enumeration
          setStep("done")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      })

      if (result.status === "complete") {
        setStep("done")
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || "Invalid code or password doesn't meet requirements.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh overflow-x-hidden bg-[#050a12] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(6,182,212,0.08),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)]" />

      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <OmniwebLogo className="mb-10 justify-center" textClassName="text-2xl font-bold tracking-tight text-white" />

          <div className="rounded-[2rem] border border-white/[0.08] bg-[#0a1225]/90 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            <div className="mb-8 text-center">
              <h1 className="bg-gradient-to-r from-cyan-300 via-blue-200 to-purple-300 bg-clip-text text-2xl font-bold text-transparent">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {step === "email" && "Enter your email and we'll send you a reset code."}
                {step === "code" && "Enter the code we sent and your new password."}
                {step === "done" && "Your password has been reset."}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {step === "email" && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#0f1a2e] px-4 text-white placeholder:text-slate-500 transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 font-semibold text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send Reset Code"}
                </button>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-sm text-slate-400">
                  We sent a code to <span className="text-cyan-300">{email}</span>
                </p>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Verification code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter the 6-digit code"
                    required
                    autoFocus
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#0f1a2e] px-4 text-center text-lg tracking-widest text-white placeholder:text-slate-500 transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    New password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    required
                    minLength={8}
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#0f1a2e] px-4 text-white placeholder:text-slate-500 transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 font-semibold text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}

            {step === "done" && (
              <div className="text-center space-y-4">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
                  Your password has been reset successfully!
                </div>
                <Link
                  href="/signin"
                  className="inline-block h-12 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-6 font-semibold text-white leading-[3rem] transition-all hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400"
                >
                  Sign in with new password
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
