import { redirect } from "next/navigation"
import { requireDashboardAccess } from "@/lib/saas/guards"

export default async function DashboardTestConsolePage() {
  await requireDashboardAccess()
  redirect("/dashboard/ai-agent#test-agent")
}
