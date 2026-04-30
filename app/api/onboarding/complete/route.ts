import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { normalizeWebsiteDomain } from "@/lib/saas/domain"
import { getTrialWindow } from "@/lib/saas/status"
import { ensureDefaultAgentConfig, upsertTenantByClerkUserId } from "@/lib/saas/store"

const onboardingSchema = z.object({
  businessName: z.string().trim().min(2, "Business name is required"),
  industry: z.string().trim().min(2, "Business industry is required"),
  websiteDomain: z.string().trim().min(3, "Website domain is required"),
})

export async function POST(request: Request) {
  const { userId, orgId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = onboardingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid onboarding data" }, { status: 400 })
  }

  let websiteDomain = ""
  try {
    websiteDomain = normalizeWebsiteDomain(parsed.data.websiteDomain)
  } catch {
    return NextResponse.json({ error: "Enter a valid website domain" }, { status: 400 })
  }

  const trialWindow = getTrialWindow()
  const user = await currentUser()

  const tenant = await upsertTenantByClerkUserId(userId, {
    clerkOrgId: orgId,
    businessName: parsed.data.businessName,
    industry: parsed.data.industry,
    websiteDomain,
    onboardingCompleted: true,
    trialStartedAt: trialWindow.trialStartedAt,
    trialEndsAt: trialWindow.trialEndsAt,
    subscriptionStatus: "trialing",
    plan: "starter",
  })

  const agentConfig = await ensureDefaultAgentConfig(tenant.id)

  return NextResponse.json({
    tenant,
    agentConfig,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
  })
}
