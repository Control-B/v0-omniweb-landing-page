export type SubscriptionStatus = "trialing" | "active" | "expired" | "canceled"
export type PlanType = "starter" | "pro" | "business" | null

export type TenantRecord = {
  id: string
  clerkUserId: string
  clerkOrgId?: string | null
  businessName: string
  industry: string
  websiteDomain: string
  trialStartedAt: string | null
  trialEndsAt: string | null
  subscriptionStatus: SubscriptionStatus
  plan: PlanType
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
}

export type AgentTone = "professional"

export type AgentConfigRecord = {
  tenantId: string
  agentName: string
  welcomeMessage: string
  tone: AgentTone
  goals: string[]
  supportedLanguages: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export type TenantStatus = {
  isSignedIn: boolean
  onboardingCompleted: boolean
  trialStartedAt: string | null
  trialEndsAt: string | null
  daysLeft: number | null
  subscriptionStatus: SubscriptionStatus | null
  canAccessDashboard: boolean
  shouldRedirectToOnboarding: boolean
  shouldRedirectToPricing: boolean
  plan: PlanType
  tenantId: string | null
  businessName: string | null
  industry: string | null
  websiteDomain: string | null
  clerkUserId: string | null
  email: string | null
  firstName: string | null
}

export type DashboardSnapshot = {
  status: TenantStatus
  tenant: TenantRecord | null
  agentConfig: AgentConfigRecord | null
  widgetEmbedCode: string | null
}
