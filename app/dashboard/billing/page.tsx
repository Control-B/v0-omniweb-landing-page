import { CreditCard, Sparkles, Wallet } from "lucide-react"
import { DashboardCard } from "@/components/saas/dashboard-card"
import { PlanSelectionGrid } from "@/components/saas/plan-selection-grid"
import { getDisplayPlanName, getPlanDetails, getPricingContent } from "@/lib/saas/billing"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

function formatDate(value: string | null) {
  if (!value) {
    return "—"
  }

  return new Date(value).toLocaleDateString()
}

export default async function DashboardBillingPage() {
  await requireDashboardAccess({ allowExpiredBilling: true })
  const snapshot = await getDashboardSnapshot()
  const billingStatus = snapshot.billingStatus

  if (!billingStatus) {
    return null
  }

  const pricingContent = getPricingContent(snapshot.status.industry)
  const planDetails = getPlanDetails(billingStatus.plan, snapshot.status.industry)

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <DashboardCard className="flex min-h-0 flex-col sm:min-h-[240px]">
          <div className="flex items-center gap-2 text-[15px] font-semibold text-slate-900"><Wallet className="h-4 w-4 text-cyan-500" />Subscription</div>
          <p className="dashboard-stat mt-5">{getDisplayPlanName(billingStatus.plan, snapshot.status.industry)}</p>
          <p className="dashboard-body mt-3">Track plan status, renewal timing, and the {pricingContent.label.toLowerCase()} usage model attached to this workspace.</p>
          <dl className="mt-5 space-y-3 text-[15px] text-slate-600">
            <div className="dashboard-card-muted flex flex-col gap-1 rounded-[18px] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><dt>Status</dt><dd className="font-semibold text-slate-900 capitalize">{billingStatus.subscriptionStatus}</dd></div>
            <div className="dashboard-card-muted flex flex-col gap-1 rounded-[18px] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><dt>Trial days left</dt><dd className="font-semibold text-slate-900">{billingStatus.isTrialActive ? billingStatus.daysLeft ?? 0 : "—"}</dd></div>
            <div className="dashboard-card-muted flex flex-col gap-1 rounded-[18px] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><dt>Renewal date</dt><dd className="font-semibold text-slate-900">{formatDate(billingStatus.renewalDate)}</dd></div>
          </dl>
          <a href="#billing-plans" className="dashboard-primary-button mt-auto inline-flex h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold transition hover:opacity-95 sm:h-12 sm:px-5 sm:text-[15px]">Choose a plan</a>
        </DashboardCard>

        <DashboardCard className="flex min-h-0 flex-col sm:min-h-[240px]">
          <div className="flex items-center gap-2 text-[15px] font-semibold text-slate-900"><CreditCard className="h-4 w-4 text-violet-500" />Payment Method</div>
          <p className="dashboard-stat mt-5">No payment method</p>
          <p className="dashboard-body mt-3">Stripe isn’t connected yet, but this card is ready for future customer billing and payment method management.</p>
          <div className="dashboard-card-muted mt-5 rounded-[18px] p-4 text-[15px] text-slate-700">
            Payment method collection will appear here once billing checkout is connected.
          </div>
          <button type="button" disabled className="dashboard-secondary-button mt-auto inline-flex h-11 w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold text-slate-400 sm:h-12 sm:px-5 sm:text-[15px]">Add payment method</button>
        </DashboardCard>

        <DashboardCard className="flex min-h-0 flex-col sm:min-h-[240px]">
          <div className="flex items-center gap-2 text-[15px] font-semibold text-slate-900"><Sparkles className="h-4 w-4 text-emerald-500" />Usage</div>
          <p className="dashboard-stat mt-5">0 / {planDetails.conversationsPerMonth.toLocaleString()}</p>
          <p className="dashboard-body mt-3">{planDetails.metricLabel} used this billing window</p>
          <div className="dashboard-card-muted mt-5 rounded-[18px] p-4 text-[15px] text-slate-700">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><span>{pricingContent.usageSummaryLabel}</span><span className="font-semibold text-slate-900">0</span></div>
            <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><span>Workspace limit</span><span className="font-semibold text-slate-900">{planDetails.conversationsPerMonth.toLocaleString()} {planDetails.metricLabel.toLowerCase()}</span></div>
          </div>
        </DashboardCard>
      </section>

      <DashboardCard id="billing-plans" className="space-y-5">
        <div>
          <p className="dashboard-eyebrow">Plans</p>
          <h3 className="dashboard-page-title mt-3">Choose the right Omniweb plan</h3>
          <p className="dashboard-body mt-3">{pricingContent.plansDescription}</p>
        </div>

        <PlanSelectionGrid
          variant="billing"
          isSignedIn={snapshot.status.isSignedIn}
          onboardingCompleted={snapshot.status.onboardingCompleted}
          currentPlan={billingStatus.plan}
          subscriptionStatus={billingStatus.subscriptionStatus}
          industry={snapshot.status.industry}
        />
      </DashboardCard>
    </div>
  )
}
