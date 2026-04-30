import { NextRequest } from "next/server"
import { proxyAgentRequest } from "@/lib/saas/server/agentProxy"

export async function POST(request: NextRequest) {
  return proxyAgentRequest(request, "/build-prompt")
}
