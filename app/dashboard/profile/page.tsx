import { Building2, Fingerprint, Globe2, UserRound } from "lucide-react"
import { DashboardCard } from "@/components/saas/dashboard-card"
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
    <div className="grid min-w-0 gap-4 md:gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <DashboardCard>
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"><UserRound className="h-4 w-4 text-cyan-500" />Profile</div>
        <h2 className="dashboard-page-title mt-4">Account &amp; Workspace Profile</h2>
        <p className="dashboard-body mt-3">Update your workspace details without exposing sensitive Clerk account data.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="dashboard-card-muted rounded-[20px] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">User name</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">{snapshot.status.firstName || "Omniweb user"}</p>
          </div>
          <div className="dashboard-card-muted rounded-[20px] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Email</p>
            <p className="mt-3 text-lg font-semibold text-slate-950 break-all">{snapshot.status.email || "—"}</p>
          </div>
          <div className="dashboard-card-muted rounded-[20px] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plan / status</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">{formatPlanName(snapshot.status.plan, snapshot.status.subscriptionStatus)}</p>
          </div>
          <div className="dashboard-card-muted rounded-[20px] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Trial days remaining</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">{snapshot.status.subscriptionStatus === "trialing" ? snapshot.status.daysLeft ?? 0 : "—"}</p>
          </div>
          <div className="dashboard-card-muted rounded-[20px] p-4 md:col-span-2">
            <div className="flex min-w-0 items-center gap-2">
              <Fingerprint className="h-4 w-4 text-cyan-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Client ID / Tenant ID</p>
            </div>
            <p className="mt-3 break-all rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 font-mono text-[13px] font-semibold text-slate-950">
              {snapshot.status.tenantId}
            </p>
            <p className="dashboard-meta mt-2">This is created automatically when your workspace is created and is used to connect the dashboard, widget, and AI engine.</p>
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
      </DashboardCard>

      <section className="space-y-5">
        <DashboardCard>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Building2 className="h-4 w-4 text-violet-500" />Business snapshot</div>
          <dl className="mt-5 space-y-4 text-[15px] text-slate-600">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><dt>Business name</dt><dd className="font-semibold text-slate-900">{snapshot.status.businessName || "Not set"}</dd></div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><dt>Industry</dt><dd className="font-semibold text-slate-900">{snapshot.status.industry || "Not set"}</dd></div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><dt>Website domain</dt><dd className="break-all font-semibold text-slate-900 sm:text-right">{snapshot.status.websiteDomain || "Not set"}</dd></div>
          </dl>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Globe2 className="h-4 w-4 text-emerald-500" />Workspace guidance</div>
          <p className="dashboard-body mt-4">Keep your business name, industry, and website domain accurate so the AI assistant, onboarding context, and analytics remain aligned with your current workspace.</p>
        </DashboardCard>
      </section>
    </div>
  )
}