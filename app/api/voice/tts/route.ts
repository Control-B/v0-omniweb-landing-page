import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, createRateLimitResponse } from "@/lib/rate-limiter"

export const dynamic = "force-dynamic"

// Mapping of persona voices to Deepgram Aura models & ElevenLabs voice IDs
const VOICE_MAP: Record<string, { deepgram: string; elevenlabs: string }> = {
  "site-concierge": {
    deepgram: "aura-asteria-en", // Warm, natural, studio-quality female voice
    elevenlabs: "21m00Tcm4TlvDq8ikWAM", // Rachel (ElevenLabs)
  },
  "billing-investigation": {
    deepgram: "aura-orion-en", // Calm, authoritative male specialist
    elevenlabs: "JBFqnCBsd6RMkjVDRZzb", // George (ElevenLabs)
  },
  "high-ticket-closer": {
    deepgram: "aura-zeus-en", // Energetic, confident executive closer
    elevenlabs: "TxGEqnHWrfWFTfGW9XjX", // Josh (ElevenLabs)
  },
  "emergency-dispatch": {
    deepgram: "aura-luna-en", // Crisp, professional, rapid dispatch
    elevenlabs: "cgSgspJ2msm6clMCkdW9", // Jessica (ElevenLabs)
  },
}

export async function POST(req: NextRequest) {
  // 1. IP Rate Limiting (max 30 requests per minute)
  const rateLimitResult = checkRateLimit(req, {
    limit: 30,
    windowMs: 60 * 1000,
    prefix: "tts",
  })

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult)
  }

  try {
    const body = await req.json()
    const rawText = (body.text || "").trim()
    const personaId = body.personaId || "site-concierge"
    const requestedProvider = body.provider || "auto"

    if (!rawText) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // 2. Character Length Restriction (max 1000 characters per utterance to protect API quotas)
    if (rawText.length > 1000) {
      return NextResponse.json(
        { error: "Text exceeds maximum permitted length of 1000 characters" },
        { status: 400 }
      )
    }

    // Clean markdown, links, and code formatting from text
    const cleanText = rawText
      .replace(/https?:\/\/[^\s]+/g, "")
      .replace(/[\*#_`]/g, "")
      .trim()

    const deepgramKey = process.env.DEEPGRAM_API_KEY || "9802c1bd453e9c6eaf17aade9f381b0a27cf26d2"
    const elevenlabsKey = process.env.ELEVENLABS_API_KEY || ""

    const voiceConfig = VOICE_MAP[personaId] || VOICE_MAP["site-concierge"]

    // 1. If ElevenLabs is explicitly requested and key exists, use ElevenLabs
    if ((requestedProvider === "elevenlabs" || !deepgramKey) && elevenlabsKey) {
      const voiceId = voiceConfig.elevenlabs
      const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: "POST",
        headers: {
          "xi-api-key": elevenlabsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
          },
        }),
      })

      if (elRes.ok) {
        const audioBuffer = await elRes.arrayBuffer()
        return new NextResponse(audioBuffer, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=3600",
          },
        })
      }
    }

    // 2. Default to Deepgram Aura Studio TTS (Ultra-low latency < 90ms, human-realistic studio audio)
    const dgModel = voiceConfig.deepgram
    const dgRes = await fetch(`https://api.deepgram.com/v1/speak?model=${dgModel}&encoding=mp3`, {
      method: "POST",
      headers: {
        Authorization: `Token ${deepgramKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: cleanText }),
    })

    if (!dgRes.ok) {
      const errText = await dgRes.text()
      console.error("[TTS API] Deepgram Aura error:", dgRes.status, errText)
      return NextResponse.json({ error: "TTS generation failed", detail: errText }, { status: dgRes.status })
    }

    const audioBuffer = await dgRes.arrayBuffer()
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error: any) {
    console.error("[TTS API] Unexpected error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
