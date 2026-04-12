"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

const ENGINE_DASHBOARD_URL = "https://omniweb-engine-rs6fr.ondigitalocean.app/login"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login failed")
        return
      }

      // Redirect based on role
      if (data.role === "admin") {
        window.location.assign(ENGINE_DASHBOARD_URL)
      } else {
        router.push("/dashboard")
      }
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
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                className="w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="text-sm font-semibold text-foreground">Admin dashboard</div>
            <p className="mt-1 text-sm text-muted-foreground">
              If you need the admin dashboard, use the engine login directly.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full border-white/10"
              onClick={() => window.location.assign(ENGINE_DASHBOARD_URL)}
            >
              Open Admin Dashboard
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/get-started" className="text-cyan-400 hover:text-cyan-300">
              Get started
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
