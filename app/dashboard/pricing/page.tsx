import { Check } from "lucide-react"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { getDashboardSnapshot } from "@/lib/saas/status"

const plans = [
  {
    name: "Starter",
    price: "$0 during trial",
    description: "The launch-ready workspace for your first week with Omniweb.",
    features: ["7-day free trial", "AI Agent setup", "Widget embed snippet"],
  },
  {
    name: "Pro",
    price: "Coming soon",
    description: "Prepared for Stripe integration and long-term usage once billing goes live.",
    features: ["Advanced analytics", "Expanded knowledge controls", "Priority support"],
  },
  {
    name: "Business",
    price: "Contact sales",
    description: "For multi-brand and larger implementation workflows.",
    features: ["Custom onboarding", "Higher usage limits", "Dedicated success support"],
  },
]

export default async function DashboardPricingPage() {
  await requireDashboardAccess({ allowExpiredPricing: true })
  const snapshot = await getDashboardSnapshot()

  return (
    <div className="space-y-5">
      <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Pricing</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Billing placeholder before Stripe</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Stripe is not connected yet. For now, this page handles trial visibility and the future plan structure so expired trials can still access billing information.</p>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Current status:</span> {snapshot.status.subscriptionStatus === "expired" ? "Trial expired" : "Trial active"} · {snapshot.status.daysLeft ?? 0} day{snapshot.status.daysLeft === 1 ? "" : "s"} left
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
            <p className="text-xl font-semibold text-slate-950">{plan.name}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{plan.price}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{plan.description}</p>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(59,130,246,0.25)] transition hover:from-cyan-400 hover:to-purple-400">
              {plan.name === "Starter" ? "Current plan" : plan.name === "Business" ? "Contact sales" : "Upgrade placeholder"}
            </button>
          </div>
        ))}
      </section>
    </div>
  )
}
