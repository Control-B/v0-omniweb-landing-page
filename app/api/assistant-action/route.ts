import { NextRequest, NextResponse } from "next/server"
import { buildAssistantFallback } from "@/lib/assistant-navigation"
import { getOrchestratorBaseUrl } from "@/lib/platform/config"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const assistantBaseUrl = getOrchestratorBaseUrl()
  const body = await req.json().catch(() => ({}))

  try {
    const response = await fetch(`${assistantBaseUrl}/assistant/automate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json(buildAssistantFallback(body.message ?? ""))
    }

    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json(buildAssistantFallback(body.message ?? ""))
  }
}
