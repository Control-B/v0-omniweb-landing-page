"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle2, Shield, Sparkles } from "lucide-react"
import { PlanSelectionGrid } from "@/components/saas/plan-selection-grid"
import { PRICING_INDUSTRY_OPTIONS, getPricingContent, normalizeIndustry } from "@/lib/saas/billing"
import type { PlanType, SubscriptionStatus } from "@/lib/saas/types"

type PricingPageContentProps = {
  isSignedIn: boolean
  onboardingCompleted: boolean
  currentPlan: PlanType
  subscriptionStatus: SubscriptionStatus | null
  initialIndustry: string | null
}

export function PricingPageContent({
  isSignedIn,
  onboardingCompleted,
  currentPlan,
  subscriptionStatus,
  initialIndustry,
}: PricingPageContentProps) {
  const [selectedIndustry, setSelectedIndustry] = useState(() => normalizeIndustry(initialIndustry))
  const content = getPricingContent(selectedIndustry)

  return (
    <>
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6 rounded-[2rem] border border-white/70 bg-white/80 px-6 py-10 shadow-[0_24px_60px_rgba(148,163,184,0.14)] backdrop-blur sm:px-8">
          <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{content.badge}</div>
          <div className="max-w-4xl">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{content.headline}</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">{content.description}</p>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Adapt pricing by industry</p>
                <p className="mt-1 text-sm text-slate-600">Switch the value story and primary metric without changing the underlying plan ladder.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRICING_INDUSTRY_OPTIONS.map((option) => {
                  const active = selectedIndustry === option.key

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setSelectedIndustry(option.key)}
                      className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${active ? "bg-slate-900 text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)]" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {content.highlights.map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Plans</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{content.plansHeading}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{content.plansDescription}</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
              {isSignedIn ? `Showing pricing for ${content.label.toLowerCase()} teams. Upgrade lands you back in Billing.` : `Not signed in? Pick an industry, click Get Started, and we’ll carry your plan choice into sign-up.`}
            </div>
          </div>

          <PlanSelectionGrid
            variant="public"
            isSignedIn={isSignedIn}
            onboardingCompleted={onboardingCompleted}
            currentPlan={currentPlan}
            subscriptionStatus={subscriptionStatus}
            industry={selectedIndustry}
          />
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">
          {[
            { icon: Sparkles, title: "AI-first workspace", body: "Every plan includes the same premium Omniweb dashboard for agent, telephony, test console, and knowledge management." },
            { icon: Shield, title: "Upgrade without friction", body: "Trial users can upgrade in one click today, then move to a Stripe-powered flow later without changing the UX." },
            { icon: ArrowRight, title: "Built to convert", body: `The pricing story flexes for ${content.label.toLowerCase()} teams while the backend plan logic stays stable and reusable.` },
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

      <section id="faq" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)] sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500"><CheckCircle2 className="h-4 w-4 text-emerald-500" />FAQ</div>
          <div className="mt-6 space-y-4">
            {[
              {
                question: "Can I upgrade during the trial?",
                answer: "Yes. Upgrading immediately converts your workspace into an active subscription and sends you to Billing, even before Stripe is connected.",
              },
              {
                question: "Does industry selection change the price ladder?",
                answer: "No. The backend pricing ladder stays fixed. Industry selection only changes how plans are framed, measured, and presented in the UI.",
              },
              {
                question: "Will Stripe work here later?",
                answer: "Yes. The pricing and billing flow is built around a reusable upgrade hook so Stripe checkout and customer portal actions can be attached later.",
              },
            ].map((item) => (
              <div key={item.question} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-base font-semibold text-slate-900">{item.question}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}