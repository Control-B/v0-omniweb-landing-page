import { TestConsolePanel } from "@/components/saas/test-console-panel"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

const DEFAULT_AGENT_NAME = "Omniweb AI"
const DEFAULT_WELCOME_MESSAGE = "Welcome! I’m here to answer questions, recommend the right solution, and help you get the most value from our services. How can I help you today?"

export default async function DashboardTestConsolePage() {
  await requireDashboardAccess()
  const snapshot = await getDashboardSnapshot()
  const agentConfig = snapshot.agentConfig

  const agentReady = Boolean(
    agentConfig?.active && (
      agentConfig.agentName !== DEFAULT_AGENT_NAME ||
      agentConfig.welcomeMessage !== DEFAULT_WELCOME_MESSAGE ||
      (agentConfig.supportedLanguages?.length ?? 0) > 1
    ),
  )

  return (
    <TestConsolePanel
      welcomeMessage={agentConfig?.welcomeMessage || DEFAULT_WELCOME_MESSAGE}
      agentReady={agentReady}
      tenantId={snapshot.status.tenantId}
    />
  )
}
