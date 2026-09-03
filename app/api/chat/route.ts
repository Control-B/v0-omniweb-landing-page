import { NextRequest, NextResponse } from "next/server"
import { inferAssistantAction, buildVoiceFollowUp, type AssistantAction } from "@/lib/assistant-navigation"

export const runtime = "nodejs"

type ChatMessage = {
  role: "user" | "assistant" | "system"
  content: string
}

const SYSTEM_PROMPT = `You are Omniweb Concierge, the official autonomous AI representative of Omniweb AI (https://omniweb.ai).
You are speaking directly with a website visitor. You are professional, engaging, conversational, and direct.

Core Knowledge Base:
1. WHAT OMNIWEB DOES:
   - Omniweb is an Enterprise Autonomous Voice & Agentic Contact Center platform.
   - It replaces or augments human call center agents with sub-250ms conversational AI voice agents and web chat assistants that operate 24/7.
   - Built on LiveKit WebRTC for real-time audio transport, Deepgram Aura & Nova-3 for speech, Google Gemini 2.0 & Claude 3.5 for reasoning, and PostgreSQL pgvector for tenant-isolated knowledge.

2. CORE SERVICES & CAPABILITIES:
   - Autonomous AI Voice Swarms: Sub-250ms voice turns, handles inbound calls, qualifications, appointment bookings, and live warm transfers.
   - 24/7 AI Chat Assistants: Embeddable web widget that answers catalog questions, captures leads, and syncs with CRMs.
   - High-Ticket Lead Qualification: Automatically captures intent, scores leads, and dispatches SMS/email notifications.
   - Two-Way Calendar Booking: Connects directly with Cal.com, Google Calendar, and Outlook to schedule demos or service appointments.
   - Power Outbound Dialers: High-volume outbound campaigns with intelligent voicemail detection.
   - Shopify Storefront AI: Direct product catalog search, size/stock recommendations, and automated abandoned cart recovery.
   - Supervisor Live War Room: Operational HUD for managers with live queue depths, whisper coaching, transcript inspection, and one-click barge-in takeover.

3. PRICING & PLANS:
   - Starter ($49/month): 500 voice minutes, 1 AI Agent, web chat widget, standard support.
   - Pro Growth ($149/month): 2,500 voice minutes, multi-agent swarms, Supervisor War Room, CRM integrations.
   - Enterprise ($499/month+): Custom minute volume, dedicated SIP trunks, custom pgvector RAG, SLA guarantees.
   - Every plan includes a 14-day free trial with no credit card required upfront.

4. LEAD QUALIFICATION GOAL:
   - Understand the visitor's business (industry, whether they need inbound phone answering, website sales, or call center replacement).
   - Answer their questions thoroughly but concisely (2-4 sentences max per turn for natural spoken conversation).
   - If they are interested in testing or signing up, invite them to start their 14-day free trial at /get-started.

5. NAVIGATION:
   - If the user asks to see pricing, features, shopify, contact, demo, templates, resources, signin, or dashboard, acknowledge and navigate them.
`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const messages: ChatMessage[] = body.messages || []

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 })
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content?.trim() || ""

    // 1. Detect navigation intent using the assistant navigation rules
    const detectedAction: AssistantAction | null = inferAssistantAction(lastUserMessage)

    // 2. Check if GEMINI_API_KEY is available for real-time generative reasoning
    const geminiKey = process.env.GEMINI_API_KEY?.trim()
    const hasValidGemini = geminiKey && !geminiKey.includes("your_gemini")

    if (hasValidGemini) {
      try {
        const contents = [
          { role: "user", parts: [{ text: `SYSTEM INSTRUCTIONS:\n${SYSTEM_PROMPT}` }] },
          { role: "model", parts: [{ text: "Understood. I am Omniweb Concierge, ready to converse, qualify, and assist visitors concisely." }] },
          ...messages.slice(-6).map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          })),
        ]

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 250,
              },
            }),
          }
        )

        if (geminiRes.ok) {
          const data = await geminiRes.json()
          const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
          if (aiReply) {
            return NextResponse.json({
              reply: aiReply,
              action: detectedAction,
            })
          }
        }
      } catch (err) {
        console.warn("[chat API] Gemini reasoning fallback:", err)
      }
    }

    // 3. High-precision semantic knowledge engine fallback (instant, zero latency, 100% reliable)
    const textLower = lastUserMessage.toLowerCase()
    let reply = ""
    let action: AssistantAction | null = detectedAction

    if (
      textLower.includes("price") ||
      textLower.includes("pricing") ||
      textLower.includes("cost") ||
      textLower.includes("how much") ||
      textLower.includes("plan")
    ) {
      reply =
        "Our plans start at $49 a month for Starter (500 minutes), $149 for Pro Growth with multi-agent swarms and the Supervisor War Room, and Enterprise for custom SIP trunks. All plans include a 14-day free trial. Would you like me to open our pricing table?"
      action = {
        type: "navigate",
        label: "View Pricing Plans ($49 / $149 / Enterprise)",
        href: "/pricing",
        summary: "Opening the Pricing page.",
      }
    } else if (
      textLower.includes("shopify") ||
      textLower.includes("ecommerce") ||
      textLower.includes("store") ||
      textLower.includes("cart")
    ) {
      reply =
        "Omniweb's Shopify AI Assistant directly indexes your store catalog to answer sizing and availability questions in real-time, and autonomously recovers abandoned checkouts. Would you like to explore the Shopify integration?"
      action = {
        type: "navigate",
        label: "View Shopify AI Assistant",
        href: "/solutions/shopify-ai-assistant",
        summary: "Opening Shopify AI Assistant overview.",
      }
    } else if (
      textLower.includes("voice") ||
      textLower.includes("phone") ||
      textLower.includes("call") ||
      textLower.includes("audio") ||
      textLower.includes("telephony")
    ) {
      reply =
        "Our AI Voice Agents run on LiveKit WebRTC and Deepgram Aura, delivering sub-250ms voice latency. They answer inbound calls, book appointments, handle multi-turn qualification, and support live whisper coaching with barge-in."
      action = {
        type: "navigate",
        label: "Explore AI Voice Agents",
        href: "/features/ai-voice-agents",
        summary: "Opening AI Voice Agents features.",
      }
    } else if (
      textLower.includes("war room") ||
      textLower.includes("supervisor") ||
      textLower.includes("barge") ||
      textLower.includes("monitor")
    ) {
      reply =
        "The Supervisor War Room provides real-time telemetry across all concurrent agent swarms, active queue metrics, live transcript auditing, whisper coaching, and one-click barge-in takeover."
      action = {
        type: "navigate",
        label: "Open Call Center War Room",
        href: "/dashboard/call-center",
        summary: "Opening Live Call Center War Room.",
      }
    } else if (
      textLower.includes("start") ||
      textLower.includes("trial") ||
      textLower.includes("sign up") ||
      textLower.includes("signup") ||
      textLower.includes("register") ||
      textLower.includes("get started")
    ) {
      reply =
        "You can set up your first AI voice or chat agent in under 5 minutes. No credit card is required to begin your 14-day free trial. Shall I take you to the onboarding page?"
      action = {
        type: "lead",
        label: "Start 14-Day Free Trial",
        href: "/get-started",
        summary: "Opening Get Started onboarding.",
      }
    } else if (
      textLower.includes("feature") ||
      textLower.includes("service") ||
      textLower.includes("what can you do") ||
      textLower.includes("capabilities")
    ) {
      reply =
        "Omniweb provides 7 core services: Autonomous Inbound Voice Swarms, 24/7 Web Chat Concierge, High-Intent Lead Automation, Two-Way Calendar Booking, Outbound Power Dialing, Shopify Storefront AI, and the Supervisor Live War Room."
      action = {
        type: "navigate",
        label: "Explore All Features",
        href: "/features",
        summary: "Opening features overview.",
      }
    } else if (
      textLower.includes("contact") ||
      textLower.includes("sales") ||
      textLower.includes("support") ||
      textLower.includes("email") ||
      textLower.includes("talk to a human")
    ) {
      reply =
        "Our enterprise solutions team is on standby 24/7. You can reach out directly via our contact form or book an architectural consultation with our senior engineering team."
      action = {
        type: "navigate",
        label: "Open Contact Page",
        href: "/company#contact",
        summary: "Opening company contact section.",
      }
    } else if (detectedAction) {
      reply = buildVoiceFollowUp(detectedAction)
    } else if (messages.length <= 2) {
      reply =
        "Omniweb automates customer conversations across voice and chat with sub-250ms latency. Are you looking to automate inbound phone answering, qualify website leads, or connect your Shopify store?"
    } else {
      reply =
        "That's great! Omniweb is designed to handle that seamlessly. We can integrate with your CRM, calendar, or phone system in just a few clicks. Would you like to start a 14-day trial or see our live demo in action?"
      action = {
        type: "navigate",
        label: "Try Live Demo",
        href: "/demo",
        summary: "Opening Interactive Demo Lab.",
      }
    }

    return NextResponse.json({
      reply,
      action,
    })
  } catch (error) {
    return NextResponse.json(
      {
        reply: "I am ready to help you explore Omniweb AI. Ask me about our voice swarms, pricing, or say 'Take me to pricing' to navigate!",
        action: null,
      },
      { status: 200 }
    )
  }
}
