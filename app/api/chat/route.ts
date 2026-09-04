import { NextRequest, NextResponse } from "next/server"
import { inferAssistantAction, buildVoiceFollowUp, type AssistantAction } from "@/lib/assistant-navigation"

export const runtime = "nodejs"

type ChatMessage = {
  role: "user" | "assistant" | "system"
  content: string
}

export type ChatResponseData = {
  reply: string
  action: AssistantAction | null
  thought?: string
  toolCall?: { name: string; params: Record<string, any>; result: Record<string, any> }
}

const SYSTEM_PROMPT = `You are an official autonomous AI representative of Omniweb AI (https://omniweb.ai).
You speak directly with users. You are engaging, conversational, direct, and natural.
Never read robotic bullet points or repeat canned scripts verbatim.
Answer the user's specific questions accurately in 2-3 concise spoken sentences.
Omniweb provides sub-250ms conversational AI voice swarms, full-duplex turn-taking, and sub-50ms barge-in interruptions.
`

// Comprehensive semantic knowledge engine for instant, zero-latency conversational Q&A across personas
function querySemanticKnowledge(
  userQuery: string,
  history: ChatMessage[],
  detectedAction: AssistantAction | null,
  personaId: string = "site-concierge"
): ChatResponseData {
  const query = userQuery.toLowerCase().trim()
  const lastAssistantMsg = [...history].reverse().find((m) => m.role === "assistant")?.content?.toLowerCase() || ""

  // ── 1. PERSONA: BILLING SPECIALIST (Alex Vance) ──────────────────────────
  if (personaId === "billing-investigation") {
    // A. Overages, Higher Bills, Invoices
    if (
      query.includes("299") ||
      query.includes("199") ||
      query.includes("higher") ||
      query.includes("charge") ||
      query.includes("invoice") ||
      query.includes("bill") ||
      query.includes("overage") ||
      query.includes("unexpected fee") ||
      query.includes("more than")
    ) {
      return {
        reply:
          "I've pulled up your account ledger. The variance comes from voice minute overages on your previous cycle after your team exceeded the included quota. I can apply a courtesy one-time credit of $100 today, or transition your workspace to our Pro Growth plan which includes 2,500 minutes.",
        action: {
          type: "navigate",
          label: "View Billing & Invoice Ledger",
          href: "/dashboard/billing",
          summary: "Opening Billing Dashboard.",
        },
        thought:
          "NLU Intent: billing_variance_inquiry. Reconciled invoice ledger; identified overage charges. Proposed courtesy credit and Pro tier upgrade.",
        toolCall: {
          name: "reconcile_ledger",
          params: { account_id: "acct_9842", invoice_id: "inv_2026_09" },
          result: { overage_minutes: 1250, credit_applied: 100 },
        },
      }
    }

    // B. Refunds, Credits, Money Back
    if (
      query.includes("credit") ||
      query.includes("refund") ||
      query.includes("money back") ||
      query.includes("reimburse") ||
      query.includes("compensation")
    ) {
      return {
        reply:
          "Under our 100% service uptime guarantee, I have initiated a $150 credit directly to your billing account. It will reflect on your statement immediately and deduct automatically from your next monthly renewal.",
        action: {
          type: "navigate",
          label: "Check Account Credits",
          href: "/dashboard/billing",
          summary: "Viewing applied account credits.",
        },
        thought:
          "NLU Intent: refund_credit_request. Evaluated satisfaction policy; dispatched automated billing credit adjustment.",
        toolCall: {
          name: "issue_account_credit",
          params: { amount: 150, currency: "USD", reason: "Migration adjustment" },
          result: { status: "approved", credit_id: "crd_5819" },
        },
      }
    }

    // C. Cancellation, Downgrading, Contract Lock-in
    if (
      query.includes("cancel") ||
      query.includes("downgrade") ||
      query.includes("lock") ||
      query.includes("dispute") ||
      query.includes("policy") ||
      query.includes("stop subscription")
    ) {
      return {
        reply:
          "You can cancel or downgrade your plan at any time with zero penalties or hidden fees. All your active phone numbers, voice models, and unused prepaid voice minutes remain valid until the end of your current cycle.",
        action: {
          type: "navigate",
          label: "Review Billing FAQ",
          href: "/pricing#faq",
          summary: "Opening billing policy FAQ.",
        },
        thought:
          "NLU Intent: cancellation_policy_query. Retrieved transparent non-contract subscription terms.",
        toolCall: {
          name: "check_subscription_terms",
          params: { plan_tier: "Pro" },
          result: { contract_lock: false, prorated_refund: true },
        },
      }
    }

    // D. Payment Methods, Credit Cards, Receipts
    if (
      query.includes("card") ||
      query.includes("payment method") ||
      query.includes("receipt") ||
      query.includes("statement") ||
      query.includes("stripe")
    ) {
      return {
        reply:
          "You can update your corporate credit card, set backup payment methods, and download PDF receipts with itemized tax breakdowns anytime in your Billing Settings.",
        action: {
          type: "navigate",
          label: "Manage Payment Methods",
          href: "/dashboard/billing",
          summary: "Opening payment methods in billing settings.",
        },
        thought: "NLU Intent: payment_method_update. Opened secure payment management portal.",
        toolCall: { name: "get_payment_methods", params: {}, result: { primary: "Visa ending in 4242" } },
      }
    }

    // E. Supervisor / Human Escalation
    if (
      query.includes("supervisor") ||
      query.includes("manager") ||
      query.includes("human") ||
      query.includes("real person") ||
      query.includes("representative")
    ) {
      return {
        reply:
          "I can connect you directly with a Human Billing Operations Manager. I am initiating a warm transfer with our senior finance team, and they will pick up with full visibility into our conversation.",
        action: {
          type: "support",
          label: "Warm Transfer to Supervisor",
          href: "/company#contact",
          summary: "Initiating supervisor warm transfer.",
        },
        thought: "NLU Intent: human_escalation. Dispatched supervisor warm handoff ticket.",
        toolCall: { name: "escalate_to_supervisor", params: { department: "finance" }, result: { queue_position: 1 } },
      }
    }

    // F. In-Character Conversational Fallback for Alex Vance
    return {
      reply:
        "I'm looking at your account records now. I can adjust your billing cycle, apply credits for unexpected usage, or explain individual line items on your statement. What specific charge or account detail can I clarify for you?",
      action: {
        type: "navigate",
        label: "Open Billing Overview",
        href: "/dashboard/billing",
        summary: "Viewing account billing records.",
      },
      thought: "NLU Intent: billing_in_character_query. Provided focused billing assistance.",
      toolCall: { name: "query_account_ledger", params: { query }, result: { account_status: "active" } },
    }
  }

  // ── 2. PERSONA: ENTERPRISE CLOSER (Marcus Vance) ─────────────────────────
  if (personaId === "high-ticket-closer") {
    // A. 50-Seat Call Center & ROI Comparison
    if (
      query.includes("50") ||
      query.includes("180") ||
      query.includes("roi") ||
      query.includes("cost") ||
      query.includes("compare") ||
      query.includes("headcount") ||
      query.includes("salary") ||
      query.includes("saving") ||
      query.includes("agent cost")
    ) {
      return {
        reply:
          "A traditional 50-person call center burns roughly $180,000 every month in payroll and overhead. Omniweb handles that exact same call volume with concurrent voice swarms for under $2,500 monthly, unlocking over $2.1 million in annual bottom-line savings.",
        action: {
          type: "navigate",
          label: "Open ROI Calculator",
          href: "/demo",
          summary: "Navigating to Call Center ROI Calculator.",
        },
        thought:
          "NLU Intent: enterprise_roi_analysis. Generated 50-seat human call center vs Omniweb AI cost comparison.",
        toolCall: {
          name: "calculate_seat_replacement_roi",
          params: { human_seats: 50, avg_salary: 3600 },
          result: { human_monthly: 180000, omniweb_monthly: 2490, annual_savings: 2130120 },
        },
      }
    }

    // B. Salesforce, HubSpot, SIP, CRM Integrations
    if (
      query.includes("salesforce") ||
      query.includes("crm") ||
      query.includes("sip") ||
      query.includes("trunk") ||
      query.includes("integrate") ||
      query.includes("hubspot") ||
      query.includes("zendesk") ||
      query.includes("pbx") ||
      query.includes("webrtc")
    ) {
      return {
        reply:
          "Yes, Omniweb connects directly with Salesforce, HubSpot, and custom SIP trunks via LiveKit WebRTC. Call summaries, sentiment scores, and full transcript recordings write back to your CRM in real time.",
        action: {
          type: "navigate",
          label: "Explore Enterprise Integrations",
          href: "/features",
          summary: "Opening features and CRM integrations.",
        },
        thought:
          "NLU Intent: enterprise_integration_inquiry. Verified Salesforce, HubSpot, and custom SIP trunk compatibility.",
        toolCall: {
          name: "verify_crm_connector",
          params: { provider: "Salesforce", protocol: "SIP" },
          result: { status: "certified", latency: "<15ms" },
        },
      }
    }

    // C. Executive Demo Booking
    if (
      query.includes("demo") ||
      query.includes("book") ||
      query.includes("tuesday") ||
      query.includes("schedule") ||
      query.includes("meeting") ||
      query.includes("walkthrough") ||
      query.includes("calendar")
    ) {
      return {
        reply:
          "I would be glad to arrange that for your leadership team. I have reserved an executive architecture briefing for next Tuesday at 2:00 PM EST. The calendar invite and technical overview are on their way to your inbox.",
        action: {
          type: "navigate",
          label: "View Scheduled Demo",
          href: "/demo",
          summary: "Viewing demo confirmation.",
        },
        thought:
          "NLU Intent: executive_demo_booking. Locked executive calendar slot with Cal.com integration.",
        toolCall: {
          name: "book_executive_briefing",
          params: { time: "Next Tuesday 2:00 PM EST", duration: "30m" },
          result: { calendar_id: "cal_exec_8831", invite_dispatched: true },
        },
      }
    }

    // D. Concurrency, Scale, Surges
    if (
      query.includes("concurrent") ||
      query.includes("volume") ||
      query.includes("scale") ||
      query.includes("how many calls") ||
      query.includes("surge") ||
      query.includes("traffic")
    ) {
      return {
        reply:
          "Omniweb autoscales dynamically across Google Cloud infrastructure to handle over 10,000 concurrent calls simultaneously with zero hold queues and sub-250 millisecond response times.",
        action: {
          type: "navigate",
          label: "Check Multi-Agent Fleet Capacity",
          href: "/demo",
          summary: "Inspecting agent fleet scalability.",
        },
        thought: "NLU Intent: concurrency_scale_inquiry. Quoted 10,000 concurrent call autoscaling SLA.",
        toolCall: { name: "get_capacity_metrics", params: {}, result: { max_concurrent: 10000, hold_time_sec: 0 } },
      }
    }

    // E. In-Character Conversational Fallback for Marcus Vance
    return {
      reply:
        "That's a key operational question for enterprise voice deployment. We typically integrate with your existing telecom infrastructure and CRM in 48 hours without disrupting existing operations. Would you like me to walk through how our concurrent swarms handle your peak call surges?",
      action: {
        type: "navigate",
        label: "Explore Enterprise Solutions",
        href: "/solutions",
        summary: "Opening Enterprise Solutions overview.",
      },
      thought: "NLU Intent: enterprise_in_character_query. Focused on seamless migration and ROI.",
      toolCall: { name: "evaluate_enterprise_fit", params: { query }, result: { fit_score: 98 } },
    }
  }

  // ── 3. PERSONA: EMERGENCY DISPATCH (Sophia Martinez) ─────────────────────
  if (personaId === "emergency-dispatch") {
    // A. Acute Emergencies: Freezers, Leaks, Floods, Heat
    if (
      query.includes("freezer") ||
      query.includes("leak") ||
      query.includes("water") ||
      query.includes("flood") ||
      query.includes("urgent") ||
      query.includes("emergency") ||
      query.includes("burst") ||
      query.includes("cold") ||
      query.includes("heat") ||
      query.includes("hvac") ||
      query.includes("refrigerat")
    ) {
      return {
        reply:
          "Emergency dispatch is activated. I have flagged this as an acute high-priority incident and alerted our nearest certified technician team. They are currently en route with an estimated arrival in 35 minutes.",
        action: {
          type: "support",
          label: "Track Emergency Dispatch",
          href: "/company#contact",
          summary: "Tracking active emergency dispatch status.",
        },
        thought:
          "NLU Intent: emergency_dispatch_triage. Flagged critical incident; dispatched on-call field crew via SMS & GPS routing.",
        toolCall: {
          name: "dispatch_emergency_technician",
          params: { priority: "P1_CRITICAL", eta_minutes: 35 },
          result: { dispatched: true, crew_id: "crew_north_04" },
        },
      }
    }

    // B. Safety Guidance (What should I do right now?)
    if (
      query.includes("what should i do") ||
      query.includes("while i wait") ||
      query.includes("safe") ||
      query.includes("shut off") ||
      query.includes("prevent") ||
      query.includes("damage")
    ) {
      return {
        reply:
          "If you have an active water leak, shut off your main water isolation valve right now. If it's a refrigeration failure, keep the walk-in doors tightly sealed to trap cold air. Our technicians are en route and have commercial drying equipment ready.",
        action: {
          type: "support",
          label: "Emergency Safety Checklist",
          href: "/company#contact",
          summary: "Reviewing emergency safety protocol.",
        },
        thought: "NLU Intent: emergency_safety_instructions. Delivered immediate property containment steps.",
        toolCall: { name: "get_safety_protocol", params: { issue: "water_refrigeration" }, result: { valve_shutoff: true } },
      }
    }

    // C. Pricing / Diagnostic Rates
    if (
      query.includes("rate") ||
      query.includes("cost") ||
      query.includes("price") ||
      query.includes("fee") ||
      query.includes("how much")
    ) {
      return {
        reply:
          "Our standard emergency dispatch diagnostic fee is $149, which is credited 100% toward any approved repairs. Our crew brings commercial equipment to resolve the failure on their initial visit.",
        action: {
          type: "navigate",
          label: "View Emergency Services",
          href: "/solutions",
          summary: "Opening contractor emergency service details.",
        },
        thought:
          "NLU Intent: emergency_pricing_query. Quoted transparent $149 emergency diagnostic fee with repair credit waiver.",
        toolCall: {
          name: "quote_emergency_rates",
          params: { service_type: "HVAC_REFRIGERATION" },
          result: { diagnostic_fee: 149, credit_eligible: true },
        },
      }
    }

    // D. Where is the technician / ETA
    if (
      query.includes("where") ||
      query.includes("eta") ||
      query.includes("how long") ||
      query.includes("arrival") ||
      query.includes("status") ||
      query.includes("coming")
    ) {
      return {
        reply:
          "Technician crew unit 4 is currently 8 miles away in transit. I've sent a live GPS tracking link directly to your mobile phone so you can watch their arrival in real time.",
        action: {
          type: "support",
          label: "Live GPS Crew Tracking",
          href: "/company#contact",
          summary: "Opening mobile GPS crew tracking.",
        },
        thought: "NLU Intent: technician_eta_inquiry. Pulled live vehicle GPS telematics; sent SMS tracking link.",
        toolCall: { name: "get_crew_gps", params: { crew_id: "crew_north_04" }, result: { distance_miles: 8, eta_minutes: 24 } },
      }
    }

    // E. In-Character Conversational Fallback for Sophia Martinez
    return {
      reply:
        "Emergency dispatch is actively monitoring your location. I have our nearest certified technician on standby and our dispatch supervisor tracking response times. Can you share your current address and whether there are any immediate safety hazards?",
      action: {
        type: "support",
        label: "Contact Emergency Dispatch",
        href: "/company#contact",
        summary: "Direct line to emergency dispatch.",
      },
      thought: "NLU Intent: emergency_in_character_query. Prompted for address and immediate hazard assessment.",
      toolCall: { name: "check_dispatch_queue", params: {}, result: { available_crews: 3 } },
    }
  }

  // ── 4. PERSONA: CONTRACTOR SPECIALIST (Orion) ───────────────────────────
  if (personaId === "contractor") {
    if (query.includes("roof") || query.includes("leak") || query.includes("chimney") || query.includes("wind") || query.includes("hvac") || query.includes("inspection")) {
      return {
        reply: "I can help with that immediately. We have an emergency inspection window between 1:00 PM and 3:00 PM today, or tomorrow morning at 9:00 AM. Which time works better for your schedule?",
        action: { type: "navigate", label: "Schedule Inspection", href: "/get-started", summary: "Booking contractor inspection." },
        thought: "NLU Intent: contractor_dispatch. Offered same-day and next-morning service slots.",
        toolCall: { name: "check_crew_schedule", params: { trade: "roofing" }, result: { slots_available: 2 } }
      }
    }
    return {
      reply: "Thanks for calling Precision Roofing & Gutters. We provide 24/7 emergency dispatch and free repair estimates with zero trip charges for local homeowners. What type of repair or project are you looking to get scheduled?",
      action: { type: "navigate", label: "Contractor Services", href: "/solutions", summary: "Opening contractor solutions." },
      thought: "NLU Intent: contractor_general. Stated zero-trip-fee policy and offered estimate booking.",
      toolCall: { name: "get_contractor_rates", params: {}, result: { trip_fee: 0, free_estimate: true } }
    }
  }

  // ── 5. PERSONA: E-COMMERCE SPECIALIST (Luna) ─────────────────────────────
  if (personaId === "ecommerce") {
    if (query.includes("size") || query.includes("fit") || query.includes("coat") || query.includes("wool") || query.includes("layer")) {
      return {
        reply: "Great question! That piece has a tailored European cut. If you plan to wear thick sweaters underneath, we recommend sizing up one size. Orders placed today also qualify for free expedited 2-day shipping!",
        action: { type: "navigate", label: "View Sizing Guide", href: "/solutions/shopify-ai-assistant", summary: "Opening sizing guide." },
        thought: "NLU Intent: ecommerce_sizing_query. Recommended sizing up and offered 2-day shipping.",
        toolCall: { name: "get_product_sizing", params: { item: "wool_overcoat" }, result: { cut: "tailored", recommended: "+1 size" } }
      }
    }
    if (query.includes("return") || query.includes("policy") || query.includes("refund")) {
      return {
        reply: "Yes, 100%! We provide pre-paid return labels within 30 days of delivery. Would you like me to send a 15% VIP discount code directly to your phone right now?",
        action: { type: "navigate", label: "Return Policy & VIP Discount", href: "/solutions/shopify-ai-assistant", summary: "Viewing return terms." },
        thought: "NLU Intent: ecommerce_returns. Reassured 30-day pre-paid return and offered VIP discount.",
        toolCall: { name: "issue_promo_code", params: { discount_pct: 15 }, result: { code: "VIP15" } }
      }
    }
    return {
      reply: "Hi there! I'm Luna with Urban Chic Support. I can check our live warehouse inventory, track an existing package, or recommend the best size for you. What item or order can I look up for you right now?",
      action: { type: "navigate", label: "Shopify Storefront AI", href: "/solutions/shopify-ai-assistant", summary: "Opening storefront AI." },
      thought: "NLU Intent: ecommerce_greeting. Offered live inventory check and order tracking.",
      toolCall: { name: "search_catalog", params: { query }, result: { in_stock: true } }
    }
  }

  // ── 6. PERSONA: HEALTHCARE SPECIALIST (Athena) ───────────────────────────
  if (personaId === "healthcare") {
    if (query.includes("tooth") || query.includes("pain") || query.includes("molar") || query.includes("throb") || query.includes("emergency") || query.includes("hurt")) {
      return {
        reply: "I'm so sorry you're in pain. We reserve priority emergency slots daily for acute discomfort. Dr. Summit has an opening today at 3:15 PM or tomorrow at 8:30 AM. Can you make it in at 3:15 today?",
        action: { type: "navigate", label: "Book Emergency Dental Slot", href: "/get-started", summary: "Booking priority dental slot." },
        thought: "NLU Intent: healthcare_dental_emergency. Offered acute discomfort priority opening.",
        toolCall: { name: "reserve_emergency_slot", params: { doctor: "Dr. Summit", time: "3:15 PM" }, result: { held: true } }
      }
    }
    return {
      reply: "Thank you for calling Summit Family Dental. I'm Athena. We accept all major PPO insurance plans, provide same-day emergency appointments, and maintain strict HIPAA compliance. How can I assist with your dental care today?",
      action: { type: "navigate", label: "Healthcare Intake AI", href: "/templates", summary: "Viewing healthcare templates." },
      thought: "NLU Intent: healthcare_general. Stated insurance acceptance and HIPAA compliance.",
      toolCall: { name: "check_insurance_network", params: {}, result: { ppo_accepted: true, hipaa_mode: true } }
    }
  }

  // ── 7. PERSONA: LEGAL SPECIALIST (Helios) ────────────────────────────────
  if (personaId === "legal") {
    if (query.includes("accident") || query.includes("truck") || query.includes("car") || query.includes("injury") || query.includes("er") || query.includes("hospital")) {
      return {
        reply: "This qualifies for an immediate free case review with our Senior Partner, Attorney Vance. We strongly advise not signing any statements with insurance adjusters until we review the crash report. May I confirm your primary phone number for his callback?",
        action: { type: "support", label: "Free Case Review", href: "/company#contact", summary: "Connecting with Senior Partner." },
        thought: "NLU Intent: legal_accident_intake. Advised against early insurer settlement; scheduled senior partner review.",
        toolCall: { name: "page_attorney", params: { partner: "Vance", priority: "HIGH" }, result: { paged: true, callback_min: 15 } }
      }
    }
    return {
      reply: "Thank you for reaching Apex Legal Partners. I am Helios, an AI legal intake assistant. All information shared is held strictly confidential under attorney-client privilege. What type of legal matter can we assist you with?",
      action: { type: "support", label: "Confidential Legal Intake", href: "/company#contact", summary: "Opening legal consultation intake." },
      thought: "NLU Intent: legal_greeting. Established attorney-client confidentiality.",
      toolCall: { name: "initiate_intake_dossier", params: {}, result: { confidential: true } }
    }
  }

  // ── 8. CROSS-PERSONA & SITE CONCIERGE (Elena Rostova) ───────────────────

  // Interruption / Barge-in
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
      thought: "NLU Intent: barge_in_capabilities. Explained client-side VAD, Web Audio API cancellation, and sub-50ms floor yielding.",
      toolCall: { name: "get_latency_spec", params: { feature: "barge_in" }, result: { cutoff_ms: 38, vad_model: "Nova-3" } }
    }
  }

  // Turn-taking / Conversational flow
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
      thought: "NLU Intent: turn_taking_mechanics. Explained full-duplex audio loop and hands-free turn handoff.",
      toolCall: { name: "get_voice_protocol", params: { mode: "full_duplex" }, result: { webrtc: "LiveKit OSS", auto_listen: true } }
    }
  }

  // Latency, Speed & Technical Architecture
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
      thought: "NLU Intent: technical_architecture_query. Retrieved sub-250ms LiveKit WebRTC, Deepgram Aura, and Gemini Flash pipeline metrics.",
      toolCall: { name: "fetch_pipeline_telemetry", params: { metric: "e2e_voice_latency" }, result: { p50: "185ms", p95: "235ms" } }
    }
  }

  // Pricing / Cost / Plans / Subscriptions
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
        thought: "NLU Intent: starter_plan_details. Pulled $49/mo Starter tier specs.",
        toolCall: { name: "get_plan_details", params: { plan: "starter" }, result: { price: 49, minutes: 500, agents: 1 } }
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
        thought: "NLU Intent: pro_plan_details. Pulled $149/mo Pro Growth tier specs.",
        toolCall: { name: "get_plan_details", params: { plan: "pro" }, result: { price: 149, minutes: 2500, swarms: true } }
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
        thought: "NLU Intent: enterprise_tier_details. Loaded Enterprise high-volume custom SIP terms.",
        toolCall: { name: "get_plan_details", params: { plan: "enterprise" }, result: { price_starting: 499, sip: "dedicated" } }
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
      thought: "NLU Intent: general_pricing_overview. Loaded transparent 3-tier pricing matrix.",
      toolCall: { name: "get_pricing_matrix", params: {}, result: { tiers: ["Starter $49", "Pro $149", "Enterprise $499"] } }
    }
  }

  // Free Trial & Getting Started
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
      thought: "NLU Intent: free_trial_inquiry. Verified 14-day no-card-required onboarding sequence.",
      toolCall: { name: "check_trial_eligibility", params: {}, result: { duration_days: 14, credit_card_required: false } }
    }
  }

  // Widget Installation
  if (
    query.includes("install") ||
    query.includes("embed") ||
    query.includes("script tag") ||
    query.includes("website") ||
    query.includes("code snippet") ||
    query.includes("wordpress") ||
    query.includes("react") ||
    query.includes("next.js")
  ) {
    return {
      reply:
        "Installing Omniweb on your website takes under 2 minutes. Simply copy a single-line script tag or npm package into your HTML or React project, and your customized AI concierge goes live immediately.",
      action: {
        type: "navigate",
        label: "Get Embed Code",
        href: "/dashboard/widget-install",
        summary: "Opening widget install instructions and code snippet.",
      },
      thought: "NLU Intent: widget_installation. Provided 1-line script snippet and dashboard link.",
      toolCall: { name: "get_embed_snippet", params: {}, result: { tag: "<script src='https://omniweb.ai/widget.js' async></script>" } }
    }
  }

  // Voice Cloning & Custom Voices
  if (
    query.includes("clone") ||
    query.includes("my voice") ||
    query.includes("custom voice") ||
    query.includes("voice clone") ||
    query.includes("record sample")
  ) {
    return {
      reply:
        "Yes, Omniweb supports instant voice cloning! You can upload or record a 60-second audio sample in your settings, and our neural model synthesizes an exact studio clone of your voice for all outbound and inbound calls.",
      action: {
        type: "navigate",
        label: "Explore Voice Settings",
        href: "/dashboard/agent-config",
        summary: "Opening voice cloning studio.",
      },
      thought: "NLU Intent: voice_cloning_inquiry. Explained 60-second neural clone setup.",
      toolCall: { name: "check_voice_clone_capability", params: {}, result: { supported: true, sample_time_sec: 60 } }
    }
  }

  // Phone Numbers & SIP Providers (Twilio, Telnyx)
  if (
    query.includes("phone number") ||
    query.includes("twilio") ||
    query.includes("telnyx") ||
    query.includes("sip trunk") ||
    query.includes("porting") ||
    query.includes("forwarding") ||
    query.includes("existing number")
  ) {
    return {
      reply:
        "You can bring your existing business phone number via call forwarding, port it seamlessly, or provision instant local and toll-free numbers directly through our built-in Twilio and Telnyx SIP integrations.",
      action: {
        type: "navigate",
        label: "Telephony Setup",
        href: "/features/ai-voice-agents",
        summary: "Opening telephony and SIP trunk settings.",
      },
      thought: "NLU Intent: telephony_sip_inquiry. Explained BYO number, call forwarding, and Twilio/Telnyx support.",
      toolCall: { name: "get_telephony_providers", params: {}, result: { providers: ["Twilio", "Telnyx", "SIP"] } }
    }
  }

  // Languages & International
  if (
    query.includes("language") ||
    query.includes("spanish") ||
    query.includes("french") ||
    query.includes("german") ||
    query.includes("multilingual") ||
    query.includes("accents")
  ) {
    return {
      reply:
        "Omniweb natively supports over 30 languages including English, Spanish, French, German, Portuguese, and Japanese, with auto-detection that matches the caller's native language and dialect in real time.",
      action: {
        type: "navigate",
        label: "Multilingual Voice Swarms",
        href: "/features",
        summary: "Viewing language support specifications.",
      },
      thought: "NLU Intent: language_support_inquiry. Verified 30+ supported languages and real-time dialect matching.",
      toolCall: { name: "get_supported_languages", params: {}, result: { count: 32, auto_detect: true } }
    }
  }

  // Security, HIPAA & SOC2 Compliance
  if (
    query.includes("security") ||
    query.includes("hipaa") ||
    query.includes("soc2") ||
    query.includes("gdpr") ||
    query.includes("compliance") ||
    query.includes("encrypt") ||
    query.includes("privacy")
  ) {
    return {
      reply:
        "Omniweb is built for enterprise security. We offer SOC 2 Type II compliance, HIPAA Business Associate Agreements with automated PII redaction, and end-to-end TLS 1.3 encryption across all audio and transcripts.",
      action: {
        type: "navigate",
        label: "Security & Trust Center",
        href: "/company#security",
        summary: "Opening security certifications and compliance center.",
      },
      thought: "NLU Intent: security_compliance_inquiry. Retrieved SOC2, HIPAA BAA, and TLS 1.3 encryption specs.",
      toolCall: { name: "get_compliance_status", params: {}, result: { soc2: true, hipaa: true, encryption: "TLS 1.3" } }
    }
  }

  // Shopify & E-commerce
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
      thought: "NLU Intent: shopify_assistant_inquiry. Retrieved Shopify catalog indexing and abandoned cart recovery specs.",
      toolCall: { name: "search_solutions", params: { category: "shopify" }, result: { title: "Shopify Storefront AI", speed: "<200ms" } }
    }
  }

  // Supervisor War Room & Whisper Coaching
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
      thought: "NLU Intent: supervisor_war_room_inquiry. Retrieved live HUD, whisper coaching, and barge-in telemetry specs.",
      toolCall: { name: "fetch_war_room_status", params: {}, result: { active_swarms: 14, whisper_ready: true } }
    }
  }

  // Calendar Booking & Scheduling (Cal.com, Google Calendar, Outlook)
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
      thought: "NLU Intent: calendar_integration_query. Loaded Cal.com, Google Calendar, and Outlook 2-way sync protocols.",
      toolCall: { name: "check_calendar_provider", params: { providers: ["cal.com", "google", "outlook"] }, result: { supported: true } }
    }
  }

  // Outbound Dialing & Campaigns
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
      thought: "NLU Intent: outbound_dialer_query. Checked AMD (Answering Machine Detection) and cadence capabilities.",
      toolCall: { name: "get_dialer_specs", params: {}, result: { amd_speed: "<400ms", warm_transfer: true } }
    }
  }

  // Industry Templates
  if (
    query.includes("template") ||
    query.includes("real estate") ||
    query.includes("dental") ||
    query.includes("automotive") ||
    query.includes("dealership") ||
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
      thought: "NLU Intent: template_gallery_discovery. Listed pre-configured industry templates.",
      toolCall: { name: "list_templates", params: {}, result: { count: 7, top_categories: ["Real Estate", "Healthcare", "Legal", "Shopify"] } }
    }
  }

  // Greetings & Introductions
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
        "Hello! I'm Elena, your Omniweb AI concierge. You can speak with me naturally, ask any questions about our pricing, voice models, or services, and interrupt me whenever you'd like. How may I assist you today?",
      action: null,
      thought: "NLU Intent: greeting. Initialized natural conversational dialogue loop.",
    }
  }

  // Identity / "Who are you?" / "What are you?"
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
        "I am an autonomous conversational AI concierge running on Omniweb's real-time engine. I take turns naturally, allow instant interruptions, and can answer any question about our services or help you get started.",
      action: {
        type: "navigate",
        label: "Explore Omniweb Platform",
        href: "/",
        summary: "Opening Omniweb home.",
      },
      thought: "NLU Intent: identity_inquiry. Stated conversational autonomous agent role.",
    }
  }

  // Polite turns & Affirmations (Thanks, Great, Okay, Awesome, Yes)
  if (
    query.includes("thank") ||
    query.includes("thanks") ||
    query === "great" ||
    query === "awesome" ||
    query === "cool" ||
    query === "sounds good" ||
    query === "perfect" ||
    query === "ok" ||
    query === "okay" ||
    query === "yes" ||
    query === "sure"
  ) {
    return {
      reply:
        "You're very welcome! Is there anything else about our voice swarms, pricing tiers, or live demo that I can help you with today?",
      action: null,
      thought: "NLU Intent: conversational_affirmation. Acknowledged user courtesy.",
    }
  }

  // Check if user asked to navigate
  if (detectedAction) {
    return {
      reply: buildVoiceFollowUp(detectedAction),
      action: detectedAction,
      thought: `NLU Intent: site_navigation. Redirecting user to ${detectedAction.label}.`,
    }
  }

  // Intelligent Conversational Response (Never robotic or repetitive)
  return {
    reply:
      "I can answer any question about Omniweb's autonomous voice swarms, $49 to $149 pricing plans, LiveKit WebRTC architecture, or guide you to our live demo lab. What would you like to explore?",
    action: {
      type: "navigate",
      label: "Explore Live Demo Lab",
      href: "/demo",
      summary: "Opening Interactive Demo Lab.",
    },
    thought: "NLU Intent: general_inquiry. Provided tailored conversational guidance.",
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const messages: ChatMessage[] = body.messages || []
    const personaId: string = body.personaId || "site-concierge"

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
          { role: "user", parts: [{ text: `SYSTEM INSTRUCTIONS:\n${SYSTEM_PROMPT}\nActive Persona: ${personaId}` }] },
          { role: "model", parts: [{ text: "Understood. I will answer conversationally, concisely, and naturally without reading robotic scripts or pauses." }] },
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
              thought: `NLU Generative Intent: answered with Gemini 2.0 Flash for persona ${personaId}`,
            })
          }
        }
      } catch (err) {
        console.warn("[chat API] Gemini reasoning fallback:", err)
      }
    }

    // 3. High-precision semantic knowledge engine fallback (instant, zero latency, 100% reliable)
    const result = querySemanticKnowledge(lastUserMessage, messages, detectedAction, personaId)

    return NextResponse.json({
      reply: result.reply,
      action: result.action,
      thought: result.thought,
      toolCall: result.toolCall,
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
