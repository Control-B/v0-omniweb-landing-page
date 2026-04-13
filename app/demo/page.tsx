"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"

const ENGINE_URL = process.env.NEXT_PUBLIC_OMNIWEB_ENGINE_URL || "https://omniweb-engine-rs6fr.ondigitalocean.app"

export default function DemoPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<{ email: string; plan: string; client_id: string } | null>(null)

  useEffect(() => {
    // Auto-obtain a demo token (no password needed)
    ;(async () => {
      try {
        const res = await fetch(`${ENGINE_URL}/api/auth/demo-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.detail || "Failed to start demo")
          return
        }
        // Set the cookie via our own API route
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "demo@omniweb.ai", password: "demo1234" }),
        })
        setSession({ email: data.email, plan: data.plan, client_id: data.client_id })
      } catch {
        setError("Network error — could not start demo")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050a12] text-white">
        <div className="text-center space-y-4">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />
          <p className="text-sm text-slate-400">Loading demo environment…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050a12] text-white">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <a href="/" className="text-sm text-cyan-400 hover:text-cyan-300">← Back to home</a>
        </div>
      </div>
    )
  }

  return (
    <DashboardShell
      email={session?.email || "demo@omniweb.ai"}
      plan={session?.plan || "starter"}
      clientId={session?.client_id || ""}
      isTrial
      trialLabel="Demo Mode — explore the dashboard, then sign up to keep your configuration"
    />
  )
}
