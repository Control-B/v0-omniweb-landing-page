import { NextResponse } from "next/server"
import { getDashboardSnapshot } from "@/lib/saas/status"

export async function GET() {
  const snapshot = await getDashboardSnapshot()

  if (!snapshot.status.isSignedIn) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  return NextResponse.json(snapshot)
}
