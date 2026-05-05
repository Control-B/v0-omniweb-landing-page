import { ExternalLink } from "lucide-react"
import { WidgetInstallCard } from "@/components/saas/widget-install-card"
import { DashboardCard } from "@/components/saas/dashboard-card"
import { requireDashboardAccess } from "@/lib/saas/guards"

export default async function DashboardWidgetInstallPage() {
  await requireDashboardAccess()

  return (
    <div className="space-y-6">
      <DashboardCard tone="highlight">
        <p className="dashboard-eyebrow">Install & Verify</p>
        <h1 className="dashboard-page-title mt-3">Install Widget on omniweb.ai</h1>
        <p className="dashboard-body mt-3 max-w-3xl">
          Use this page to copy your tenant embed script, lock allowed domains, and verify live install
          pings from your production site.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <a
            href="https://omniweb.ai"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Open omniweb.ai
            <ExternalLink className="h-4 w-4" />
          </a>
          <a
            href="/dashboard/ai-agent#test-agent"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Configure agent first
          </a>
        </div>
      </DashboardCard>

      <WidgetInstallCard />
    </div>
  )
}
