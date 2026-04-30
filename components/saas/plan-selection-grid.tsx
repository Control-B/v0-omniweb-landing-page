"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { BILLING_PLANS } from "@/lib/saas/billing"
import type { PlanType, SubscriptionStatus } from "@/lib/saas/types"

type PlanSelectionGridProps = {
  variant: "public" | "billing"
  isSignedIn: boolean
  onboardingCompleted: boolean
  currentPlan: PlanType
  subscriptionStatus: SubscriptionStatus | null
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
    return "Get Started"
  }

  if (!onboardingCompleted) {
    return "Complete setup"
  }

  if (subscriptionStatus === "active") {
    return currentPlan === planKey ? "Current plan" : "Change plan"
  }

  if (variant === "billing" && subscriptionStatus === "expired") {
    return "Upgrade now"
  }

  return "Upgrade"
}

export function PlanSelectionGrid({ variant, isSignedIn, onboardingCompleted, currentPlan, subscriptionStatus }: PlanSelectionGridProps) {
  const router = useRouter()
  const [pendingPlan, setPendingPlan] = useState<NonNullable<PlanType> | null>(null)
  const [error, setError] = useState("")

  const handlePlanAction = async (plan: NonNullable<PlanType>) => {
    setError("")

    if (!isSignedIn) {
      router.push(`/sign-up?plan=${plan}`)
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
        body: JSON.stringify({ plan }),
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
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        {BILLING_PLANS.map((plan) => {
          const label = getActionLabel(variant, isSignedIn, onboardingCompleted, subscriptionStatus, currentPlan, plan.key)
          const isCurrentPlan = subscriptionStatus === "active" && currentPlan === plan.key
          const isLoading = pendingPlan === plan.key

          return (
            <section
              key={plan.key}
              className={`rounded-[1.75rem] border bg-white/80 p-6 shadow-[0_16px_35px_rgba(148,163,184,0.12)] ${plan.recommended ? "border-cyan-200 ring-2 ring-cyan-100" : "border-white/70"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold text-slate-950">{plan.name}</p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{plan.priceLabel}<span className="text-base font-medium text-slate-500">/mo</span></p>
                </div>
                {plan.recommended ? <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Recommended</span> : null}
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">{plan.description}</p>

              <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3"><span>AI agent</span><span className="font-semibold text-slate-900">{plan.aiAgent}</span></div>
                <div className="flex items-center justify-between gap-3"><span>Telephony</span><span className="font-semibold text-slate-900">{plan.telephony}</span></div>
                <div className="flex items-center justify-between gap-3"><span>Conversations / month</span><span className="font-semibold text-slate-900">{plan.conversationsPerMonth.toLocaleString()}</span></div>
              </div>

              <ul className="mt-5 space-y-3 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handlePlanAction(plan.key)}
                disabled={isLoading || isCurrentPlan}
                className={`mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold transition ${isCurrentPlan ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400" : plan.recommended ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white shadow-[0_14px_32px_rgba(59,130,246,0.25)] hover:from-cyan-400 hover:to-purple-400" : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"}`}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
              </button>
            </section>
          )
        })}
      </div>
    </div>
  )
}
