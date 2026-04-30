import { CreditCard, Sparkles, Wallet } from "lucide-react"
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
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="flex min-h-[260px] flex-col rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Wallet className="h-4 w-4 text-cyan-500" />Subscription</div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">{getDisplayPlanName(billingStatus.plan, snapshot.status.industry)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Track plan status, renewal timing, and the {pricingContent.label.toLowerCase()} usage model attached to this workspace.</p>
          <dl className="mt-5 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"><dt>Status</dt><dd className="font-semibold text-slate-900 capitalize">{billingStatus.subscriptionStatus}</dd></div>
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"><dt>Trial days left</dt><dd className="font-semibold text-slate-900">{billingStatus.isTrialActive ? billingStatus.daysLeft ?? 0 : "—"}</dd></div>
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3"><dt>Renewal date</dt><dd className="font-semibold text-slate-900">{formatDate(billingStatus.renewalDate)}</dd></div>
          </dl>
          <a href="#billing-plans" className="mt-auto inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">Choose a plan</a>
        </div>

        <div className="flex min-h-[260px] flex-col rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><CreditCard className="h-4 w-4 text-violet-500" />Payment Method</div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">No payment method added yet</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Stripe isn’t connected yet, but this card is ready for future customer billing and payment method management.</p>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Payment method collection will appear here once billing checkout is connected.
          </div>
          <button type="button" disabled className="mt-auto inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-5 text-sm font-semibold text-slate-400">Add payment method</button>
        </div>

        <div className="flex min-h-[260px] flex-col rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Sparkles className="h-4 w-4 text-emerald-500" />Usage</div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">0 / {planDetails.conversationsPerMonth.toLocaleString()}</p>
          <p className="mt-2 text-sm text-slate-600">{planDetails.metricLabel} used this billing window</p>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="flex items-center justify-between gap-3"><span>{pricingContent.usageSummaryLabel}</span><span className="font-semibold text-slate-900">0</span></div>
            <div className="mt-3 flex items-center justify-between gap-3"><span>Workspace limit</span><span className="font-semibold text-slate-900">{planDetails.conversationsPerMonth.toLocaleString()} {planDetails.metricLabel.toLowerCase()}</span></div>
          </div>
        </div>
      </section>

      <section id="billing-plans" className="space-y-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Plans</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Choose the right Omniweb plan</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{pricingContent.plansDescription}</p>
        </div>

        <PlanSelectionGrid
          variant="billing"
          isSignedIn={snapshot.status.isSignedIn}
          onboardingCompleted={snapshot.status.onboardingCompleted}
          currentPlan={billingStatus.plan}
          subscriptionStatus={billingStatus.subscriptionStatus}
          industry={snapshot.status.industry}
        />
      </section>
    </div>
  )
}
