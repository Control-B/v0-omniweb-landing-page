import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { getCurrentUserTenantStatus } from "@/lib/saas/status"
import { ensureDefaultTelephonyConfig, getTenantByClerkUserId, updateTelephonyConfig } from "@/lib/saas/store"

const optionalTrimmedString = z.string().trim().optional()

const telephonyConfigSchema = z.object({
  omniwebPhoneAgentId: optionalTrimmedString,
  aiPhoneNumber: optionalTrimmedString,
  escalationPhone: optionalTrimmedString,
  escalationEmail: optionalTrimmedString,
  escalationMessage: optionalTrimmedString,
})

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const tenant = await getTenantByClerkUserId(userId)
  if (!tenant || !tenant.onboardingCompleted) {
    return NextResponse.json({ error: "Complete onboarding first" }, { status: 403 })
  }

  const status = await getCurrentUserTenantStatus()
  if (!status.canAccessFeatures) {
    return NextResponse.json({ error: "Upgrade required to access AI Telephony settings" }, { status: 403 })
  }

  const config = await ensureDefaultTelephonyConfig(tenant.id)
  return NextResponse.json(config)
}

export async function PATCH(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const tenant = await getTenantByClerkUserId(userId)
  if (!tenant || !tenant.onboardingCompleted) {
    return NextResponse.json({ error: "Complete onboarding first" }, { status: 403 })
  }

  const status = await getCurrentUserTenantStatus()
  if (!status.canAccessFeatures) {
    return NextResponse.json({ error: "Upgrade required to access AI Telephony settings" }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = telephonyConfigSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid telephony config" }, { status: 400 })
  }

  const config = await updateTelephonyConfig(tenant.id, parsed.data)
  return NextResponse.json(config)
}
