import type { PlanType, SubscriptionStatus, TenantBillingStatus, TenantRecord } from "@/lib/saas/types"

export const BILLING_PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: 99,
    priceLabel: "$99",
    description: "For lean teams launching their first Omniweb AI agent.",
    conversationsPerMonth: 500,
    aiAgent: "1 AI agent",
    telephony: "Basic AI telephony",
    recommended: false,
    features: ["AI agent", "AI telephony", "500 conversations / month", "Knowledge sources", "Email support"],
  },
  {
    key: "standard",
    name: "Standard",
    price: 199,
    priceLabel: "$199",
    description: "Best for growing teams that need broader AI coverage and more monthly volume.",
    conversationsPerMonth: 1500,
    aiAgent: "1 AI agent",
    telephony: "Advanced AI telephony",
    features: ["AI agent", "AI telephony", "1,500 conversations / month", "Knowledge sources", "Priority support"],
    recommended: true,
  },
  {
    key: "business",
    name: "Business",
    price: 299,
    priceLabel: "$299",
    description: "For high-touch teams that want the highest conversation capacity and support tier.",
    conversationsPerMonth: 5000,
    aiAgent: "Multi-team AI agent setup",
    telephony: "Business AI telephony",
    recommended: false,
    features: ["AI agent", "AI telephony", "5,000 conversations / month", "Knowledge sources", "White-glove support"],
  },
] as const

const PLAN_INDEX = Object.fromEntries(BILLING_PLANS.map((plan) => [plan.key, plan])) as Record<Exclude<PlanType, null>, (typeof BILLING_PLANS)[number]>

function getDaysLeft(dateValue: string | null) {
  if (!dateValue) {
    return null
  }

  const diff = new Date(dateValue).getTime() - Date.now()
  if (diff <= 0) {
    return 0
  }

  return Math.max(1, Math.ceil(diff / (24 * 60 * 60 * 1000)))
}

export function normalizePlanType(value: string | null | undefined): Exclude<PlanType, null> {
  if (value === "starter" || value === "standard" || value === "business") {
    return value
  }

  if (value === "pro") {
    return "standard"
  }

  return "starter"
}

export function getPlanDetails(plan: PlanType | null) {
  return PLAN_INDEX[normalizePlanType(plan)]
}

export function getTenantBillingStatus(tenant: TenantRecord | null): TenantBillingStatus {
  const normalizedPlan = normalizePlanType(tenant?.plan)
  const trialDaysLeft = getDaysLeft(tenant?.trialEndsAt ?? null)
  const subscriptionDaysLeft = getDaysLeft(tenant?.subscriptionEndsAt ?? null)

  let subscriptionStatus: SubscriptionStatus = tenant?.subscriptionStatus ?? "trialing"

  const trialExpired = subscriptionStatus === "trialing" && trialDaysLeft === 0
  const activeSubscriptionExpired = subscriptionStatus === "active" && subscriptionDaysLeft === 0

  if (trialExpired || activeSubscriptionExpired) {
    subscriptionStatus = "expired"
  }

  const isTrialActive = subscriptionStatus === "trialing" && trialDaysLeft !== 0
  const isExpired = subscriptionStatus === "expired"
  const canAccessFeatures = subscriptionStatus === "active" || isTrialActive

  return {
    plan: normalizedPlan,
    subscriptionStatus,
    daysLeft: subscriptionStatus === "trialing" ? trialDaysLeft : subscriptionStatus === "active" ? subscriptionDaysLeft : 0,
    isTrialActive,
    isExpired,
    canAccessFeatures,
    renewalDate: subscriptionStatus === "active" ? tenant?.subscriptionEndsAt ?? null : null,
    subscriptionStartedAt: tenant?.subscriptionStartedAt ?? null,
    subscriptionEndsAt: tenant?.subscriptionEndsAt ?? null,
    stripeCustomerId: tenant?.stripeCustomerId ?? null,
    stripeSubscriptionId: tenant?.stripeSubscriptionId ?? null,
    conversationLimit: getPlanDetails(normalizedPlan).conversationsPerMonth,
  }
}