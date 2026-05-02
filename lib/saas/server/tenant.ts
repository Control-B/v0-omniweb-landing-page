import "server-only"

import { currentUser } from "@clerk/nextjs/server"
import { getTenantByClerkUserId, upsertTenantByClerkUserId } from "@/lib/saas/store"
import type { TenantRecord } from "@/lib/saas/types"
import { readWorkspaceMetadata } from "@/lib/saas/workspace-metadata"

export async function getOrRestoreTenantByClerkUserId(clerkUserId: string): Promise<TenantRecord | null> {
  const existing = await getTenantByClerkUserId(clerkUserId)
  if (existing) {
    return existing
  }

  const user = await currentUser()
  const metadata = readWorkspaceMetadata(user)
  if (!metadata) {
    return null
  }

  return upsertTenantByClerkUserId(clerkUserId, {
    id: metadata.tenantId,
    businessName: metadata.businessName,
    industry: metadata.industry,
    websiteDomain: metadata.websiteDomain,
    onboardingCompleted: true,
    trialStartedAt: metadata.trialStartedAt,
    trialEndsAt: metadata.trialEndsAt,
    subscriptionStatus: metadata.subscriptionStatus,
    plan: metadata.plan,
  })
}
