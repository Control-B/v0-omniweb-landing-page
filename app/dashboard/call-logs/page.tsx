import { CallLogsIntelligence } from "@/components/call-center/call-logs-intelligence"
import { requireDashboardAccess } from "@/lib/saas/guards"

export default async function DashboardCallLogsPage() {
  await requireDashboardAccess()

  return (
    <div className="space-y-6">
      <CallLogsIntelligence />
    </div>
  )
}
