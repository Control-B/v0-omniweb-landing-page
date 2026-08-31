"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { OmniwebLogo } from "@/components/brand-logo"

export const dynamic = "force-dynamic"

export default function SignInPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials. Please check your email and password.")
      }

      // Successfully logged in and session cookie set
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.")
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
                Sign in to Omniweb
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Access your AI agent control plane & contact center
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
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
                className={inputClass}
              />

              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className={inputClass}
              />

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 font-semibold text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 hover:shadow-[0_6px_30px_rgba(6,182,212,0.4)] disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
              <Link href="/demo" className="font-medium text-cyan-400 hover:text-cyan-300">
                Try Live Demo &rarr;
              </Link>
              <Link href="/get-started" className="font-medium text-slate-300 hover:text-white">
                Create Account &rarr;
              </Link>
            </div>
          </div>

          {/* Trust signal */}
          <p className="mt-6 text-center text-xs text-slate-500">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-slate-400 hover:text-slate-300">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-slate-400 hover:text-slate-300">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
