import { ArrowRight, CheckCircle2, Shield, Sparkles } from "lucide-react"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { PlanSelectionGrid } from "@/components/saas/plan-selection-grid"
import { getCurrentUserTenantStatus } from "@/lib/saas/status"

const faqs = [
  {
    question: "Can I upgrade during the trial?",
    answer: "Yes. Upgrading immediately converts your workspace into an active subscription and sends you to Billing, even before Stripe is connected.",
  },
  {
    question: "What happens when my 7-day trial ends?",
    answer: "Your AI setup stays saved, but feature access is restricted until you upgrade. Billing stays available so you can reactivate quickly.",
  },
  {
    question: "Will Stripe work here later?",
    answer: "Yes. The pricing and billing flow is built around a reusable upgrade hook so Stripe checkout and customer portal actions can be attached later.",
  },
]

export default async function PricingPage() {
  const status = await getCurrentUserTenantStatus()

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_52%,#f8fbff_100%)] text-slate-900">
      <Header />

      <main className="pt-20">
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-6 rounded-[2rem] border border-white/70 bg-white/80 px-6 py-10 shadow-[0_24px_60px_rgba(148,163,184,0.14)] backdrop-blur sm:px-8">
            <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Omniweb Pricing</div>
            <div className="max-w-4xl">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Choose the Omniweb plan that fits your AI growth stage.</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">Start with a 7-day trial, upgrade when you’re ready, and keep the same clean Omniweb workspace from onboarding through billing.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Conversion-ready", body: "Use the same pricing flow for new signups, active trials, and expired workspaces." },
                { title: "Stripe-ready", body: "The upgrade action is modular, so checkout and customer portal integrations slot in later." },
                { title: "No migration pain", body: "Your AI agent, telephony, knowledge, and workspace stay intact when you move from trial to paid." },
              ].map((item) => (
                <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Plans</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Simple monthly pricing for AI agent, telephony, and conversation volume.</h2>
              </div>
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
                {status.isSignedIn ? "Signed in users can upgrade instantly and land in Billing." : "Not signed in? Click Get Started and we’ll send you to sign-up first."}
              </div>
            </div>

            <PlanSelectionGrid
              variant="public"
              isSignedIn={status.isSignedIn}
              onboardingCompleted={status.onboardingCompleted}
              currentPlan={status.plan}
              subscriptionStatus={status.subscriptionStatus}
            />
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">
            {[
              { icon: Sparkles, title: "AI-first workspace", body: "Every plan includes the same premium Omniweb dashboard for agent, telephony, test console, and knowledge management." },
              { icon: Shield, title: "Upgrade without friction", body: "Trial users can upgrade in one click today, then move to a Stripe-powered flow later without changing the UX." },
              { icon: ArrowRight, title: "Built to convert", body: "Expired workspaces are routed back to public pricing while Billing stays available in-dashboard for account management." },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 text-white shadow-[0_14px_32px_rgba(59,130,246,0.22)]">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-lg font-semibold text-slate-950">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)] sm:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-500" />FAQ</div>
            <div className="mt-6 space-y-4">
              {faqs.map((item) => (
                <div key={item.question} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-base font-semibold text-slate-900">{item.question}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
