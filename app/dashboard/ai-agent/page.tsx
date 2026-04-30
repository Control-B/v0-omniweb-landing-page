import { LegacyAgentSettingsPanel } from "@/components/saas/legacy-agent-settings-panel"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

export default async function DashboardAiAgentPage() {
  await requireDashboardAccess()
  const snapshot = await getDashboardSnapshot()

  if (!snapshot.agentConfig) {
    return null
  }

  return (
    <LegacyAgentSettingsPanel
      initialConfig={snapshot.agentConfig}
      websiteDomain={snapshot.status.websiteDomain}
      businessName={snapshot.status.businessName}
    />
  )
}
