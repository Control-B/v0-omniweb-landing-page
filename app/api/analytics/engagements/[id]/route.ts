import { NextResponse } from "next/server"
import { z } from "zod"
import { getEngagementDetailForTenant, requireCurrentTenantAnalyticsAccess, updateEngagementForTenant } from "@/lib/saas/analytics"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{ id: string }>
}

const engagementPatchSchema = z.object({
  leadStatus: z.enum(["new", "qualified", "needs_follow_up", "not_qualified", "resolved"]).optional(),
  followUpNeeded: z.boolean().optional(),
  ownerNotes: z.string().trim().max(5000).nullable().optional(),
  resolved: z.boolean().optional(),
})

export async function GET(_request: Request, context: RouteContext) {
  const access = await requireCurrentTenantAnalyticsAccess()

  if (!access.ok) {
    return NextResponse.json(access.body, { status: access.status })
  }

  const { id } = await context.params
  const detail = await getEngagementDetailForTenant(access.tenantId, id)

  if (!detail) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 })
  }

  return NextResponse.json(detail)
}

export async function PATCH(request: Request, context: RouteContext) {
  const access = await requireCurrentTenantAnalyticsAccess()

  if (!access.ok) {
    return NextResponse.json(access.body, { status: access.status })
  }

  const body = await request.json().catch(() => null)
  const parsed = engagementPatchSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid analytics update" }, { status: 400 })
  }

  const { id } = await context.params
  const updates: Parameters<typeof updateEngagementForTenant>[2] = {}

  if (parsed.data.leadStatus !== undefined) {
    updates.leadStatus = parsed.data.leadStatus
    if (parsed.data.leadStatus === "qualified") {
      updates.qualified = true
    }
    if (parsed.data.leadStatus === "not_qualified") {
      updates.qualified = false
    }
    if (parsed.data.leadStatus === "resolved" && parsed.data.followUpNeeded === undefined) {
      updates.followUpNeeded = false
    }
  }

  if (parsed.data.followUpNeeded !== undefined) {
    updates.followUpNeeded = parsed.data.followUpNeeded
  }

  if (parsed.data.ownerNotes !== undefined) {
    updates.ownerNotes = parsed.data.ownerNotes
  }

  if (parsed.data.resolved) {
    updates.leadStatus = "resolved"
    updates.followUpNeeded = false
  }

  const engagement = await updateEngagementForTenant(access.tenantId, id, updates)

  if (!engagement) {
    return NextResponse.json({ error: "Engagement not found" }, { status: 404 })
  }

  return NextResponse.json({ engagement })
}
