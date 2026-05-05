"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { getPublicEngineUrl } from "@/lib/engine-url"
import { OmniwebLogo } from "@/components/brand-logo"

const ENGINE_URL = getPublicEngineUrl()

export default function AdminAuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [adminCode, setAdminCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === "login") {
        // Login via our API route (auto-detects admin)
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
        if (data.role !== "admin") {
          setError("This account does not have admin access. Use the regular sign-in page.")
          return
        }
        router.push("/")
      } else {
        // Signup — call engine directly with admin code
        const res = await fetch(`${ENGINE_URL}/api/auth/admin-signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, admin_code: adminCode }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.detail || "Signup failed")
          return
        }
        // Set the cookie via our login route
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
        if (!loginRes.ok) {
          setError("Account created but login failed. Try signing in.")
          return
        }
        router.push("/")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh overflow-x-hidden bg-[#050a12] text-white">
      <div className="pointer-events-none absolute inset-0 kling-canvas" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.28] kling-grid-overlay" />

      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="kling-panel-strong w-full max-w-md rounded-[2rem] p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <OmniwebLogo className="mb-4 justify-center" textClassName="text-2xl font-bold text-cyan-200" />
            <p className="mt-2 text-sm text-muted-foreground">
              Admin Portal
            </p>
          </div>

          {/* Login / Signup toggle */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-white/5 p-1">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null) }}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                mode === "login" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null) }}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                mode === "signup" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label htmlFor="adminCode" className="mb-2 block text-sm font-medium">
                    Admin Authorization Code
                  </label>
                  <input
                    id="adminCode"
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Enter admin code"
                    required
                    className="w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Contact your team lead if you don&apos;t have this code.
                  </p>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@omniweb.ai"
                required
                className="w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 pr-10 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500"
              disabled={loading}
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign In to Admin" : "Create Admin Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Looking for the client dashboard?{" "}
            <Link href="/signin" className="text-cyan-400 hover:text-cyan-300">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
