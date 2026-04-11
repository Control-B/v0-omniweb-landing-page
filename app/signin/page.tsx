"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect } from "react"

const ENGINE_LOGIN_URL = "https://omniweb-engine-rs6fr.ondigitalocean.app/login"
const TEMPORARY_ACCOUNTS = [
  { label: "Admin", email: "admin@omniweb.ai", password: "admin1234" },
  { label: "Demo", email: "demo@omniweb.ai", password: "demo1234" },
]

export default function SignInPage() {
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.location.assign(ENGINE_LOGIN_URL)
    }, 1200)

    return () => window.clearTimeout(timeout)
  }, [])

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-2xl font-bold">
            Omniweb
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Redirecting you to the admin dashboard login
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card/50 p-8">
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <div className="text-sm font-semibold text-foreground">Admin dashboard access</div>
            <p className="mt-1 text-sm text-muted-foreground">
              The Omniweb landing-page sign-in is not the admin dashboard. Use the live AI Engine login instead.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {TEMPORARY_ACCOUNTS.map((account) => (
                <div key={account.email} className="rounded-lg border border-white/10 bg-background/60 p-3 text-sm">
                  <div className="font-medium text-foreground">{account.label}</div>
                  <div className="mt-1 text-muted-foreground">{account.email}</div>
                  <div className="text-muted-foreground">{account.password}</div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.assign(ENGINE_LOGIN_URL)}
            >
              Open AI Engine Login Now
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need the direct login URL?{" "}
          <a href={ENGINE_LOGIN_URL} className="text-cyan-400 hover:text-cyan-300">
            {ENGINE_LOGIN_URL}
          </a>
        </p>
      </div>
    </div>
  )
}
