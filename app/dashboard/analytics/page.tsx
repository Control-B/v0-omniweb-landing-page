import Link from "next/link"
import { BarChart3, Lock } from "lucide-react"
import { DashboardCard } from "@/components/saas/dashboard-card"
import { AnalyticsCommandCenter } from "../../../components/saas/analytics-command-center"
import { requireDashboardAccess } from "@/lib/saas/guards"

export default async function DashboardAnalyticsPage() {
  const status = await requireDashboardAccess({ allowExpiredBilling: true })

  if (!status.canAccessFeatures) {
    return (
      <div className="space-y-6">
        <DashboardCard className="border-amber-200 bg-[linear-gradient(90deg,rgba(251,191,36,0.16),rgba(99,102,241,0.08))]">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-amber-800"><Lock className="h-4 w-4" />Analytics locked</div>
          <h2 className="dashboard-page-title mt-4">Upgrade to unlock AI engagement intelligence.</h2>
          <p className="dashboard-body mt-3 max-w-3xl">Your conversation data stays protected, but detailed analytics, transcripts, summaries, and follow-up workflows are hidden until the workspace is reactivated.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard/billing" className="dashboard-primary-button inline-flex h-12 items-center justify-center rounded-2xl px-5 text-[15px] font-semibold transition hover:opacity-95">
              Open billing
            </Link>
            <Link href="/pricing" className="dashboard-secondary-button inline-flex h-12 items-center justify-center rounded-2xl px-5 text-[15px] font-semibold transition hover:bg-slate-50">
              View plans
            </Link>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"><BarChart3 className="h-4 w-4 text-violet-500" />Analytics preview</div>
          <p className="dashboard-section-title mt-4">AI Engagement Intelligence</p>
          <p className="dashboard-body mt-3">Once billing is active, this page shows live conversation summaries, lead qualification, transcripts, and owner follow-up actions in one command center.</p>
        </DashboardCard>
      </div>
    )
  }

  return <AnalyticsCommandCenter />
}
