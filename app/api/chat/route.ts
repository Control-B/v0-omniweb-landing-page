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
   - Built on LiveKit WebRTC for real-time audio transport, Deepgram Aura-2 & Nova-3 for speech, Google Gemini 2.0 Flash & Claude 3.5 Sonnet for reasoning, and PostgreSQL pgvector for tenant-isolated knowledge.

2. CONVERSATIONAL TURN-TAKING & INTERRUPTION (BARGE-IN):
   - Barge-in Interruption: Callers can speak at any millisecond while the agent is speaking. Client-side VAD (Voice Activity Detection) and Web Audio cancellation cut off agent playback in under 50ms, aborting model generation instantly.
   - Conversational Turn-Taking: Full-duplex natural dialogue. When the AI finishes speaking, the microphone automatically reopens for the caller's turn without needing push-to-talk buttons.

3. CORE SERVICES & CAPABILITIES:
   - Autonomous AI Voice Swarms: Sub-250ms voice turns, handles inbound calls, qualifications, appointment bookings, and live warm transfers across 1 to 10,000 concurrent lines.
   - 24/7 AI Chat Assistants: Embeddable web widget that answers catalog questions, captures leads, and syncs with CRMs.
   - Two-Way Calendar Booking: Connects directly with Cal.com, Google Calendar, and Outlook to schedule demos or service appointments live on the call.
   - Power Outbound Dialers: High-volume outbound campaigns with intelligent answering machine detection (AMD).
   - Shopify Storefront AI: Direct product catalog search, size/stock recommendations, and automated abandoned cart recovery.
   - Supervisor Live War Room: Operational HUD for managers with live queue depths, whisper coaching, transcript auditing, and one-click barge-in takeover.

4. PRICING & PLANS:
   - Starter ($49/month): 500 voice minutes, 1 AI Agent, web chat widget, standard support.
   - Pro Growth ($149/month): 2,500 voice minutes, multi-agent swarms, Supervisor War Room, CRM integrations, $0.08/min overage.
   - Enterprise ($499/month+): Custom minute volume, dedicated SIP trunks, custom pgvector RAG, SLA guarantees.
   - Every plan includes a 14-day free trial with no credit card required upfront.

5. LEAD QUALIFICATION GOAL:
   - Answer visitor questions concisely (2-4 sentences max per turn for natural spoken conversation).
   - If they are interested in testing or signing up, invite them to start their 14-day free trial at /get-started.
`

// Comprehensive semantic knowledge engine for instant, zero-latency conversational Q&A
function querySemanticKnowledge(
  userQuery: string,
  history: ChatMessage[],
  detectedAction: AssistantAction | null
): { reply: string; action: AssistantAction | null } {
  const query = userQuery.toLowerCase().trim()
  const lastAssistantMsg = [...history].reverse().find((m) => m.role === "assistant")?.content?.toLowerCase() || ""

  // 1. Interruption / Barge-in
  if (
    query.includes("interrupt") ||
    query.includes("barge") ||
    query.includes("cut off") ||
    query.includes("cut you off") ||
    query.includes("stop speaking") ||
    query.includes("stop talking") ||
    query.includes("talk over")
  ) {
    return {
      reply:
        "Yes! Omniweb supports sub-50 millisecond barge-in interruption. You can interrupt me at any moment by speaking, tapping the mic, or typing. My audio cuts off immediately, in-flight responses are canceled, and I instantly yield the floor to listen to you.",
      action: {
        type: "navigate",
        label: "Explore Voice Swarms & Interruption",
        href: "/features/ai-voice-agents",
        summary: "Viewing voice architecture and low-latency barge-in features.",
      },
    }
  }

  // 2. Turn-taking / Conversational flow
  if (
    query.includes("turn") ||
    query.includes("take turn") ||
    query.includes("taking turn") ||
    query.includes("conversational") ||
    query.includes("hands free") ||
    query.includes("push to talk") ||
    query.includes("natural conversation") ||
    query.includes("full duplex")
  ) {
    return {
      reply:
        "Omniweb features full-duplex conversational turn-taking. When I finish speaking, your microphone automatically reopens for your turn—no need to keep pressing buttons. And whenever you want to jump in, you can interrupt me without waiting.",
      action: {
        type: "navigate",
        label: "Test Live Voice Demo",
        href: "/demo",
        summary: "Opening interactive voice test lab.",
      },
    }
  }

  // 3. Latency, Speed & Technical Architecture
  if (
    query.includes("latency") ||
    query.includes("how fast") ||
    query.includes("delay") ||
    query.includes("lag") ||
    query.includes("response time") ||
    query.includes("speed") ||
    query.includes("architecture") ||
    query.includes("tech stack") ||
    query.includes("livekit") ||
    query.includes("deepgram") ||
    query.includes("webrtc")
  ) {
    return {
      reply:
        "Omniweb delivers sub-250ms end-to-end voice latency. Our pipeline runs on LiveKit WebRTC for real-time audio transport, Deepgram Aura-2 and Nova-3 for speech synthesis and recognition, and Gemini 2.0 Flash for sub-second agent reasoning.",
      action: {
        type: "navigate",
        label: "View Architecture & Features",
        href: "/features",
        summary: "Opening technical architecture overview.",
      },
    }
  }

  // 4. Pricing / Cost / Plans / Subscriptions
  if (
    /\b(price|pricing|cost|costs|how much|plans?|packages?|tiers?|starter|pro|growth|enterprise|rates?|billing)\b/i.test(
      query
    )
  ) {
    if (/\b(starter|49)\b/i.test(query)) {
      return {
        reply:
          "The Starter plan is $49 a month and includes 500 voice minutes, 1 dedicated AI voice and chat agent, web widget embed, and standard support. It's ideal for solo founders and local businesses.",
        action: {
          type: "navigate",
          label: "View Starter Plan ($49)",
          href: "/pricing#plans",
          summary: "Opening pricing tiers.",
        },
      }
    }
    if (/\b(pro|growth|149)\b/i.test(query)) {
      return {
        reply:
          "The Pro Growth plan is $149 a month. It includes 2,500 voice minutes, multi-agent swarms, the live Supervisor War Room with whisper coaching, CRM integrations, and $0.08 per minute overages.",
        action: {
          type: "navigate",
          label: "View Pro Growth Plan ($149)",
          href: "/pricing#plans",
          summary: "Opening pricing tiers.",
        },
      }
    }
    if (/\b(enterprise|custom|sip)\b/i.test(query)) {
      return {
        reply:
          "Our Enterprise tier starts at $499 a month for organizations requiring high-volume minutes, custom dedicated SIP trunks, tenant-isolated pgvector RAG, and custom SLA agreements.",
        action: {
          type: "navigate",
          label: "Contact Enterprise Sales",
          href: "/company#contact",
          summary: "Opening Enterprise contact form.",
        },
      }
    }
    return {
      reply:
        "We offer three transparent tiers: Starter at $49 a month (500 mins), Pro Growth at $149 a month (2,500 mins with multi-agent swarms and War Room), and Enterprise for custom SIP trunks. All plans include a 14-day free trial.",
      action: {
        type: "navigate",
        label: "Compare All Pricing Plans",
        href: "/pricing",
        summary: "Opening Pricing page.",
      },
    }
  }

  // 5. Free Trial & Getting Started
  if (
    query.includes("trial") ||
    query.includes("free") ||
    query.includes("credit card") ||
    query.includes("start") ||
    query.includes("sign up") ||
    query.includes("signup") ||
    query.includes("register") ||
    query.includes("onboard") ||
    query.includes("how do i get started")
  ) {
    return {
      reply:
        "You can begin your 14-day free trial right now with no credit card required. Setup takes under 5 minutes using our pre-built industry templates. Would you like to get started?",
      action: {
        type: "lead",
        label: "Start 14-Day Free Trial",
        href: "/get-started",
        summary: "Opening onboarding registration.",
      },
    }
  }

  // 6. Shopify & E-commerce
  if (
    query.includes("shopify") ||
    query.includes("ecommerce") ||
    query.includes("store") ||
    query.includes("cart") ||
    query.includes("checkout") ||
    query.includes("abandoned") ||
    query.includes("product") ||
    query.includes("inventory")
  ) {
    return {
      reply:
        "Omniweb's Shopify AI Assistant connects directly to your store. It indexes your product catalog, answers real-time inventory and sizing queries, and automatically recovers abandoned checkouts via SMS and outbound calls.",
      action: {
        type: "navigate",
        label: "Explore Shopify AI Assistant",
        href: "/solutions/shopify-ai-assistant",
        summary: "Opening Shopify AI Assistant solution.",
      },
    }
  }

  // 7. Supervisor War Room & Whisper Coaching
  if (
    query.includes("war room") ||
    query.includes("supervisor") ||
    query.includes("whisper") ||
    query.includes("coaching") ||
    query.includes("hud") ||
    query.includes("monitor") ||
    query.includes("dashboard") ||
    query.includes("telemetry")
  ) {
    return {
      reply:
        "The Supervisor Live War Room is an operational HUD for call center managers. It provides live concurrent call metrics, sentiment tracking, whisper coaching into agent headsets, and one-click takeover barge-in.",
      action: {
        type: "navigate",
        label: "Open Live War Room",
        href: "/dashboard/call-center",
        summary: "Opening Call Center Supervisor War Room.",
      },
    }
  }

  // 8. Calendar Booking & Scheduling (Cal.com, Google Calendar, Outlook)
  if (
    query.includes("calendar") ||
    query.includes("book") ||
    query.includes("booking") ||
    query.includes("schedule") ||
    query.includes("appointment") ||
    query.includes("cal.com") ||
    query.includes("google calendar") ||
    query.includes("outlook")
  ) {
    return {
      reply:
        "Omniweb agents support native two-way calendar sync with Cal.com, Google Calendar, and Outlook. During a live phone or chat session, the agent checks real-time slot availability and books meetings directly into your calendar.",
      action: {
        type: "navigate",
        label: "Explore Calendar Scheduling",
        href: "/features/two-way-calendar-booking",
        summary: "Opening two-way calendar booking feature.",
      },
    }
  }

  // 9. Outbound Dialing & Campaigns
  if (
    query.includes("outbound") ||
    query.includes("dialer") ||
    query.includes("cold call") ||
    query.includes("campaign") ||
    query.includes("voicemail") ||
    query.includes("amd")
  ) {
    return {
      reply:
        "Omniweb features a compliant Power Outbound Dialer with intelligent Answering Machine Detection. It automates high-volume lead follow-ups, appointment reminders, and reactivation campaigns with warm transfers when a live prospect answers.",
      action: {
        type: "navigate",
        label: "View Power Outbound Dialer",
        href: "/features/power-outbound-dialers",
        summary: "Opening outbound dialer capabilities.",
      },
    }
  }

  // 10. Voice Swarms & Scaling
  if (
    query.includes("swarm") ||
    query.includes("concurrent") ||
    query.includes("capacity") ||
    query.includes("volume") ||
    query.includes("scale") ||
    query.includes("how many calls")
  ) {
    return {
      reply:
        "Omniweb AI Voice Swarms can scale dynamically from 1 to over 10,000 concurrent calls with zero queue wait times. Every caller gets an immediate, personalized answer with sub-250ms voice latency.",
      action: {
        type: "navigate",
        label: "Learn About Voice Swarms",
        href: "/features/autonomous-ai-voice-swarms",
        summary: "Opening voice swarms feature page.",
      },
    }
  }

  // 11. CRM & Webhooks (Salesforce, HubSpot, Zapier)
  if (
    query.includes("crm") ||
    query.includes("hubspot") ||
    query.includes("salesforce") ||
    query.includes("zapier") ||
    query.includes("webhook") ||
    query.includes("integration") ||
    query.includes("api")
  ) {
    return {
      reply:
        "We integrate seamlessly with Salesforce, HubSpot, Zoho, and Zapier via real-time webhooks. Call recordings, transcripts, qualification summaries, and lead scores automatically sync to your CRM upon call completion.",
      action: {
        type: "navigate",
        label: "View Integrations & API",
        href: "/features",
        summary: "Opening integrations overview.",
      },
    }
  }

  // 12. Industry Templates
  if (
    query.includes("template") ||
    query.includes("real estate") ||
    query.includes("healthcare") ||
    query.includes("dental") ||
    query.includes("legal") ||
    query.includes("lawyer") ||
    query.includes("automotive") ||
    query.includes("car") ||
    query.includes("clinic")
  ) {
    return {
      reply:
        "We provide battle-tested, pre-built templates for Real Estate, Healthcare & Clinics, Legal Intake, E-Commerce, Automotive Dealerships, SaaS Demo Booking, and Home Services. You can launch in 5 minutes.",
      action: {
        type: "navigate",
        label: "Browse Industry Templates",
        href: "/templates",
        summary: "Opening template gallery.",
      },
    }
  }

  // 13. Security, Compliance & Data Privacy (HIPAA, SOC2, Encryption)
  if (
    query.includes("security") ||
    query.includes("hipaa") ||
    query.includes("soc2") ||
    query.includes("privacy") ||
    query.includes("gdpr") ||
    query.includes("encrypted") ||
    query.includes("safe") ||
    query.includes("data")
  ) {
    return {
      reply:
        "Security is enterprise-grade. Omniweb provides end-to-end TLS encryption, tenant-isolated pgvector storage, automatic PII redaction in transcripts, and HIPAA and SOC-2 Type II compliance readiness.",
      action: {
        type: "navigate",
        label: "View Security & Resources",
        href: "/resources",
        summary: "Opening security resources.",
      },
    }
  }

  // 14. Demo & Interactive Testing
  if (
    query.includes("demo") ||
    query.includes("test") ||
    query.includes("try") ||
    query.includes("try it") ||
    query.includes("interactive") ||
    query.includes("sample")
  ) {
    return {
      reply:
        "You can test our live voice and chat agents right now in the Interactive Demo Lab. Experience sub-250ms voice latency, barge-in interruptions, and lead qualification live.",
      action: {
        type: "navigate",
        label: "Open Interactive Demo",
        href: "/demo",
        summary: "Navigating to Demo Lab.",
      },
    }
  }

  // 15. Cancellation, Contract & Overages
  if (
    query.includes("cancel") ||
    query.includes("contract") ||
    query.includes("lock in") ||
    query.includes("overage") ||
    query.includes("extra minute") ||
    query.includes("exceed")
  ) {
    return {
      reply:
        "There are no long-term contracts. You can upgrade, downgrade, or cancel at any time directly in your dashboard. Extra minutes on the Pro plan are billed at a flat $0.08 per minute with no surprise fees.",
      action: {
        type: "navigate",
        label: "Review Pricing & FAQ",
        href: "/pricing#faq",
        summary: "Opening pricing FAQ.",
      },
    }
  }

  // 16. Contact / Human Support
  if (
    query.includes("contact") ||
    query.includes("sales") ||
    query.includes("support") ||
    query.includes("email") ||
    query.includes("phone number") ||
    query.includes("human") ||
    query.includes("person") ||
    query.includes("representative")
  ) {
    return {
      reply:
        "Our team is available 24/7. You can submit our contact form, email support@omniweb.ai, or book an architectural consultation with our senior engineering team.",
      action: {
        type: "navigate",
        label: "Open Contact Page",
        href: "/company#contact",
        summary: "Opening contact section.",
      },
    }
  }

  // 17. Greetings & Introductions
  if (
    query === "hello" ||
    query === "hi" ||
    query === "hey" ||
    query.startsWith("hello") ||
    query.startsWith("hi ") ||
    query.startsWith("hey ") ||
    query.includes("good morning") ||
    query.includes("good afternoon") ||
    query.includes("good evening")
  ) {
    return {
      reply:
        "Hello! I'm your Omniweb AI Concierge. You can speak with me naturally, ask about our sub-250ms voice swarms or pricing, or interrupt me at any time. How can I help you today?",
      action: null,
    }
  }

  // 18. Identity / "Who are you?" / "What are you?"
  if (
    query.includes("who are you") ||
    query.includes("what are you") ||
    query.includes("your name") ||
    query.includes("are you an ai") ||
    query.includes("are you a bot") ||
    query.includes("are you real")
  ) {
    return {
      reply:
        "I am the Omniweb AI Concierge! I'm an autonomous agent running on Omniweb's real-time voice and conversational engine. I take turns naturally, allow instant interruptions, and can answer any question about our platform or help you get started.",
      action: {
        type: "navigate",
        label: "Explore Omniweb Platform",
        href: "/",
        summary: "Opening Omniweb home.",
      },
    }
  }

  // 19. "How are you?" / Casual check-in
  if (query.includes("how are you") || query.includes("how's it going") || query.includes("what's up")) {
    return {
      reply:
        "I'm operating at sub-250ms latency and ready to converse! Ask me anything about our AI voice swarms, pricing plans, or try speaking to test our conversational turn-taking and interruption.",
      action: null,
    }
  }

  // 20. "What can you do?" / Capabilities summary
  if (
    query.includes("what can you do") ||
    query.includes("help me with") ||
    query.includes("capabilities") ||
    query.includes("features") ||
    query.includes("services")
  ) {
    return {
      reply:
        "Omniweb provides 7 core solutions: Autonomous AI Voice Swarms, 24/7 Web Chat Concierge, Two-Way Calendar Booking, Power Outbound Dialing, Shopify Storefront AI, and the Supervisor Live War Room. Which area interests you most?",
      action: {
        type: "navigate",
        label: "Explore All Features",
        href: "/features",
        summary: "Opening features page.",
      },
    }
  }

  // 21. Check if user asked to navigate
  if (detectedAction) {
    return {
      reply: buildVoiceFollowUp(detectedAction),
      action: detectedAction,
    }
  }

  // 22. Multi-turn contextual follow-up checks
  if (query.includes("tell me more") || query.includes("more info") || query.includes("explain that")) {
    if (lastAssistantMsg.includes("pricing") || lastAssistantMsg.includes("plan")) {
      return {
        reply:
          "Our Starter plan ($49/mo) gives you 500 minutes and 1 agent. Pro Growth ($149/mo) gives 2,500 minutes, multi-agent swarms, CRM sync, and the Supervisor War Room. Would you like to start a 14-day free trial?",
        action: {
          type: "lead",
          label: "Start 14-Day Free Trial",
          href: "/get-started",
          summary: "Opening free trial signup.",
        },
      }
    }
    if (lastAssistantMsg.includes("voice") || lastAssistantMsg.includes("latency")) {
      return {
        reply:
          "Our voice agents handle both inbound phone calls and outbound campaigns. With LiveKit WebRTC and Deepgram Aura, callers experience natural human dialogue with instant barge-in interruption. Would you like to try the live demo?",
        action: {
          type: "navigate",
          label: "Try Live Voice Demo",
          href: "/demo",
          summary: "Opening live voice demo.",
        },
      }
    }
  }

  // 23. Intelligent Conversational Fallback
  return {
    reply:
      "Omniweb is an autonomous voice and contact center platform delivering sub-250ms response times, natural turn-taking, and instant interruption. You can ask me about our $49 and $149 pricing plans, Shopify integration, or start a 14-day trial.",
    action: {
      type: "navigate",
      label: "Explore Live Demo",
      href: "/demo",
      summary: "Opening Interactive Demo Lab.",
    },
  }
}

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
          { role: "model", parts: [{ text: "Understood. I am Omniweb Concierge, ready to converse naturally, take turns, allow interruptions, and assist visitors concisely." }] },
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
    const result = querySemanticKnowledge(lastUserMessage, messages, detectedAction)

    return NextResponse.json({
      reply: result.reply,
      action: result.action,
    })
  } catch (error) {
    return NextResponse.json(
      {
        reply: "I am ready to help you explore Omniweb AI. Ask me about our voice swarms, pricing plans, or test our sub-50ms barge-in interruption!",
        action: null,
      },
      { status: 200 }
    )
  }
}
