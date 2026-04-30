import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { activateTenantSubscription, getTenantByClerkUserId } from "@/lib/saas/store"

const upgradeSchema = z.object({
  plan: z.enum(["starter", "standard", "business"]),
})

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Authentication required", redirectTo: "/sign-up" }, { status: 401 })
  }

  const tenant = await getTenantByClerkUserId(userId)

  if (!tenant || !tenant.onboardingCompleted) {
    return NextResponse.json({ error: "Complete onboarding first", redirectTo: "/onboarding" }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = upgradeSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid plan selection" }, { status: 400 })
  }

  const updatedTenant = await activateTenantSubscription(tenant.id, parsed.data.plan)

  if (!updatedTenant) {
    return NextResponse.json({ error: "Unable to update subscription" }, { status: 500 })
  }

  return NextResponse.json({ tenant: updatedTenant, redirectTo: "/dashboard/billing" })
}
