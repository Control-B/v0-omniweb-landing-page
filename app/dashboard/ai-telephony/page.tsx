import { Phone } from "lucide-react"
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
    <div className="space-y-5">
      <section className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(90deg,rgba(99,102,241,0.10),rgba(34,211,238,0.08),rgba(99,102,241,0.08))] p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"><Phone className="h-4 w-4 text-cyan-500" />AI Telephony</div>
        <p className="mt-2 text-sm text-slate-600">Let shoppers request a phone call with the same Omniweb AI agent.</p>
        <div className="mt-5 rounded-[1.5rem] border border-cyan-100 bg-[linear-gradient(90deg,rgba(255,255,255,0.85),rgba(240,249,255,0.85),rgba(237,233,254,0.9))] px-5 py-5">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Add a Call Us AI phone widget.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">The customer enters their number, Omniweb AI calls them, and the AI explains products, services, bundles, objections, and checkout guidance just like the voice widget.</p>
        </div>
      </section>

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
