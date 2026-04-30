import { NextResponse } from "next/server"
import { z } from "zod"
import { createFollowUpTaskForTenant, requireCurrentTenantAnalyticsAccess } from "@/lib/saas/analytics"

export const runtime = "nodejs"

const followUpSchema = z.object({
  engagementId: z.string().uuid(),
  instruction: z.string().trim().min(8).max(3000),
  channel: z.enum(["email", "sms", "voice_call", "website_chat"]),
  timing: z.enum(["now", "later"]).default("now"),
  scheduledFor: z.string().datetime().nullable().optional(),
  internalNote: z.string().trim().max(3000).nullable().optional(),
})

export async function POST(request: Request) {
  const access = await requireCurrentTenantAnalyticsAccess()

  if (!access.ok) {
    return NextResponse.json(access.body, { status: access.status })
  }

  const body = await request.json().catch(() => null)
  const parsed = followUpSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid follow-up payload" }, { status: 400 })
  }

  const task = await createFollowUpTaskForTenant({
    tenantId: access.tenantId,
    engagementId: parsed.data.engagementId,
    instruction: parsed.data.instruction,
    channel: parsed.data.channel,
    internalNote: parsed.data.internalNote ?? null,
    scheduledFor: parsed.data.timing === "later" ? parsed.data.scheduledFor ?? null : null,
  })

  if (!task) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 })
  }

  return NextResponse.json({ task }, { status: 201 })
}
