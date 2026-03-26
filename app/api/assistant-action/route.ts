import { NextRequest, NextResponse } from "next/server"
import { buildAssistantFallback } from "@/lib/assistant-navigation"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const assistantBaseUrl = process.env.FASTAPI_ASSISTANT_URL ?? "http://127.0.0.1:8000"
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
