import { NextRequest } from "next/server"
import { proxyEngineRequest } from "@/lib/saas/server/engineProxy"

export async function PATCH(request: NextRequest) {
  return proxyEngineRequest(request, "/api/telephony/retell/config")
}
