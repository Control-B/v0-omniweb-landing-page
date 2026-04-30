import { NextResponse } from "next/server"
import { getCurrentUserTenantStatus } from "@/lib/saas/status"

export async function GET() {
  const status = await getCurrentUserTenantStatus()
  return NextResponse.json(status)
}
