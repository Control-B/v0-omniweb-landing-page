import { Phone } from "lucide-react"
import { DashboardCard } from "@/components/saas/dashboard-card"
import { TelephonyConfigForm } from "@/components/saas/telephony-config-form"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { ensureDefaultTelephonyConfig, getTenantByClerkUserId } from "@/lib/saas/store"
import { getCurrentUserTenantStatus } from "@/lib/saas/status"

export default async function DashboardTelephonyPage() {
  await requireDashboardAccess()
  const status = await getCurrentUserTenantStatus()
  const tenant = status.clerkUserId ? await getTenantByClerkUserId(status.clerkUserId) : null
  const telephonyConfig = tenant ? await ensureDefaultTelephonyConfig(tenant.id) : null

  return (
    <div className="space-y-6">
      <DashboardCard tone="highlight">
        <div className="flex items-center gap-2 text-[15px] font-semibold uppercase tracking-[0.22em] text-slate-500"><Phone className="h-4 w-4 text-cyan-500" />AI Telephony</div>
        <h2 className="dashboard-page-title mt-4">Add a Call Us AI phone widget.</h2>
        <p className="dashboard-body mt-3 max-w-4xl">Let shoppers request a phone call with the same Omniweb AI agent. The customer enters their number, Omniweb AI calls them, and the AI explains products, services, bundles, objections, and checkout guidance just like the voice widget.</p>
      </DashboardCard>

      {telephonyConfig ? (
        <TelephonyConfigForm
          initialConfig={{
            omniwebPhoneAgentId: telephonyConfig.omniwebPhoneAgentId,
            aiPhoneNumber: telephonyConfig.aiPhoneNumber,
            escalationPhone: telephonyConfig.escalationPhone,
            escalationEmail: telephonyConfig.escalationEmail,
            escalationMessage: telephonyConfig.escalationMessage,
          }}
        />
      ) : null}
    </div>
  )
}
