import { Building2, Globe2, UserRound } from "lucide-react"
import { ProfileSettingsForm } from "@/components/saas/profile-settings-form"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

function formatPlanName(plan: string | null, subscriptionStatus: string | null) {
  if (subscriptionStatus === "expired") return "Expired"
  if (subscriptionStatus === "trialing") return "Trial"
  if (plan === "business") return "Business"
  if (plan === "standard") return "Standard"
  return "Starter"
}

export default async function DashboardProfilePage() {
  await requireDashboardAccess({ allowExpiredBilling: true })
  const snapshot = await getDashboardSnapshot()

  if (!snapshot.status.tenantId) {
    return null
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"><UserRound className="h-4 w-4 text-cyan-500" />Profile</div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Account &amp; Workspace Profile</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Update your workspace details without exposing sensitive Clerk account data.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">User name</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">{snapshot.status.firstName || "Omniweb user"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Email</p>
            <p className="mt-3 text-lg font-semibold text-slate-950 break-all">{snapshot.status.email || "—"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plan / status</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">{formatPlanName(snapshot.status.plan, snapshot.status.subscriptionStatus)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Trial days remaining</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">{snapshot.status.subscriptionStatus === "trialing" ? snapshot.status.daysLeft ?? 0 : "—"}</p>
          </div>
        </div>

        <div className="mt-6">
          <ProfileSettingsForm
            initialValues={{
              businessName: snapshot.status.businessName || "",
              industry: snapshot.status.industry || "",
              websiteDomain: snapshot.status.websiteDomain || "",
            }}
          />
        </div>
      </section>

      <section className="space-y-5">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Building2 className="h-4 w-4 text-violet-500" />Business snapshot</div>
          <dl className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3"><dt>Business name</dt><dd className="font-semibold text-slate-900">{snapshot.status.businessName || "Not set"}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt>Industry</dt><dd className="font-semibold text-slate-900">{snapshot.status.industry || "Not set"}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt>Website domain</dt><dd className="font-semibold text-slate-900 break-all text-right">{snapshot.status.websiteDomain || "Not set"}</dd></div>
          </dl>
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Globe2 className="h-4 w-4 text-emerald-500" />Workspace guidance</div>
          <p className="mt-4 text-sm leading-7 text-slate-600">Keep your business name, industry, and website domain accurate so the AI assistant, onboarding context, and analytics remain aligned with your current workspace.</p>
        </div>
      </section>
    </div>
  )
}