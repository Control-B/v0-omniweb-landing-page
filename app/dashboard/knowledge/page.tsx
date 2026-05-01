import { KnowledgeSourcesPanel } from "@/components/saas/knowledge-sources-panel"
import { WidgetInstallCard } from "@/components/saas/widget-install-card"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

export default async function DashboardKnowledgePage() {
  await requireDashboardAccess()
  const snapshot = await getDashboardSnapshot()

  if (!snapshot.status.tenantId) {
    return null
  }

  return (
    <div className="space-y-6">
      <WidgetInstallCard />
      <KnowledgeSourcesPanel tenantId={snapshot.status.tenantId} websiteDomain={snapshot.status.websiteDomain} />
    </div>
  )
}
