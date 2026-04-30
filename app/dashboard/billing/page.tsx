import { CreditCard, Sparkles, Wallet } from "lucide-react"
import { PlanSelectionGrid } from "@/components/saas/plan-selection-grid"
import { getPlanDetails } from "@/lib/saas/billing"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

function formatPlanName(plan: string | null | undefined) {
  if (plan === "standard") return "Standard"
  if (plan === "business") return "Business"
  return "Starter"
}

function formatDate(value: string | null) {
  if (!value) {
    return "—"
  }

  return new Date(value).toLocaleDateString()
}

function getBannerCopy(subscriptionStatus: string | null, daysLeft: number | null) {
  if (subscriptionStatus === "active") {
    return {
      title: "Your subscription is active",
      body: "Your workspace has full access to AI Agent, Telephony, Knowledge, Test Console, and Analytics.",
      action: "Manage plan",
    }
  }

  if (subscriptionStatus === "expired") {
    return {
      title: "Your trial has expired",
      body: "Upgrade to continue using your Omniweb workspace and unlock all dashboard features again.",
      action: "Upgrade to continue",
    }
  }

  return {
    title: `Your 7-day free trial is active — ${daysLeft ?? 7} day${daysLeft === 1 ? "" : "s"} remaining`,
    body: "Upgrade anytime to convert your workspace into an active subscription without waiting for Stripe checkout.",
    action: "Upgrade plan",
  }
}

export default async function DashboardBillingPage() {
  await requireDashboardAccess({ allowExpiredBilling: true })
  const snapshot = await getDashboardSnapshot()
  const billingStatus = snapshot.billingStatus

  if (!billingStatus) {
    return null
  }

  const banner = getBannerCopy(snapshot.status.subscriptionStatus, snapshot.status.daysLeft)
  const planDetails = getPlanDetails(billingStatus.plan)

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Wallet className="h-4 w-4 text-cyan-500" />Subscription</div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">{formatPlanName(billingStatus.plan)}</p>
          <dl className="mt-5 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3"><dt>Status</dt><dd className="font-semibold text-slate-900 capitalize">{billingStatus.subscriptionStatus}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt>Trial days left</dt><dd className="font-semibold text-slate-900">{billingStatus.isTrialActive ? billingStatus.daysLeft ?? 0 : "—"}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt>Renewal date</dt><dd className="font-semibold text-slate-900">{formatDate(billingStatus.renewalDate)}</dd></div>
          </dl>
          <a href="#billing-plans" className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">{banner.action}</a>
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><CreditCard className="h-4 w-4 text-violet-500" />Payment Method</div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">No payment method added yet</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Stripe isn’t connected yet, but this card is ready for future customer billing and payment method management.</p>
          <button type="button" disabled className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-5 text-sm font-semibold text-slate-400">Add payment method</button>
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Sparkles className="h-4 w-4 text-emerald-500" />Usage</div>
          <p className="mt-5 text-2xl font-semibold text-slate-950">0 / {planDetails.conversationsPerMonth.toLocaleString()}</p>
          <p className="mt-2 text-sm text-slate-600">Conversations used this billing window</p>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="flex items-center justify-between gap-3"><span>AI interactions</span><span className="font-semibold text-slate-900">0</span></div>
            <div className="mt-3 flex items-center justify-between gap-3"><span>Workspace limit</span><span className="font-semibold text-slate-900">{planDetails.conversationsPerMonth.toLocaleString()} / month</span></div>
          </div>
        </div>
      </section>

      <section id="billing-plans" className="space-y-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Plans</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Choose the right Omniweb plan</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Upgrade now to simulate a live subscription flow. Stripe can drop into the same upgrade hook later.</p>
        </div>

        <PlanSelectionGrid
          variant="billing"
          isSignedIn={snapshot.status.isSignedIn}
          onboardingCompleted={snapshot.status.onboardingCompleted}
          currentPlan={billingStatus.plan}
          subscriptionStatus={billingStatus.subscriptionStatus}
        />
      </section>
    </div>
  )
}
