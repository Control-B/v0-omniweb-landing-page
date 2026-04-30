import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getCurrentUserTenantStatus } from "@/lib/saas/status"
import { buildWidgetEmbedCode, getTenantByClerkUserId } from "@/lib/saas/store"

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
    return NextResponse.json({ error: "Upgrade required to access widget installation" }, { status: 403 })
  }

  const embedCode = buildWidgetEmbedCode(tenant.id)
  return NextResponse.json({ tenantId: tenant.id, embedCode })
}
