import "server-only"

import { auth, currentUser } from "@clerk/nextjs/server"
import { buildWidgetEmbedCode, ensureDefaultAgentConfig, getTenantByClerkUserId, updateTenantSubscriptionStatus } from "@/lib/saas/store"
import type { DashboardSnapshot, TenantStatus } from "@/lib/saas/types"

const TRIAL_LENGTH_MS = 7 * 24 * 60 * 60 * 1000

function getDaysLeft(trialEndsAt: string | null) {
  if (!trialEndsAt) return null
  const diff = new Date(trialEndsAt).getTime() - Date.now()
  if (diff <= 0) return 0
  return Math.max(1, Math.ceil(diff / (24 * 60 * 60 * 1000)))
}

export async function getCurrentUserTenantStatus(): Promise<TenantStatus> {
  const { userId } = await auth()

  if (!userId) {
    return {
      isSignedIn: false,
      onboardingCompleted: false,
      trialStartedAt: null,
      trialEndsAt: null,
      daysLeft: null,
      subscriptionStatus: null,
      canAccessDashboard: false,
      shouldRedirectToOnboarding: false,
      shouldRedirectToPricing: false,
      plan: null,
      tenantId: null,
      businessName: null,
      industry: null,
      websiteDomain: null,
      clerkUserId: null,
      email: null,
      firstName: null,
    }
  }

  const user = await currentUser()
  const tenant = await getTenantByClerkUserId(userId)

  if (!tenant) {
    return {
      isSignedIn: true,
      onboardingCompleted: false,
      trialStartedAt: null,
      trialEndsAt: null,
      daysLeft: null,
      subscriptionStatus: null,
      canAccessDashboard: false,
      shouldRedirectToOnboarding: true,
      shouldRedirectToPricing: false,
      plan: "starter",
      tenantId: null,
      businessName: null,
      industry: null,
      websiteDomain: null,
      clerkUserId: userId,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
      firstName: user?.firstName ?? user?.username ?? null,
    }
  }

  let subscriptionStatus = tenant.subscriptionStatus
  if (
    tenant.onboardingCompleted
    && tenant.trialEndsAt
    && new Date(tenant.trialEndsAt).getTime() < Date.now()
    && subscriptionStatus !== "active"
    && subscriptionStatus !== "expired"
  ) {
    const updated = await updateTenantSubscriptionStatus(userId, "expired")
    subscriptionStatus = updated?.subscriptionStatus ?? "expired"
  }

  const daysLeft = getDaysLeft(tenant.trialEndsAt)
  const canAccessDashboard = tenant.onboardingCompleted && (
    subscriptionStatus === "active"
    || (subscriptionStatus === "trialing" && (daysLeft === null || daysLeft > 0))
  )

  return {
    isSignedIn: true,
    onboardingCompleted: tenant.onboardingCompleted,
    trialStartedAt: tenant.trialStartedAt,
    trialEndsAt: tenant.trialEndsAt,
    daysLeft,
    subscriptionStatus,
    canAccessDashboard,
    shouldRedirectToOnboarding: !tenant.onboardingCompleted,
    shouldRedirectToPricing: tenant.onboardingCompleted && !canAccessDashboard,
    plan: tenant.plan,
    tenantId: tenant.id,
    businessName: tenant.businessName,
    industry: tenant.industry,
    websiteDomain: tenant.websiteDomain,
    clerkUserId: tenant.clerkUserId,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    firstName: user?.firstName ?? user?.username ?? null,
  }
}

export function getSignedInAppRedirect(status: TenantStatus) {
  if (!status.isSignedIn) return "/signin"
  if (status.shouldRedirectToOnboarding) return "/onboarding"
  if (status.shouldRedirectToPricing) return "/trial-expired"
  return "/dashboard"
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const status = await getCurrentUserTenantStatus()

  if (!status.isSignedIn || !status.tenantId || !status.clerkUserId) {
    return {
      status,
      tenant: null,
      agentConfig: null,
      widgetEmbedCode: null,
    }
  }

  const tenant = await getTenantByClerkUserId(status.clerkUserId)
  const agentConfig = tenant ? await ensureDefaultAgentConfig(tenant.id) : null

  return {
    status,
    tenant,
    agentConfig,
    widgetEmbedCode: tenant ? buildWidgetEmbedCode(tenant.id) : null,
  }
}

export function getTrialWindow() {
  const start = new Date()
  const end = new Date(start.getTime() + TRIAL_LENGTH_MS)
  return {
    trialStartedAt: start.toISOString(),
    trialEndsAt: end.toISOString(),
  }
}
