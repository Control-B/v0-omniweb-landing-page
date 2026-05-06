"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-dvh bg-[#050a12] px-4 py-24 text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col items-center justify-center text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-400/10 text-amber-200">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.32em] text-amber-300">Something went wrong</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">The page could not finish loading.</h1>
        <p className="mt-5 text-base leading-8 text-white/60">
          Retry the request, or return to a stable route while the issue is logged for review.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white" onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10">
            <Link href="/company/contact">Contact support</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
