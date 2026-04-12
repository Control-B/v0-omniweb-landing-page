"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

const benefits = [
  "14-day free trial, no credit card required",
  "AI-powered website builder",
  "Conversion-optimized templates",
  "24/7 customer support",
]

export default function GetStartedPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          password,
          business_name: company || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Signup failed")
        return
      }

      // Account created and JWT cookie set — go to dashboard
      router.push("/dashboard")
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
      {/* Left Side - Benefits */}
      <div className="relative hidden w-1/2 flex-col justify-between border-r border-white/10 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 p-12 lg:flex">
        <div>
          <Link href="/" className="text-2xl font-bold">
            Omniweb
          </Link>
        </div>
        <div>
          <h2 className="mb-6 text-3xl font-bold leading-tight">
            Start building your
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AI-powered website
            </span>
          </h2>
          <ul className="space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <div className="site-icon-chip flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">
          Trusted by thousands of businesses worldwide
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="kling-panel-strong w-full max-w-md rounded-[2rem] p-8 sm:p-10">
          {/* Mobile Logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-block text-2xl font-bold">
              Omniweb
            </Link>
          </div>

          <h2 className="mb-2 text-2xl font-bold">Create your account</h2>
          <p className="mb-8 text-sm text-muted-foreground">
            Get started with your 14-day free trial
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-medium">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  className="w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-medium">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  className="w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Work Email
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
              <label htmlFor="company" className="mb-2 block text-sm font-medium">
                Company Name
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
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
                placeholder="Create a password"
                required
                minLength={8}
                className="w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Start Free Trial"}
            </Button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-cyan-400 hover:text-cyan-300">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">
              Privacy Policy
            </Link>
          </p>

          {/* Sign In Link */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="text-cyan-400 hover:text-cyan-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
