import { NextRequest, NextResponse } from "next/server"
import { getOrchestratorBaseUrl } from "@/lib/platform/config"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const assistantBaseUrl = getOrchestratorBaseUrl()

  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 })
    }

    const response = await fetch(`${assistantBaseUrl}/assistant/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, mode: "text" }),
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json(
        { error: payload.detail ?? payload.error ?? "Assistant request failed" },
        { status: response.status }
      )
    }

    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Assistant request failed" },
      { status: 500 }
    )
  }
}
