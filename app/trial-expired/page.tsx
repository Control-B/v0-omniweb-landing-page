import Link from "next/link"
import { ArrowRight, ShieldAlert, Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { requireTrialExpiredAccess } from "@/lib/saas/guards"

export default async function TrialExpiredPage() {
  const status = await requireTrialExpiredAccess()

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-[#050a12] text-white">
      <div className="pointer-events-none absolute inset-0 kling-canvas" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.24] kling-grid-overlay" />
      <Header />

      <main className="relative flex-1 flex items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl rounded-[2.5rem] border border-amber-500/30 bg-[#08101e]/90 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-300">
            <ShieldAlert className="h-3.5 w-3.5" /> Trial Period Completed
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Your 7-Day Free Trial Has Ended
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Your workspace, AI knowledge sources, and call history are preserved and ready to resume immediately. Choose a plan to unlock live voice swarms, telephony routing, and multi-agent automations.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Workspace</p>
              <p className="mt-2 text-base font-bold text-white">{status.businessName || "Omniweb Workspace"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Plan</p>
              <p className="mt-2 text-base font-bold text-white">Starter Trial</p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Status</p>
              <p className="mt-2 text-base font-bold text-amber-200">Reactivation Ready</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-7 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-400 hover:to-purple-500"
            >
              Choose Plan &amp; Reactivate <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/billing"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 text-xs font-semibold text-white hover:bg-white/10"
            >
              Open Billing Dashboard
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
