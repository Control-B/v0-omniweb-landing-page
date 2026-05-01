import "server-only"

import { auth, currentUser } from "@clerk/nextjs/server"
import { getTenantBillingStatus } from "@/lib/saas/billing"
import { buildWidgetEmbedCode, ensureDefaultAgentConfig, ensureDefaultTelephonyConfig, getTenantByClerkUserId, updateTenantById, upsertTenantByClerkUserId } from "@/lib/saas/store"
import type { DashboardSnapshot, TenantStatus } from "@/lib/saas/types"
import { readWorkspaceMetadata } from "@/lib/saas/workspace-metadata"

const TRIAL_LENGTH_MS = 7 * 24 * 60 * 60 * 1000

export async function getCurrentUserTenantStatus(): Promise<TenantStatus> {
  const { userId } = await auth()

  if (!userId) {
    return {
      isSignedIn: false,
      onboardingCompleted: false,
      trialStartedAt: null,
      trialEndsAt: null,
      subscriptionStartedAt: null,
      subscriptionEndsAt: null,
      daysLeft: null,
      subscriptionStatus: null,
      canAccessDashboard: false,
      canAccessFeatures: false,
      isTrialActive: false,
      isExpired: false,
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
  let tenant = await getTenantByClerkUserId(userId)

  if (!tenant) {
    const workspaceMetadata = readWorkspaceMetadata(user)
    if (workspaceMetadata) {
      tenant = await upsertTenantByClerkUserId(userId, {
        id: workspaceMetadata.tenantId,
        businessName: workspaceMetadata.businessName,
        industry: workspaceMetadata.industry,
        websiteDomain: workspaceMetadata.websiteDomain,
        onboardingCompleted: true,
        trialStartedAt: workspaceMetadata.trialStartedAt,
        trialEndsAt: workspaceMetadata.trialEndsAt,
        subscriptionStatus: workspaceMetadata.subscriptionStatus,
        plan: workspaceMetadata.plan,
      })
    }
  }

  if (!tenant) {
    return {
      isSignedIn: true,
      onboardingCompleted: false,
      trialStartedAt: null,
      trialEndsAt: null,
      subscriptionStartedAt: null,
      subscriptionEndsAt: null,
      daysLeft: null,
      subscriptionStatus: null,
      canAccessDashboard: false,
      canAccessFeatures: false,
      isTrialActive: false,
      isExpired: false,
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

  let nextTenant = tenant
  let billingStatus = getTenantBillingStatus(nextTenant)

  if (tenant.onboardingCompleted && billingStatus.subscriptionStatus !== tenant.subscriptionStatus) {
    const updated = await updateTenantById(tenant.id, {
      subscriptionStatus: billingStatus.subscriptionStatus,
    })

    if (updated) {
      nextTenant = updated
      billingStatus = getTenantBillingStatus(nextTenant)
    }
  }

  const canAccessDashboard = nextTenant.onboardingCompleted && billingStatus.canAccessFeatures

  return {
    isSignedIn: true,
    onboardingCompleted: nextTenant.onboardingCompleted,
    trialStartedAt: nextTenant.trialStartedAt,
    trialEndsAt: nextTenant.trialEndsAt,
    subscriptionStartedAt: nextTenant.subscriptionStartedAt,
    subscriptionEndsAt: nextTenant.subscriptionEndsAt,
    daysLeft: billingStatus.daysLeft,
    subscriptionStatus: billingStatus.subscriptionStatus,
    canAccessDashboard,
    canAccessFeatures: billingStatus.canAccessFeatures,
    isTrialActive: billingStatus.isTrialActive,
    isExpired: billingStatus.isExpired,
    shouldRedirectToOnboarding: !nextTenant.onboardingCompleted,
    shouldRedirectToPricing: nextTenant.onboardingCompleted && billingStatus.isExpired,
    plan: billingStatus.plan,
    tenantId: nextTenant.id,
    businessName: nextTenant.businessName,
    industry: nextTenant.industry,
    websiteDomain: nextTenant.websiteDomain,
    clerkUserId: nextTenant.clerkUserId,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    firstName: user?.firstName ?? user?.username ?? null,
  }
}

export function getSignedInAppRedirect(status: TenantStatus) {
  if (!status.isSignedIn) return "/signin"
  if (status.shouldRedirectToOnboarding) return "/onboarding"
  if (status.shouldRedirectToPricing) return "/pricing"
  return "/dashboard"
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const status = await getCurrentUserTenantStatus()

  if (!status.isSignedIn || !status.tenantId || !status.clerkUserId) {
    return {
      status,
      tenant: null,
      billingStatus: null,
      agentConfig: null,
      telephonyConfig: null,
      widgetEmbedCode: null,
    }
  }

  const tenant = await getTenantByClerkUserId(status.clerkUserId)
  const billingStatus = getTenantBillingStatus(tenant)
  const agentConfig = tenant ? await ensureDefaultAgentConfig(tenant.id) : null
  const telephonyConfig = tenant ? await ensureDefaultTelephonyConfig(tenant.id) : null

  return {
    status,
    tenant,
    billingStatus,
    agentConfig,
    telephonyConfig,
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
