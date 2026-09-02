"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2, Sparkles } from "lucide-react"
import { getBillingPlans } from "@/lib/saas/billing"
import type { PlanType, SubscriptionStatus } from "@/lib/saas/types"

type PlanSelectionGridProps = {
  variant: "public" | "billing"
  isSignedIn: boolean
  onboardingCompleted: boolean
  currentPlan: PlanType
  subscriptionStatus: SubscriptionStatus | null
  industry?: string | null
  billingInterval?: "monthly" | "annual"
}

function getActionLabel(
  variant: PlanSelectionGridProps["variant"],
  isSignedIn: boolean,
  onboardingCompleted: boolean,
  subscriptionStatus: SubscriptionStatus | null,
  currentPlan: PlanType,
  planKey: NonNullable<PlanType>,
) {
  if (!isSignedIn) {
    return "Start 7-Day Free Trial"
  }

  if (!onboardingCompleted) {
    return "Complete Setup"
  }

  if (subscriptionStatus === "active") {
    return currentPlan === planKey ? "Current Plan" : "Switch Plan"
  }

  if (variant === "billing" && subscriptionStatus === "expired") {
    return "Reactivate Plan"
  }

  return "Upgrade Plan"
}

export function PlanSelectionGrid({
  variant,
  isSignedIn,
  onboardingCompleted,
  currentPlan,
  subscriptionStatus,
  industry,
  billingInterval = "monthly",
}: PlanSelectionGridProps) {
  const router = useRouter()
  const [pendingPlan, setPendingPlan] = useState<NonNullable<PlanType> | null>(null)
  const [error, setError] = useState("")
  const plans = getBillingPlans(industry)

  const handlePlanAction = async (plan: NonNullable<PlanType>) => {
    setError("")

    if (!isSignedIn) {
      router.push(`/get-started?plan=${plan}&interval=${billingInterval}`)
      return
    }

    if (!onboardingCompleted) {
      router.push("/onboarding")
      return
    }

    if (subscriptionStatus === "active" && currentPlan === plan) {
      router.push("/dashboard/billing")
      return
    }

    setPendingPlan(plan)

    try {
      const response = await fetch("/api/billing/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan, interval: billingInterval }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        if (payload?.redirectTo) {
          router.push(payload.redirectTo)
          return
        }

        setError(payload?.error ?? "Unable to update billing right now.")
        return
      }

      router.push(payload?.redirectTo ?? "/dashboard/billing")
      router.refresh()
    } catch {
      setError("Unable to update billing right now.")
    } finally {
      setPendingPlan(null)
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const label = getActionLabel(
            variant,
            isSignedIn,
            onboardingCompleted,
            subscriptionStatus,
            currentPlan,
            plan.key,
          )
          const isCurrentPlan = subscriptionStatus === "active" && currentPlan === plan.key
          const isLoading = pendingPlan === plan.key

          // Apply 20% annual discount if annual is selected
          const monthlyPrice = plan.price
          const displayPrice =
            billingInterval === "annual"
              ? Math.round(monthlyPrice * 0.8)
              : monthlyPrice

          return (
            <section
              key={plan.key}
              className={`relative flex flex-col justify-between rounded-[2rem] p-7 transition-all duration-300 ${
                plan.recommended
                  ? "border-2 border-cyan-500/60 bg-[linear-gradient(180deg,rgba(13,24,46,0.92),rgba(8,15,31,0.92))] shadow-[0_0_50px_rgba(6,182,212,0.18)] ring-1 ring-cyan-400/30"
                  : "border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,34,0.85),rgba(6,11,22,0.85))] shadow-xl shadow-black/40 hover:border-white/20"
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-cyan-500/25">
                    <Sparkles className="h-3 w-3" /> Most Popular
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{plan.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {plan.key === "starter" && "For fast-moving solo operators & local startups"}
                      {plan.key === "standard" && "For growing businesses scaling lead conversion"}
                      {plan.key === "business" && "For high-volume contact centers & enterprise brands"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-tight text-white">
                    ${displayPrice}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    /mo {billingInterval === "annual" && "(billed annually)"}
                  </span>
                </div>

                {billingInterval === "annual" && (
                  <p className="mt-1 text-xs font-semibold text-emerald-400">
                    Saves ${(monthlyPrice - displayPrice) * 12} per year
                  </p>
                )}

                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  {plan.description}
                </p>

                {/* Metric pill box */}
                <div className="mt-6 space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-medium">AI Agent Architecture</span>
                    <span className="font-semibold text-white">{plan.aiAgent}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-medium">Telephony Engine</span>
                    <span className="font-semibold text-white">{plan.telephony}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-medium">Included Volume</span>
                    <span className="font-semibold text-cyan-300">
                      {plan.conversationsPerMonth.toLocaleString()} {plan.metricLabel.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-medium">Voice Pipeline</span>
                    <span className="font-semibold text-emerald-400">
                      Sub-250ms LiveKit WebRTC
                    </span>
                  </div>
                </div>

                {/* Features list */}
                <div className="mt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                    What&apos;s Included:
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-200">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handlePlanAction(plan.key)}
                  disabled={isLoading || isCurrentPlan}
                  className={`inline-flex h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-bold tracking-wide transition-all ${
                    isCurrentPlan
                      ? "cursor-not-allowed border border-white/10 bg-white/5 text-slate-400"
                      : plan.recommended
                        ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:from-cyan-400 hover:to-purple-500"
                        : "border border-white/15 bg-white/10 text-white hover:bg-white/20 hover:border-white/30"
                  }`}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
                </button>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  7-day risk-free trial • No credit card required to start
                </p>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
