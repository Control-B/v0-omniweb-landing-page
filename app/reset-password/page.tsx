"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"

const ENGINE_URL =
  process.env.NEXT_PUBLIC_OMNIWEB_ENGINE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.omniweb.ai"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""
  const mode = searchParams.get("mode") || "reset"

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token.")
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const endpoint =
        mode === "invite"
          ? `${ENGINE_URL}/api/auth/accept-invite`
          : `${ENGINE_URL}/api/auth/reset-password`

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(
          data.detail ||
            "Reset failed. The link may have expired — please request a new one."
        )
        return
      }

      setSuccess(true)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isInvite = mode === "invite"
  const heading = isInvite ? "Set your password" : "Reset your password"
  const subtext = isInvite
    ? "Welcome to Omniweb AI! Choose a password to complete your account."
    : "Enter a new password for your account."

  return (
    <div className="kling-panel-strong w-full max-w-md rounded-[2rem] p-8 sm:p-10">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block text-2xl font-bold">
          Omniweb
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">{heading}</p>
      </div>

      {success ? (
        <div className="text-center space-y-4">
          <div className="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-400">
            {isInvite
              ? "Your password has been set. You can now sign in."
              : "Your password has been reset successfully."}
          </div>
          <Button
            onClick={() => router.push("/signin")}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Go to Sign In
          </Button>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {!token ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                This link appears to be invalid. Please request a new password
                reset.
              </p>
              <Link
                href="/forgot-password"
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                Request new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">{subtext}</p>
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium"
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label
                  htmlFor="confirm"
                  className="mb-2 block text-sm font-medium"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : isInvite
                    ? "Set Password & Sign In"
                    : "Reset Password"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/signin"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-[#050a12] text-white">
      <div className="pointer-events-none absolute inset-0 kling-canvas" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.28] kling-grid-overlay" />
      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <Suspense
          fallback={
            <div className="kling-panel-strong w-full max-w-md rounded-[2rem] p-8 sm:p-10 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
