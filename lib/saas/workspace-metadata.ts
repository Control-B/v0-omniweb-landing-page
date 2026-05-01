import "server-only"

import { clerkClient, type User } from "@clerk/nextjs/server"
import type { TenantRecord } from "@/lib/saas/types"

const WORKSPACE_METADATA_KEY = "omniwebWorkspace"

export type WorkspaceMetadata = {
  tenantId: string
  businessName: string
  industry: string
  websiteDomain: string
  trialStartedAt: string | null
  trialEndsAt: string | null
  subscriptionStatus: TenantRecord["subscriptionStatus"]
  plan: NonNullable<TenantRecord["plan"]>
  onboardingCompleted: true
}

function getMetadataSource(user: User | null | undefined) {
  const publicMetadata = user?.publicMetadata?.[WORKSPACE_METADATA_KEY]
  if (publicMetadata && typeof publicMetadata === "object") {
    return publicMetadata as Record<string, unknown>
  }

  const unsafeMetadata = user?.unsafeMetadata?.[WORKSPACE_METADATA_KEY]
  if (unsafeMetadata && typeof unsafeMetadata === "object") {
    return unsafeMetadata as Record<string, unknown>
  }

  return null
}

export function readWorkspaceMetadata(user: User | null | undefined): WorkspaceMetadata | null {
  const metadata = getMetadataSource(user)
  if (!metadata) return null

  const tenantId = typeof metadata.tenantId === "string" ? metadata.tenantId : ""
  const businessName = typeof metadata.businessName === "string" ? metadata.businessName : ""
  const industry = typeof metadata.industry === "string" ? metadata.industry : ""
  const websiteDomain = typeof metadata.websiteDomain === "string" ? metadata.websiteDomain : ""

  if (!tenantId || !businessName || !industry || !websiteDomain) {
    return null
  }

  return {
    tenantId,
    businessName,
    industry,
    websiteDomain,
    trialStartedAt: typeof metadata.trialStartedAt === "string" ? metadata.trialStartedAt : null,
    trialEndsAt: typeof metadata.trialEndsAt === "string" ? metadata.trialEndsAt : null,
    subscriptionStatus: metadata.subscriptionStatus === "active" || metadata.subscriptionStatus === "expired" || metadata.subscriptionStatus === "canceled" ? metadata.subscriptionStatus : "trialing",
    plan: metadata.plan === "standard" || metadata.plan === "business" ? metadata.plan : "starter",
    onboardingCompleted: true,
  }
}

export async function persistWorkspaceMetadata(userId: string, tenant: TenantRecord) {
  const client = await clerkClient()
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      [WORKSPACE_METADATA_KEY]: {
        tenantId: tenant.id,
        businessName: tenant.businessName,
        industry: tenant.industry,
        websiteDomain: tenant.websiteDomain,
        trialStartedAt: tenant.trialStartedAt,
        trialEndsAt: tenant.trialEndsAt,
        subscriptionStatus: tenant.subscriptionStatus,
        plan: tenant.plan ?? "starter",
        onboardingCompleted: true,
      } satisfies WorkspaceMetadata,
    },
  })
}
