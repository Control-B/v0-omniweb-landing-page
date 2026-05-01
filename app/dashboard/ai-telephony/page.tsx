import { Phone, RadioTower } from "lucide-react"
import { DashboardCard } from "@/components/saas/dashboard-card"
import { TelephonyConfigForm } from "@/components/saas/telephony-config-form"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getTenantByClerkUserId } from "@/lib/saas/store"
import { getCurrentUserTenantStatus } from "@/lib/saas/status"

export default async function DashboardTelephonyPage() {
  await requireDashboardAccess()
  const status = await getCurrentUserTenantStatus()
  const tenant = status.clerkUserId ? await getTenantByClerkUserId(status.clerkUserId) : null

  return (
    <div className="space-y-6">
      <DashboardCard tone="highlight" className="overflow-hidden">
        <div className="relative">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="flex items-center gap-2 text-[15px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            <Phone className="h-4 w-4 text-cyan-500" />
            AI Telephony
          </div>
          <h2 className="dashboard-page-title mt-4">AI Telephony Setup</h2>
          <p className="dashboard-body mt-3 max-w-4xl">
            Retell handles the phone network. Omniweb handles the brain. This channel uses the same tenant instructions,
            knowledge, lead qualification, memory, and escalation rules as chat and Deepgram web voice.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-700">
            <RadioTower className="h-4 w-4" />
            Channel: ai_telephony
          </div>
        </div>
      </DashboardCard>

      {tenant ? <TelephonyConfigForm /> : null}
    </div>
  )
}
