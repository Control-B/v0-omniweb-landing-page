import Link from "next/link"
import { BarChart3, Lock } from "lucide-react"
import { AnalyticsCommandCenter } from "../../../components/saas/analytics-command-center"
import { requireDashboardAccess } from "@/lib/saas/guards"

export default async function DashboardAnalyticsPage() {
  const status = await requireDashboardAccess({ allowExpiredBilling: true })

  if (!status.canAccessFeatures) {
    return (
      <div className="space-y-5">
        <section className="rounded-[1.75rem] border border-amber-200 bg-[linear-gradient(90deg,rgba(251,191,36,0.16),rgba(99,102,241,0.08))] p-6 shadow-[0_16px_35px_rgba(245,158,11,0.12)]">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-amber-800"><Lock className="h-4 w-4" />Analytics locked</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Upgrade to unlock AI engagement intelligence.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">Your conversation data stays protected, but detailed analytics, transcripts, summaries, and follow-up workflows are hidden until the workspace is reactivated.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard/billing" className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
              Open billing
            </Link>
            <Link href="/pricing" className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
              View plans
            </Link>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"><BarChart3 className="h-4 w-4 text-violet-500" />Analytics preview</div>
          <p className="mt-3 text-lg font-semibold text-slate-950">AI Engagement Intelligence</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Once billing is active, this page shows live conversation summaries, lead qualification, transcripts, and owner follow-up actions in one command center.</p>
        </section>
      </div>
    )
  }

  return <AnalyticsCommandCenter />
}
