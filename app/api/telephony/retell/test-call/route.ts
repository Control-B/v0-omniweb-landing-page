import { NextRequest } from "next/server"
import { proxyEngineRequest } from "@/lib/saas/server/engineProxy"

export async function POST(request: NextRequest) {
  return proxyEngineRequest(request, "/api/telephony/retell/test-call")
}
