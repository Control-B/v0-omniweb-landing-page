"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

const ENGINE_URL = process.env.NEXT_PUBLIC_OMNIWEB_ENGINE_URL || "https://omniweb-engine-rs6fr.ondigitalocean.app"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${ENGINE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.detail || "Something went wrong")
        return
      }

      setSent(true)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-[#050a12] text-white">
      <div className="pointer-events-none absolute inset-0 kling-canvas" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.28] kling-grid-overlay" />

      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="kling-panel-strong w-full max-w-md rounded-[2rem] p-8 sm:p-10">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block text-2xl font-bold">
              Omniweb
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Reset your password
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-400">
                If an account exists with that email, we&apos;ve sent password reset instructions.
              </div>
              <Link href="/signin" className="text-sm text-cyan-400 hover:text-cyan-300">
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/signin" className="text-cyan-400 hover:text-cyan-300">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
