"use client"

import { useSignIn } from "@clerk/nextjs/legacy"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignInPage() {
  const { signIn, isLoaded, setActive } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"initial" | "password" | "code">("initial")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050a12]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    )
  }

  const handleSocial = async (strategy: string) => {
    try {
      await signIn.authenticateWithRedirect({
        strategy: strategy as any,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      })
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || "Something went wrong")
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn.create({ identifier: email })

      const pw = result.supportedFirstFactors?.find(
        (f: any) => f.strategy === "password"
      )
      const emailCode = result.supportedFirstFactors?.find(
        (f: any) => f.strategy === "email_code"
      )

      if (pw) {
        setStep("password")
      } else if (emailCode) {
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: (emailCode as any).emailAddressId,
        })
        setStep("code")
      } else {
        setError("No supported sign-in method for this account.")
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || "Account not found. Please sign up first.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "password",
        password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || "Invalid password")
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || "Invalid code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-[#050a12] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(6,182,212,0.08),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(139,92,246,0.08),transparent_50%)]" />

      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="mb-10 flex items-center justify-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5 6L9 18h6.5L14.5 26 23 14h-6.5L17.5 6z" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="text-2xl font-bold tracking-tight">Omniweb</span>
          </Link>

          {/* Card */}
          <div className="rounded-[2rem] border border-white/[0.08] bg-[#0a1225]/90 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            <div className="mb-8 text-center">
              <h1 className="bg-gradient-to-r from-cyan-300 via-blue-200 to-purple-300 bg-clip-text text-2xl font-bold text-transparent">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Sign in to your Omniweb account
              </p>
            </div>

            {/* Social buttons */}
            {step === "initial" && (
              <>
                <div className="grid gap-3">
                  <button
                    onClick={() => handleSocial("oauth_google")}
                    className="flex h-12 items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm font-medium text-white transition-all hover:border-white/[0.15] hover:bg-white/[0.08]"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>

                  <button
                    onClick={() => handleSocial("oauth_microsoft")}
                    className="flex h-12 items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm font-medium text-white transition-all hover:border-white/[0.15] hover:bg-white/[0.08]"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 21 21">
                      <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                      <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                      <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                    </svg>
                    Continue with Microsoft
                  </button>
                </div>

                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-xs uppercase tracking-wider text-slate-500">or</span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>
              </>
            )}

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {step === "initial" && (
              <form onSubmit={handleEmailSubmit}>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mb-4 h-12 w-full rounded-xl border border-white/[0.08] bg-[#0f1a2e] px-4 text-white placeholder:text-slate-500 transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 font-semibold text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 hover:shadow-[0_6px_30px_rgba(6,182,212,0.4)] disabled:opacity-50"
                >
                  {loading ? "Checking..." : "Continue"}
                </button>
              </form>
            )}

            {step === "password" && (
              <form onSubmit={handlePasswordSubmit}>
                <p className="mb-4 text-sm text-slate-400">
                  Signing in as <span className="text-cyan-300">{email}</span>
                  <button
                    type="button"
                    onClick={() => { setStep("initial"); setPassword(""); setError("") }}
                    className="ml-2 text-cyan-400 hover:text-cyan-300"
                  >
                    Change
                  </button>
                </p>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoFocus
                  className="mb-4 h-12 w-full rounded-xl border border-white/[0.08] bg-[#0f1a2e] px-4 text-white placeholder:text-slate-500 transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 font-semibold text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 hover:shadow-[0_6px_30px_rgba(6,182,212,0.4)] disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
                <div className="mt-3 text-center">
                  <Link href="/forgot-password" className="text-sm text-slate-400 hover:text-cyan-300 transition-colors">
                    Forgot your password?
                  </Link>
                </div>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={handleCodeSubmit}>
                <p className="mb-4 text-sm text-slate-400">
                  We sent a code to <span className="text-cyan-300">{email}</span>
                  <button
                    type="button"
                    onClick={() => { setStep("initial"); setCode(""); setError("") }}
                    className="ml-2 text-cyan-400 hover:text-cyan-300"
                  >
                    Change
                  </button>
                </p>
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
                  className="mb-4 h-12 w-full rounded-xl border border-white/[0.08] bg-[#0f1a2e] px-4 text-center text-lg tracking-widest text-white placeholder:text-slate-500 transition-all focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 font-semibold text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 hover:shadow-[0_6px_30px_rgba(6,182,212,0.4)] disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/get-started" className="font-medium text-cyan-400 transition-colors hover:text-cyan-300">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
