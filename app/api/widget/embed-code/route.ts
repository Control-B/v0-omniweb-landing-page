import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
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

  const embedCode = buildWidgetEmbedCode(tenant.id)
  return NextResponse.json({ tenantId: tenant.id, embedCode })
}
