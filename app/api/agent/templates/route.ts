import { NextRequest } from "next/server"
import { proxyAgentRequest } from "@/lib/saas/server/agentProxy"

export async function GET(request: NextRequest) {
  return proxyAgentRequest(request, "/templates")
}
