import { WidgetSitePreviewClient } from "@/app/widget-site-preview/widget-site-preview-client"
import { requireDashboardAccess } from "@/lib/saas/guards"

export default async function WidgetSitePreviewPage() {
  await requireDashboardAccess({ allowExpiredBilling: true })
  return <WidgetSitePreviewClient />
}
