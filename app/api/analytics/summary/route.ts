import { NextRequest, NextResponse } from "next/server"
import { getAnalyticsSummaryForTenant, parseAnalyticsFilters, requireCurrentTenantAnalyticsAccess } from "@/lib/saas/analytics"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const access = await requireCurrentTenantAnalyticsAccess()

  if (!access.ok) {
    return NextResponse.json(access.body, { status: access.status })
  }

  const filters = parseAnalyticsFilters(request.nextUrl.searchParams)
  const summary = await getAnalyticsSummaryForTenant(access.tenantId, filters, {
    websiteDomain: access.status.websiteDomain,
    businessName: access.status.businessName,
  })

  return NextResponse.json(summary)
}
