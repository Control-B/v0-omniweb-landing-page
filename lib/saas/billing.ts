import type { PlanType, SubscriptionStatus, TenantBillingStatus, TenantRecord } from "@/lib/saas/types"

export type PricingIndustryKey = "general" | "ecommerce" | "contractors" | "professionals" | "mechanics"

type BillingPlanKey = Exclude<PlanType, null>

type IndustryPlanContent = {
  name: string
  description: string
  metricLabel: string
  conversationsPerMonth: number
  aiAgent: string
  telephony: string
  features: string[]
}

type PricingIndustryContent = {
  label: string
  selectorLabel: string
  badge: string
  headline: string
  description: string
  plansHeading: string
  plansDescription: string
  usageLabel: string
  usageSummaryLabel: string
  highlights: Array<{
    title: string
    body: string
  }>
  plans: Record<BillingPlanKey, IndustryPlanContent>
}

const PLAN_BLUEPRINTS = [
  { key: "starter", price: 149, priceLabel: "$149", recommended: false },
  { key: "standard", price: 299, priceLabel: "$299", recommended: true },
  { key: "business", price: 499, priceLabel: "$499", recommended: false },
] as const satisfies ReadonlyArray<{
  key: BillingPlanKey
  price: number
  priceLabel: string
  recommended: boolean
}>

const INDUSTRY_PRICING_CONTENT: Record<PricingIndustryKey, PricingIndustryContent> = {
  general: {
    label: "General",
    selectorLabel: "General AI",
    badge: "Omniweb Pricing",
    headline: "Choose the Omniweb plan that fits your AI growth stage.",
    description: "Launch with voice, chat, telephony, and follow-up automation on one fixed pricing ladder that scales as your team grows.",
    plansHeading: "Simple monthly pricing for AI agent, telephony, and conversion volume.",
    plansDescription: "Each plan keeps the same product foundation while increasing the monthly AI capacity and support depth.",
    usageLabel: "AI conversations / month",
    usageSummaryLabel: "AI interactions",
    highlights: [
      { title: "Conversion-ready", body: "Use the same pricing flow for new signups, active trials, and expired workspaces." },
      { title: "Industry-flexible", body: "Swap the framing, metrics, and value props per industry without changing backend billing keys." },
      { title: "No migration pain", body: "Your agent, telephony, knowledge, and workspace stay intact as you move up plans." },
    ],
    plans: {
      starter: {
        name: "Starter",
        description: "For lean teams launching their first Omniweb AI workflow.",
        metricLabel: "AI conversations / month",
        conversationsPerMonth: 1200,
        aiAgent: "1 AI agent",
        telephony: "Voice + chat coverage",
        features: ["AI website assistant", "AI telephony", "1,200 monthly interactions", "Knowledge sources", "Email support"],
      },
      standard: {
        name: "Growth",
        description: "Best for teams that need stronger automation coverage and more monthly capacity.",
        metricLabel: "AI conversations / month",
        conversationsPerMonth: 5000,
        aiAgent: "1 advanced AI agent",
        telephony: "Priority voice + chat routing",
        features: ["Conversion playbooks", "AI telephony", "5,000 monthly interactions", "Knowledge sources", "Priority support"],
      },
      business: {
        name: "Scale",
        description: "For high-volume teams that want the deepest capacity, routing, and onboarding support.",
        metricLabel: "AI conversations / month",
        conversationsPerMonth: 12000,
        aiAgent: "Multi-team AI workspace",
        telephony: "Advanced call routing + escalation",
        features: ["Multi-channel AI assistant", "AI telephony", "12,000 monthly interactions", "Knowledge + workflow support", "White-glove onboarding"],
      },
    },
  },
  ecommerce: {
    label: "Ecommerce",
    selectorLabel: "Shopify & ecommerce",
    badge: "Pricing for revenue-driving storefront AI",
    headline: "Pricing that scales from first conversions to full-funnel commerce automation.",
    description: "Give stores a fixed Omniweb price ladder while reframing each plan around shopper conversion, merchandising help, and post-purchase support.",
    plansHeading: "Store-ready plans for chat, voice, merchandising support, and recovery flows.",
    plansDescription: "Perfect for Shopify brands and ecommerce teams that want AI to answer product questions, recover carts, and lift AOV.",
    usageLabel: "Shopper conversations / month",
    usageSummaryLabel: "Storefront AI sessions",
    highlights: [
      { title: "Revenue-focused", body: "Frame plan value around product discovery, abandoned-cart recovery, and faster buyer answers." },
      { title: "Omnichannel", body: "Support storefront chat, AI voice, and follow-up flows without splitting tools by team." },
      { title: "Launch faster", body: "Use industry-tuned messaging while keeping the same upgrade and billing mechanics underneath." },
    ],
    plans: {
      starter: {
        name: "Launch Store AI",
        description: "For newer stores that need AI handling product questions and conversion nudges from day one.",
        metricLabel: "Shopper conversations / month",
        conversationsPerMonth: 1500,
        aiAgent: "1 storefront AI agent",
        telephony: "Order and sales call coverage",
        features: ["Product Q&A assistant", "Order-status and FAQ support", "1,500 shopper sessions", "Cart recovery prompts", "Email support"],
      },
      standard: {
        name: "Revenue Engine",
        description: "For growing stores that want AI driving more conversions, repeat orders, and support deflection.",
        metricLabel: "Shopper conversations / month",
        conversationsPerMonth: 6000,
        aiAgent: "Advanced ecommerce AI agent",
        telephony: "Priority order + sales routing",
        features: ["Product discovery journeys", "Upsell and cross-sell guidance", "6,000 shopper sessions", "Cart recovery workflows", "Priority support"],
      },
      business: {
        name: "OmniScale Commerce",
        description: "For established brands that need high-volume AI support across sales, service, and retention.",
        metricLabel: "Shopper conversations / month",
        conversationsPerMonth: 15000,
        aiAgent: "Multi-team commerce AI suite",
        telephony: "Advanced call handling + escalation",
        features: ["High-volume shopper support", "VIP routing and escalation", "15,000 shopper sessions", "Revenue and retention flows", "White-glove onboarding"],
      },
    },
  },
  contractors: {
    label: "Contractors",
    selectorLabel: "Contractors",
    badge: "Pricing for job-booking contractor AI",
    headline: "Book more jobs without missing calls, forms, or after-hours demand.",
    description: "Reframe the same Omniweb plans around job requests, quote capture, and dispatch-ready follow-up for contractors and field-service teams.",
    plansHeading: "Plans built for lead capture, quote requests, and service booking.",
    plansDescription: "Ideal for roofers, plumbers, HVAC companies, electricians, and service teams that need AI handling the first conversation fast.",
    usageLabel: "Qualified job requests / month",
    usageSummaryLabel: "Booked job opportunities",
    highlights: [
      { title: "After-hours capture", body: "Stop sending high-intent callers to voicemail when your crew is on the road or off the clock." },
      { title: "Quote-first workflows", body: "Package each plan around estimate requests, lead qualification, and scheduling velocity." },
      { title: "Channel coverage", body: "Use the same workspace for website leads, AI calls, and follow-up handoff to your team." },
    ],
    plans: {
      starter: {
        name: "Lead Capture Crew",
        description: "For smaller field-service businesses that need every inbound lead answered and qualified.",
        metricLabel: "Qualified job requests / month",
        conversationsPerMonth: 90,
        aiAgent: "1 service intake AI agent",
        telephony: "Job-call coverage",
        features: ["Missed-call capture", "Quote request intake", "90 qualified job requests", "Knowledge sources", "Email support"],
      },
      standard: {
        name: "Job Booking Engine",
        description: "For growing contractors that want AI filling the calendar with the right jobs faster.",
        metricLabel: "Qualified job requests / month",
        conversationsPerMonth: 240,
        aiAgent: "Advanced intake and booking AI",
        telephony: "Priority dispatch routing",
        features: ["Schedule-ready lead qualification", "After-hours response", "240 qualified job requests", "Escalation logic", "Priority support"],
      },
      business: {
        name: "Service Scale Pro",
        description: "For multi-crew teams ready to automate intake, routing, and high-volume service demand.",
        metricLabel: "Qualified job requests / month",
        conversationsPerMonth: 600,
        aiAgent: "Multi-team service AI suite",
        telephony: "Advanced routing + escalation",
        features: ["Multi-location lead handling", "Priority booking workflows", "600 qualified job requests", "Operations-ready handoff", "White-glove onboarding"],
      },
    },
  },
  professionals: {
    label: "Professionals",
    selectorLabel: "Professionals",
    badge: "Pricing for consultation and intake AI",
    headline: "Turn more inquiries into booked consultations, screenings, and client follow-up.",
    description: "Use one stable pricing ladder while adapting the messaging for clinics, law firms, accounting teams, and other professional practices.",
    plansHeading: "Practice-ready plans for intake, consultation booking, and follow-up automation.",
    plansDescription: "Designed for firms and practices that want AI handling FAQs, pre-qualification, and appointment requests with polished messaging.",
    usageLabel: "Booked consultations / month",
    usageSummaryLabel: "Booked consultations",
    highlights: [
      { title: "High-trust intake", body: "Reflect the tone and workflow expectations of practices where responsiveness and professionalism matter." },
      { title: "Qualification built in", body: "Frame capacity around booked consultations and screened inquiries instead of raw message counts." },
      { title: "Single operating model", body: "Keep pricing logic fixed while tailoring the value story for each practice segment." },
    ],
    plans: {
      starter: {
        name: "Intake Assistant",
        description: "For solo and small teams that need polished intake coverage without adding front-desk overhead.",
        metricLabel: "Booked consultations / month",
        conversationsPerMonth: 70,
        aiAgent: "1 consultation AI assistant",
        telephony: "Call and inquiry intake",
        features: ["Client intake support", "FAQ and screening flows", "70 booked consultations", "Knowledge sources", "Email support"],
      },
      standard: {
        name: "Client Conversion Suite",
        description: "For growing practices that want more booked consults and faster lead follow-up.",
        metricLabel: "Booked consultations / month",
        conversationsPerMonth: 180,
        aiAgent: "Advanced intake and screening AI",
        telephony: "Priority intake routing",
        features: ["Consultation booking workflows", "Qualification questions", "180 booked consultations", "Escalation logic", "Priority support"],
      },
      business: {
        name: "Practice Growth AI",
        description: "For multi-provider practices and firms ready to automate intake at scale.",
        metricLabel: "Booked consultations / month",
        conversationsPerMonth: 420,
        aiAgent: "Multi-team practice AI suite",
        telephony: "Advanced routing + escalation",
        features: ["Multi-provider intake handling", "High-volume consultation booking", "420 booked consultations", "Priority handoff rules", "White-glove onboarding"],
      },
    },
  },
  mechanics: {
    label: "Mechanics",
    selectorLabel: "Auto repair & mechanics",
    badge: "Pricing for shop-intake AI",
    headline: "Keep bays fuller with AI that answers calls, qualifies repairs, and books service faster.",
    description: "Adapt the pricing story to service appointments, repair intake, and shop scheduling while preserving one shared SaaS billing structure.",
    plansHeading: "Plans tuned for repair intake, call handling, and service scheduling.",
    plansDescription: "A strong fit for independent shops and automotive service teams that want AI helping every driver from first question to booked visit.",
    usageLabel: "Service appointments / month",
    usageSummaryLabel: "Booked service appointments",
    highlights: [
      { title: "Front-desk relief", body: "Capture repair questions and booking demand even while the team is busy on the floor." },
      { title: "Appointment-first", body: "Display value around booked service visits, repair screening, and call coverage." },
      { title: "Consistent billing core", body: "Run one backend ladder even as the messaging changes for each auto-service segment." },
    ],
    plans: {
      starter: {
        name: "Shop Intake Starter",
        description: "For smaller shops that want AI capturing repair inquiries and basic scheduling demand.",
        metricLabel: "Service appointments / month",
        conversationsPerMonth: 80,
        aiAgent: "1 repair intake AI agent",
        telephony: "Repair-call coverage",
        features: ["Repair inquiry capture", "Basic appointment booking", "80 service appointments", "Knowledge sources", "Email support"],
      },
      standard: {
        name: "Bay Booking Engine",
        description: "For busy shops that need faster intake and fuller schedules across the week.",
        metricLabel: "Service appointments / month",
        conversationsPerMonth: 220,
        aiAgent: "Advanced service intake AI",
        telephony: "Priority service routing",
        features: ["Service qualification flows", "Parts and repair FAQs", "220 service appointments", "Escalation logic", "Priority support"],
      },
      business: {
        name: "Multi-Shop Scale",
        description: "For high-volume service businesses ready to automate intake across locations or teams.",
        metricLabel: "Service appointments / month",
        conversationsPerMonth: 500,
        aiAgent: "Multi-shop service AI suite",
        telephony: "Advanced routing + escalation",
        features: ["High-volume intake coverage", "Multi-location booking support", "500 service appointments", "Operations-ready handoff", "White-glove onboarding"],
      },
    },
  },
}

export const PRICING_INDUSTRY_OPTIONS = [
  { key: "general", label: "General AI" },
  { key: "ecommerce", label: "Shopify & ecommerce" },
  { key: "contractors", label: "Contractors" },
  { key: "professionals", label: "Professionals" },
  { key: "mechanics", label: "Auto repair" },
] as const satisfies ReadonlyArray<{ key: PricingIndustryKey; label: string }>

export function normalizeIndustry(value: string | null | undefined): PricingIndustryKey {
  const normalized = value?.trim().toLowerCase() ?? ""

  if (!normalized) {
    return "general"
  }

  if (/(shopify|ecommerce|e-commerce|storefront|online store|retail)/.test(normalized)) {
    return "ecommerce"
  }

  if (/(contractor|roof|plumb|hvac|electric|construction|landscap|remodel|home service)/.test(normalized)) {
    return "contractors"
  }

  if (/(doctor|dent|clinic|medical|law|legal|attorney|account|cpa|consult|practice|professional)/.test(normalized)) {
    return "professionals"
  }

  if (/(mechanic|automotive|auto repair|garage|collision|car repair|oil change)/.test(normalized)) {
    return "mechanics"
  }

  return "general"
}

export function getPricingContent(industry: string | null | undefined) {
  return INDUSTRY_PRICING_CONTENT[normalizeIndustry(industry)]
}

export function getBillingPlans(industry?: string | null) {
  const content = getPricingContent(industry)

  return PLAN_BLUEPRINTS.map((plan) => ({
    ...plan,
    ...content.plans[plan.key],
  }))
}

export const BILLING_PLANS = getBillingPlans()

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

export function getPlanDetails(plan: PlanType | null, industry?: string | null) {
  const normalizedPlan = normalizePlanType(plan)
  return getBillingPlans(industry).find((entry) => entry.key === normalizedPlan) ?? getBillingPlans()[0]
}

export function getDisplayPlanName(plan: PlanType | null, industry?: string | null) {
  return getPlanDetails(plan, industry).name
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
    conversationLimit: getPlanDetails(normalizedPlan, tenant?.industry).conversationsPerMonth,
  }
}