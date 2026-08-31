import { NextRequest, NextResponse } from "next/server"
import { SignJWT } from "jose"
import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limiter"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const rateLimitResult = checkRateLimit(request, {
    limit: 20,
    windowMs: 60 * 1000,
    prefix: "livekit-token",
  })
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult)
  }

  try {
    const { searchParams } = new URL(request.url)
    const rawRoom = searchParams.get("room") || `omniweb-room-${Math.random().toString(36).substring(7)}`
    const rawIdentity = searchParams.get("identity") || `user-${Math.random().toString(36).substring(7)}`
    const rawName = searchParams.get("name") || "Website Visitor"

    // Sanitize parameters
    const room = rawRoom.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64)
    const identity = rawIdentity.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64)
    const name = rawName.replace(/[<>]/g, "").slice(0, 64)

    const apiKey = process.env.LIVEKIT_API_KEY || "devkey"
    const apiSecret = process.env.LIVEKIT_API_SECRET || "secret"
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL || "ws://localhost:7880"

    // Sign a LiveKit WebRTC Access JWT with 2 hour validity
    const secretKey = new TextEncoder().encode(apiSecret)
    const token = await new SignJWT({
      video: {
        room,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      },
      name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(apiKey)
      .setSubject(identity)
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secretKey)

    return NextResponse.json({
      ok: true,
      token,
      room,
      identity,
      livekit_url: livekitUrl,
      mode: apiKey === "devkey" ? "oss_development" : "production",
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to generate LiveKit token" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResult = checkRateLimit(request, {
    limit: 20,
    windowMs: 60 * 1000,
    prefix: "livekit-token",
  })
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult)
  }

  try {
    const body = await request.json().catch(() => ({}))
    const rawRoom = body.room || `omniweb-room-${Math.random().toString(36).substring(7)}`
    const rawIdentity = body.identity || `user-${Math.random().toString(36).substring(7)}`
    const rawName = body.name || "Website Visitor"

    // Sanitize parameters
    const room = String(rawRoom).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64)
    const identity = String(rawIdentity).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64)
    const name = String(rawName).replace(/[<>]/g, "").slice(0, 64)

    const apiKey = process.env.LIVEKIT_API_KEY || "devkey"
    const apiSecret = process.env.LIVEKIT_API_SECRET || "secret"
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL || "ws://localhost:7880"

    const secretKey = new TextEncoder().encode(apiSecret)
    const token = await new SignJWT({
      video: {
        room,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      },
      name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(apiKey)
      .setSubject(identity)
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secretKey)

    return NextResponse.json({
      ok: true,
      token,
      room,
      identity,
      livekit_url: livekitUrl,
      mode: apiKey === "devkey" ? "oss_development" : "production",
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to generate LiveKit token" },
      { status: 500 }
    )
  }
}
