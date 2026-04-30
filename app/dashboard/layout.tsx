import { DashboardShell } from "@/components/saas/dashboard-shell"
import { requireDashboardAccess } from "@/lib/saas/guards"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const status = await requireDashboardAccess({ allowExpiredBilling: true })

  return <DashboardShell status={status}>{children}</DashboardShell>
}
