import { OutboundCampaignDialer } from "@/components/call-center/outbound-campaign-dialer"
import { requireDashboardAccess } from "@/lib/saas/guards"

export default async function DashboardCampaignsPage() {
  await requireDashboardAccess()

  return (
    <div className="space-y-6">
      <OutboundCampaignDialer />
    </div>
  )
}
