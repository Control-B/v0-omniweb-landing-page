import "server-only"

import type { EngagementIntent, EngagementLeadStatus, EngagementRecord } from "@/lib/saas/types"

export type EngagementSummaryPayload = Pick<
  EngagementRecord,
  | "summaryShort"
  | "summaryFull"
  | "intent"
  | "leadStatus"
  | "leadScore"
  | "painPoints"
  | "buyingSignals"
  | "objections"
  | "keyQuestions"
  | "productsOrServices"
  | "recommendedNextAction"
  | "followUpNeeded"
  | "qualified"
  | "summarySource"
  | "summaryIsPlaceholder"
>

function compactList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean)
}

function uniqueList(values: string[]) {
  return [...new Set(compactList(values))]
}

function extractQuestions(transcript: string) {
  return uniqueList(
    transcript
      .split(/\n+/)
      .flatMap((line) => line.split(/(?<=[?.!])\s+/))
      .filter((line) => line.includes("?"))
      .map((line) => line.replace(/^visitor\s*[:|-]\s*/i, "").trim())
      .slice(0, 5),
  )
}

function detectIntent(transcript: string, fallback: EngagementIntent = "other"): EngagementIntent {
  const value = transcript.toLowerCase()

  if (/price|pricing|cost|plan|subscription|monthly|quote/i.test(value)) return "pricing_question"
  if (/book|booking|schedule|demo|estimate|quote request|consultation/i.test(value)) return "booking_request_quote"
  if (/support|refund|return|issue|problem|error|broken|help/i.test(value)) return "support_request"
  if (/service|implementation|setup|integration|onboarding/i.test(value)) return "service_inquiry"
  if (/complaint|angry|upset|frustrated|terrible/i.test(value)) return "complaint"
  if (/product|feature|voice|chat|assistant|telephony|widget|storefront/i.test(value)) return "product_question"

  return fallback
}

function extractProductsOrServices(transcript: string, intent: EngagementIntent) {
  const matches = transcript.match(/\b(ai assistant|voice|text|telephony|widget|shopify|demo|pricing|implementation|knowledge base|analytics)\b/gi) ?? []
  const values = uniqueList(matches.map((item) => item.toLowerCase()))

  if (values.length > 0) {
    return values
  }

  if (intent === "pricing_question") return ["Omniweb pricing plans"]
  if (intent === "service_inquiry") return ["Omniweb implementation"]
  if (intent === "product_question") return ["Omniweb AI assistant"]

  return []
}

function extractSignals(transcript: string) {
  const lower = transcript.toLowerCase()
  const buyingSignals = uniqueList([
    /price|pricing|budget/.test(lower) ? "Asked about pricing" : "",
    /timeline|implementation|how long|launch/.test(lower) ? "Asked about implementation time" : "",
    /demo|book|schedule|call me|follow up/.test(lower) ? "Requested next step" : "",
    /@/.test(transcript) ? "Provided email" : "",
    /\+?\d[\d\s().-]{7,}/.test(transcript) ? "Provided phone number" : "",
  ])

  const painPoints = uniqueList([
    /too many questions|high volume|after hours/.test(lower) ? "Needs help handling inbound conversations" : "",
    /miss(ed|ing) leads|slow response/.test(lower) ? "Concerned about missed leads or response time" : "",
    /manual|team bandwidth|staff/.test(lower) ? "Current process sounds too manual" : "",
  ])

  const objections = uniqueList([
    /expensive|costly|budget/.test(lower) ? "Pricing sensitivity" : "",
    /integration|setup|complex/.test(lower) ? "Concerned about implementation complexity" : "",
    /not ready|later|think about it/.test(lower) ? "Timing hesitation" : "",
  ])

  return { buyingSignals, painPoints, objections }
}

function deriveLeadStatus(options: {
  transcript: string
  intent: EngagementIntent
  leadScore: number
  buyingSignals: string[]
}) {
  const { transcript, intent, leadScore, buyingSignals } = options
  const hasContact = /@|\+?\d[\d\s().-]{7,}/.test(transcript)

  if (/resolved|fixed|thank you that answers/i.test(transcript)) {
    return { leadStatus: "resolved" as EngagementLeadStatus, qualified: false, followUpNeeded: false }
  }

  if (leadScore >= 80 || (intent === "booking_request_quote" && hasContact)) {
    return { leadStatus: "qualified" as EngagementLeadStatus, qualified: true, followUpNeeded: true }
  }

  if (leadScore >= 60 || buyingSignals.length >= 2) {
    return { leadStatus: "needs_follow_up" as EngagementLeadStatus, qualified: true, followUpNeeded: true }
  }

  if (intent === "support_request") {
    return { leadStatus: "new" as EngagementLeadStatus, qualified: false, followUpNeeded: /follow up|contact me/i.test(transcript) }
  }

  return { leadStatus: "not_qualified" as EngagementLeadStatus, qualified: false, followUpNeeded: false }
}

function buildLeadScore(transcript: string, buyingSignals: string[], painPoints: string[]) {
  let score = 35

  if (/@|\+?\d[\d\s().-]{7,}/.test(transcript)) score += 20
  score += buyingSignals.length * 12
  score += painPoints.length * 6
  if (/demo|book|quote|pricing|implementation/i.test(transcript)) score += 12

  return Math.min(100, score)
}

function buildRecommendedNextAction(intent: EngagementIntent, leadStatus: EngagementLeadStatus, contactCaptured: boolean) {
  if (leadStatus === "resolved") return "No immediate action needed. Keep this engagement for context in future support conversations."
  if (intent === "pricing_question") return contactCaptured ? "Follow up with the relevant pricing plan, included channels, and a demo link." : "Offer a pricing overview and prompt the visitor to share contact details for a tailored plan recommendation."
  if (intent === "booking_request_quote") return "Send the owner a hot-lead alert and follow up with a scheduling link or quote intake form."
  if (intent === "support_request") return "Route the issue to support, summarize the problem, and confirm the next service step."
  if (intent === "service_inquiry") return "Share implementation expectations, onboarding timeline, and the best next discovery step."
  if (intent === "product_question") return "Send product details, feature coverage, and a CTA to book a walkthrough."
  return contactCaptured ? "Follow up with a concise recap and a recommended next step." : "Keep monitoring similar engagement patterns and encourage contact capture on the next interaction."
}

function buildFallbackSummary(transcript: string): EngagementSummaryPayload {
  const normalizedTranscript = transcript.trim()
  const intent = detectIntent(normalizedTranscript)
  const keyQuestions = extractQuestions(normalizedTranscript)
  const productsOrServices = extractProductsOrServices(normalizedTranscript, intent)
  const { buyingSignals, painPoints, objections } = extractSignals(normalizedTranscript)
  const leadScore = buildLeadScore(normalizedTranscript, buyingSignals, painPoints)
  const derived = deriveLeadStatus({ transcript: normalizedTranscript, intent, leadScore, buyingSignals })
  const recommendedNextAction = buildRecommendedNextAction(intent, derived.leadStatus, /@|\+?\d[\d\s().-]{7,}/.test(normalizedTranscript))
  const summaryShort = normalizedTranscript.length > 180
    ? `${normalizedTranscript.slice(0, 177).trimEnd()}...`
    : normalizedTranscript

  const summaryFull = [
    `The visitor conversation focused on ${intent.replaceAll("_", " ")}.`,
    keyQuestions.length ? `Key questions included: ${keyQuestions.join(" ")}` : "No explicit question sentences were detected, but the transcript still signals meaningful buying context.",
    buyingSignals.length ? `Buying signals: ${buyingSignals.join(", ")}.` : "Buying signals were light in this conversation.",
    painPoints.length ? `Pain points: ${painPoints.join(", ")}.` : "No strong pain points were detected.",
    objections.length ? `Objections: ${objections.join(", ")}.` : "No clear objections were stated.",
    `Recommended next action: ${recommendedNextAction}`,
  ].join(" ")

  return {
    summaryShort,
    summaryFull,
    intent,
    leadStatus: derived.leadStatus,
    leadScore,
    painPoints,
    buyingSignals,
    objections,
    keyQuestions,
    productsOrServices,
    recommendedNextAction,
    followUpNeeded: derived.followUpNeeded,
    qualified: derived.qualified,
    summarySource: "mock",
    summaryIsPlaceholder: true,
  }
}

async function tryDeepgramSummary(transcript: string): Promise<EngagementSummaryPayload> {
  const apiKey = process.env.DEEPGRAM_API_KEY

  if (!apiKey) {
    return buildFallbackSummary(transcript)
  }

  const endpoint = new URL("https://api.deepgram.com/v1/read")
  endpoint.searchParams.set("language", "en")
  endpoint.searchParams.set("summarize", "true")
  endpoint.searchParams.set("topics", "true")
  endpoint.searchParams.set("intents", "true")
  endpoint.searchParams.set("sentiment", "true")

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: transcript }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Deepgram summarization failed with status ${response.status}`)
  }

  const payload = await response.json() as Record<string, any>
  const shortSummary = payload?.results?.summary?.text ?? payload?.results?.summary?.short ?? null

  if (!shortSummary || typeof shortSummary !== "string") {
    throw new Error("Deepgram response did not include a summary")
  }

  const topIntent = payload?.results?.intents?.intents?.[0]?.intent
  const intent = detectIntent(transcript, typeof topIntent === "string" ? topIntent as EngagementIntent : "other")
  const topicValues = Array.isArray(payload?.results?.topics?.topics)
    ? payload.results.topics.topics.map((item: { topic?: string }) => item?.topic).filter((value: unknown) => typeof value === "string")
    : []
  const keyQuestions = extractQuestions(transcript)
  const { buyingSignals, painPoints, objections } = extractSignals(transcript)
  const productsOrServices = uniqueList([...extractProductsOrServices(transcript, intent), ...topicValues.slice(0, 3)])
  const leadScore = buildLeadScore(transcript, buyingSignals, painPoints)
  const derived = deriveLeadStatus({ transcript, intent, leadScore, buyingSignals })
  const recommendedNextAction = buildRecommendedNextAction(intent, derived.leadStatus, /@|\+?\d[\d\s().-]{7,}/.test(transcript))

  const summaryFull = [
    shortSummary,
    keyQuestions.length ? `Key questions: ${keyQuestions.join(" ")}` : "",
    buyingSignals.length ? `Buying signals: ${buyingSignals.join(", ")}.` : "",
    objections.length ? `Objections: ${objections.join(", ")}.` : "",
    `Recommended next action: ${recommendedNextAction}`,
  ].filter(Boolean).join(" ")

  return {
    summaryShort: shortSummary,
    summaryFull,
    intent,
    leadStatus: derived.leadStatus,
    leadScore,
    painPoints,
    buyingSignals,
    objections,
    keyQuestions,
    productsOrServices,
    recommendedNextAction,
    followUpNeeded: derived.followUpNeeded,
    qualified: derived.qualified,
    summarySource: "deepgram",
    summaryIsPlaceholder: false,
  }
}

export async function summarizeEngagementWithDeepgram(transcript: string): Promise<EngagementSummaryPayload> {
  if (!transcript.trim()) {
    return buildFallbackSummary("No transcript was available for this engagement.")
  }

  try {
    return await tryDeepgramSummary(transcript)
  } catch {
    return buildFallbackSummary(transcript)
  }
}
