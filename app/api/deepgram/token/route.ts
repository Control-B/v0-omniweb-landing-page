import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limiter"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const rateLimitResult = checkRateLimit(request, {
    limit: 20,
    windowMs: 60 * 1000,
    prefix: "deepgram-token",
  })
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult)
  }

  return handleDeepgramToken()
}

export async function POST(request: NextRequest) {
  const rateLimitResult = checkRateLimit(request, {
    limit: 20,
    windowMs: 60 * 1000,
    prefix: "deepgram-token",
  })
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult)
  }

  return handleDeepgramToken()
}

async function handleDeepgramToken() {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY || ""

  if (!deepgramApiKey) {
    return NextResponse.json({
      ok: true,
      has_key: false,
      model: "nova-3",
      sample_rate: 16000,
      fallback_to_web_speech: true,
      message: "Deepgram API key not set in environment; falling back to Web Speech recognition",
    })
  }

  try {
    // Request a temporary scoped token from Deepgram API (TTL: 600s)
    const response = await fetch("https://api.deepgram.com/v1/auth/grant", {
      method: "POST",
      headers: {
        Authorization: `Token ${deepgramApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl_seconds: 600 }),
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        ok: true,
        has_key: true,
        access_token: data.access_token || deepgramApiKey,
        expires_in: data.expires_in || 600,
        model: "nova-3",
        sample_rate: 16000,
        websocket_url: "wss://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&interim_results=true",
      })
    }

    // Direct key fallback if grant fails
    return NextResponse.json({
      ok: true,
      has_key: true,
      access_token: deepgramApiKey,
      model: "nova-3",
      sample_rate: 16000,
      websocket_url: "wss://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&interim_results=true",
    })
  } catch (error: any) {
    return NextResponse.json({
      ok: true,
      has_key: Boolean(deepgramApiKey),
      access_token: deepgramApiKey || null,
      fallback_to_web_speech: !deepgramApiKey,
      model: "nova-3",
      error: error?.message,
    })
  }
}
