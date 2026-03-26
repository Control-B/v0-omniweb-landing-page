import { NextResponse } from "next/server"

export const runtime = "nodejs"

// Returns a browser-usable Deepgram credential for the Voice Agent websocket.
// Preferred: temporary JWT token. Fallback: direct API key for local/dev use.
export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY

  if (!apiKey || apiKey === "paste_your_deepgram_api_key_here") {
    return NextResponse.json(
      { error: "DEEPGRAM_API_KEY is not set in .env.local" },
      { status: 500 }
    )
  }

  try {
    const grantResponse = await fetch("https://api.deepgram.com/v1/auth/grant", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl_seconds: 60 }),
    })

    if (grantResponse.ok) {
      const data = await grantResponse.json()
      return NextResponse.json({
        credential: data.access_token,
        scheme: "bearer",
        expiresIn: data.expires_in,
      })
    }

    const errorText = await grantResponse.text()

    return NextResponse.json({
      credential: apiKey,
      scheme: "token",
      warning: `Falling back to direct API key auth because temporary token grant failed: ${grantResponse.status} ${errorText}`,
    })
  } catch (error) {
    return NextResponse.json({
      credential: apiKey,
      scheme: "token",
      warning: error instanceof Error ? error.message : "Temporary token grant failed",
    })
  }
}
