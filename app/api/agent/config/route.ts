import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import { ensureDefaultAgentConfig, getTenantByClerkUserId, updateAgentConfig } from "@/lib/saas/store"

const agentConfigSchema = z.object({
  agentName: z.string().trim().min(2).optional(),
  welcomeMessage: z.string().trim().min(10).optional(),
  tone: z.literal("professional").optional(),
  goals: z.array(z.string().trim().min(1)).min(1).optional(),
  active: z.boolean().optional(),
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

  const config = await ensureDefaultAgentConfig(tenant.id)
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

  const body = await request.json().catch(() => null)
  const parsed = agentConfigSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid agent config" }, { status: 400 })
  }

  const config = await updateAgentConfig(tenant.id, parsed.data)
  return NextResponse.json(config)
}
