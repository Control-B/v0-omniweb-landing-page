import { NextResponse } from "next/server"
import { requireCurrentTenantAnalyticsAccess, summarizeEngagementForTenant } from "@/lib/saas/analytics"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, context: RouteContext) {
  const access = await requireCurrentTenantAnalyticsAccess()

  if (!access.ok) {
    return NextResponse.json(access.body, { status: access.status })
  }

  const { id } = await context.params
  const engagement = await summarizeEngagementForTenant(access.tenantId, id)

  if (!engagement) {
    return NextResponse.json({ error: "Unable to summarize this engagement" }, { status: 404 })
  }

  return NextResponse.json({ engagement })
}
