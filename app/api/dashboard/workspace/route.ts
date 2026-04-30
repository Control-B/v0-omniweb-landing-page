import { NextResponse } from "next/server"
import { z } from "zod"
import { requireDashboardAccess } from "@/lib/saas/guards"
import { updateTenantById } from "@/lib/saas/store"

const workspaceUpdateSchema = z.object({
  businessName: z.string().trim().min(2, "Business name is required").max(120),
  industry: z.string().trim().min(2, "Industry is required").max(120),
  websiteDomain: z.string().trim().min(3, "Website domain is required").max(255),
})

export async function PATCH(request: Request) {
  const status = await requireDashboardAccess({ allowExpiredBilling: true })

  if (!status.tenantId) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const parsed = workspaceUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid workspace update" }, { status: 400 })
  }

  const tenant = await updateTenantById(status.tenantId, {
    businessName: parsed.data.businessName,
    industry: parsed.data.industry,
    websiteDomain: parsed.data.websiteDomain,
  })

  if (!tenant) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
  }

  return NextResponse.json({ tenant })
}