import { LeadsPanel } from "@/components/saas/leads-panel"
import { requireDashboardAccess } from "@/lib/saas/guards"

export default async function DashboardLeadsPage() {
  await requireDashboardAccess()

  return (
    <div className="space-y-6">
      <div>
        <p className="dashboard-eyebrow">Lead Management</p>
        <h1 className="dashboard-page-title mt-4">Captured Leads</h1>
        <p className="dashboard-body mt-2 max-w-3xl">
          All leads captured from your widget, voice calls, and AI agents. Filter by status, intent, and contact info to prioritize follow-ups.
        </p>
      </div>

      <LeadsPanel />
    </div>
  )
}
