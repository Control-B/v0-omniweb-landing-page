import { CallCenterWarRoom } from "@/components/call-center/call-center-war-room"
import { AgentExecutionInspector } from "@/components/call-center/agent-execution-inspector"
import { MultiAgentFleetManager } from "@/components/call-center/multi-agent-fleet-manager"
import { requireDashboardAccess } from "@/lib/saas/guards"

export default async function DashboardCallCenterPage() {
  await requireDashboardAccess()

  return (
    <div className="space-y-10">
      {/* War Room Monitor */}
      <CallCenterWarRoom />

      {/* Execution Graph Inspector */}
      <AgentExecutionInspector />

      {/* Fleet Configuration */}
      <MultiAgentFleetManager />
    </div>
  )
}
