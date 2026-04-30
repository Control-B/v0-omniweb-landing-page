import "server-only"

import { auth } from "@clerk/nextjs/server"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { ensureSaasSchema, getSaasDbPool, hasDatabaseUrl } from "@/lib/saas/db"
import { summarizeEngagementWithDeepgram } from "@/lib/saas/deepgram"
import { getCurrentUserTenantStatus } from "@/lib/saas/status"
import type {
  AnalyticsFilters,
  AnalyticsSummaryMetrics,
  EngagementChannel,
  EngagementIntent,
  EngagementLeadStatus,
  EngagementRecord,
  FollowUpChannel,
  FollowUpTaskRecord,
  FollowUpTaskStatus,
  TenantStatus,
} from "@/lib/saas/types"

const STORE_DIR = path.join(process.cwd(), ".omniweb")
const ANALYTICS_STORE_PATH = path.join(STORE_DIR, "analytics-state.json")

type AnalyticsStoreFile = {
  engagements: EngagementRecord[]
  followUpTasks: FollowUpTaskRecord[]
}

type AnalyticsSeedContext = {
  websiteDomain?: string | null
  businessName?: string | null
}

type AnalyticsApiAccessResult =
  | {
      ok: true
      tenantId: string
      status: TenantStatus
    }
  | {
      ok: false
      status: number
      body: { error: string }
    }

let writeQueue: Promise<void> = Promise.resolve()

function emptyAnalyticsStore(): AnalyticsStoreFile {
  return {
    engagements: [],
    followUpTasks: [],
  }
}

function parseStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean)
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown
      return parseStringArray(parsed)
    } catch {
      return value ? [value] : []
    }
  }

  return []
}

function mapEngagementRow(row: Record<string, unknown>): EngagementRecord {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    sessionId: String(row.session_id),
    channel: String(row.channel) as EngagementChannel,
    sourceUrl: String(row.source_url ?? ""),
    language: String(row.language ?? "en"),
    visitorName: row.visitor_name ? String(row.visitor_name) : null,
    visitorEmail: row.visitor_email ? String(row.visitor_email) : null,
    visitorPhone: row.visitor_phone ? String(row.visitor_phone) : null,
    leadStatus: String(row.lead_status ?? "new") as EngagementLeadStatus,
    intent: String(row.intent ?? "other") as EngagementIntent,
    contactCaptured: Boolean(row.contact_captured),
    qualified: Boolean(row.qualified),
    followUpNeeded: Boolean(row.follow_up_needed),
    summaryShort: row.summary_short ? String(row.summary_short) : null,
    summaryFull: row.summary_full ? String(row.summary_full) : null,
    transcript: row.transcript ? String(row.transcript) : null,
    leadScore: typeof row.lead_score === "number" ? row.lead_score : row.lead_score ? Number(row.lead_score) : null,
    painPoints: parseStringArray(row.pain_points),
    buyingSignals: parseStringArray(row.buying_signals),
    objections: parseStringArray(row.objections),
    keyQuestions: parseStringArray(row.key_questions),
    productsOrServices: parseStringArray(row.products_or_services),
    recommendedNextAction: row.recommended_next_action ? String(row.recommended_next_action) : null,
    ownerNotes: row.owner_notes ? String(row.owner_notes) : null,
    agentMode: row.agent_mode ? String(row.agent_mode) : null,
    conversionStage: row.conversion_stage ? String(row.conversion_stage) : null,
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata as Record<string, unknown> : null,
    messageCount: typeof row.message_count === "number" ? row.message_count : Number(row.message_count ?? 0),
    summarySource: row.summary_source ? String(row.summary_source) as EngagementRecord["summarySource"] : null,
    summaryIsPlaceholder: Boolean(row.summary_is_placeholder),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

function mapFollowUpTaskRow(row: Record<string, unknown>): FollowUpTaskRecord {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    engagementId: String(row.engagement_id),
    instruction: String(row.instruction),
    channel: String(row.channel) as FollowUpChannel,
    status: String(row.status) as FollowUpTaskStatus,
    internalNote: row.internal_note ? String(row.internal_note) : null,
    scheduledFor: row.scheduled_for ? new Date(String(row.scheduled_for)).toISOString() : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

async function ensureAnalyticsStoreFile() {
  await mkdir(STORE_DIR, { recursive: true })

  try {
    await readFile(ANALYTICS_STORE_PATH, "utf8")
  } catch {
    await writeFile(ANALYTICS_STORE_PATH, JSON.stringify(emptyAnalyticsStore(), null, 2), "utf8")
  }
}

async function readAnalyticsStore(): Promise<AnalyticsStoreFile> {
  await ensureAnalyticsStoreFile()

  try {
    const raw = await readFile(ANALYTICS_STORE_PATH, "utf8")
    const parsed = JSON.parse(raw) as Partial<AnalyticsStoreFile>
    return {
      engagements: Array.isArray(parsed.engagements) ? parsed.engagements : [],
      followUpTasks: Array.isArray(parsed.followUpTasks) ? parsed.followUpTasks : [],
    }
  } catch {
    return emptyAnalyticsStore()
  }
}

async function writeAnalyticsStore(data: AnalyticsStoreFile) {
  await ensureAnalyticsStoreFile()

  writeQueue = writeQueue.then(async () => {
    await writeFile(ANALYTICS_STORE_PATH, JSON.stringify(data, null, 2), "utf8")
  })

  await writeQueue
}

function shouldSeedMockData() {
  return process.env.NODE_ENV !== "production"
}

function normalizeDomain(domain: string | null | undefined) {
  if (!domain) return "demo.omniweb.ai"
  return String(domain).replace(/^https?:\/\//, "")
}

function buildMockEngagements(tenantId: string, seedContext?: AnalyticsSeedContext): EngagementRecord[] {
  const createdAt = new Date()
  const websiteDomain = normalizeDomain(seedContext?.websiteDomain)
  const businessName = seedContext?.businessName || "Omniweb Workspace"

  return [
    {
      id: randomUUID(),
      tenantId,
      sessionId: "sess_web_001",
      channel: "website_chat",
      sourceUrl: `https://${websiteDomain}/pricing`,
      language: "en",
      visitorName: "Sarah",
      visitorEmail: "sarah@example.com",
      visitorPhone: null,
      leadStatus: "needs_follow_up",
      intent: "pricing_question",
      contactCaptured: true,
      qualified: true,
      followUpNeeded: true,
      summaryShort: "Visitor asked about AI assistant pricing, wanted to know if voice and text are included, and showed interest in booking a demo.",
      summaryFull: `${businessName} pricing conversation: the visitor asked whether voice and text are included in the same plan, wanted to understand implementation time, and shared an email for next steps. They appear open to a demo if pricing aligns with their current growth stage.`,
      transcript: "Visitor: Hi, I’m comparing AI assistant tools. Does Omniweb include voice and text in the same plan?\nAI: Yes, the plans are designed around multi-channel engagement. Voice and text can both be supported based on the package you choose.\nVisitor: How long does implementation usually take?\nAI: Most teams can launch quickly after onboarding.\nVisitor: Great. Please send pricing and a demo link to sarah@example.com.",
      leadScore: 88,
      painPoints: ["Needs clarity on plan coverage", "Wants fast implementation"],
      buyingSignals: ["Asked about pricing", "Asked about implementation time", "Provided email"],
      objections: ["Needs confidence on plan fit"],
      keyQuestions: ["Does Omniweb include voice and text in the same plan?", "How long does implementation usually take?"],
      productsOrServices: ["Omniweb AI assistant", "AI voice", "AI chat"],
      recommendedNextAction: "Follow up with pricing plan comparison and a demo scheduling link.",
      ownerNotes: null,
      agentMode: "general_lead_gen",
      conversionStage: "intent",
      metadata: { agentMode: "general_lead_gen", conversionStage: "intent" },
      messageCount: 7,
      summarySource: "mock",
      summaryIsPlaceholder: true,
      createdAt: new Date(createdAt.getTime() - 1000 * 60 * 35).toISOString(),
      updatedAt: new Date(createdAt.getTime() - 1000 * 60 * 35).toISOString(),
    },
    {
      id: randomUUID(),
      tenantId,
      sessionId: "sess_voice_002",
      channel: "ai_voice_call",
      sourceUrl: `https://${websiteDomain}/solutions`,
      language: "en",
      visitorName: null,
      visitorEmail: null,
      visitorPhone: "+1 (555) 222-1000",
      leadStatus: "qualified",
      intent: "booking_request_quote",
      contactCaptured: true,
      qualified: true,
      followUpNeeded: true,
      summaryShort: "Caller wanted a quote for deploying AI call handling after hours and asked for a callback from sales.",
      summaryFull: "The caller explained that their team misses opportunities after hours and wants AI telephony to capture and qualify leads. They shared a phone number and requested a sales callback to discuss rollout timing and pricing.",
      transcript: "Caller: We miss a lot of leads after hours and need something to answer calls.\nAI: Omniweb AI can help qualify and route those conversations.\nCaller: Can someone call me back with a quote this week? My number is +1 (555) 222-1000.\nAI: Absolutely, I can note that request.",
      leadScore: 91,
      painPoints: ["Missing after-hours leads", "Needs AI call coverage"],
      buyingSignals: ["Requested next step", "Provided phone number"],
      objections: [],
      keyQuestions: ["Can someone call me back with a quote this week?"],
      productsOrServices: ["AI telephony", "Lead qualification"],
      recommendedNextAction: "Owner should call back with telephony rollout options and quote guidance.",
      ownerNotes: "High urgency prospect.",
      agentMode: "service_business",
      conversionStage: "booking",
      metadata: { agentMode: "service_business", conversionStage: "booking" },
      messageCount: 6,
      summarySource: "mock",
      summaryIsPlaceholder: true,
      createdAt: new Date(createdAt.getTime() - 1000 * 60 * 120).toISOString(),
      updatedAt: new Date(createdAt.getTime() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: randomUUID(),
      tenantId,
      sessionId: "sess_shop_003",
      channel: "shopify_storefront",
      sourceUrl: `https://${websiteDomain}/products/omniweb-ai-starter`,
      language: "en",
      visitorName: "Jordan",
      visitorEmail: null,
      visitorPhone: null,
      leadStatus: "new",
      intent: "product_question",
      contactCaptured: false,
      qualified: false,
      followUpNeeded: false,
      summaryShort: "Shopper asked what knowledge sources the AI can learn from and whether Shopify pages can be indexed.",
      summaryFull: "The visitor explored Shopify storefront compatibility and asked about indexing FAQs, product pages, and policies. Interest is real, but no contact info was captured yet.",
      transcript: "Visitor: Can the AI learn from my Shopify product pages and FAQs?\nAI: Yes, the Knowledge area is designed for URLs like product pages, FAQs, and policy content.\nVisitor: Nice, I’m just researching right now.",
      leadScore: 54,
      painPoints: ["Researching compatibility"],
      buyingSignals: ["Asked product capability question"],
      objections: ["Still in research mode"],
      keyQuestions: ["Can the AI learn from my Shopify product pages and FAQs?"],
      productsOrServices: ["Knowledge sources", "Shopify storefront"],
      recommendedNextAction: "Prompt for contact details on the next high-intent interaction and share a compatibility checklist.",
      ownerNotes: null,
      agentMode: "ecommerce",
      conversionStage: "awareness",
      metadata: { agentMode: "ecommerce", conversionStage: "awareness" },
      messageCount: 4,
      summarySource: "mock",
      summaryIsPlaceholder: true,
      createdAt: new Date(createdAt.getTime() - 1000 * 60 * 240).toISOString(),
      updatedAt: new Date(createdAt.getTime() - 1000 * 60 * 240).toISOString(),
    },
  ]
}

function buildMockFollowUpTasks(tenantId: string, engagements: EngagementRecord[]): FollowUpTaskRecord[] {
  const primaryEngagement = engagements[0]
  if (!primaryEngagement) return []

  return [
    {
      id: randomUUID(),
      tenantId,
      engagementId: primaryEngagement.id,
      instruction: "Send Sarah the Standard vs Business plan comparison and include a demo scheduling link.",
      channel: "email",
      status: "pending",
      internalNote: "Pricing lead from Analytics mock seed.",
      scheduledFor: null,
      createdAt: new Date(primaryEngagement.createdAt).toISOString(),
      updatedAt: new Date(primaryEngagement.createdAt).toISOString(),
    },
  ]
}

async function ensureMockAnalyticsSeed(tenantId: string, seedContext?: AnalyticsSeedContext) {
  if (!shouldSeedMockData()) {
    return
  }

  if (hasDatabaseUrl()) {
    await ensureSaasSchema()
    const db = getSaasDbPool()
    const countResult = await db.query(`select count(*)::int as count from public.omniweb_engagements where tenant_id = $1`, [tenantId])
    const count = Number(countResult.rows[0]?.count ?? 0)

    if (count > 0) {
      return
    }

    const engagements = buildMockEngagements(tenantId, seedContext)
    const followUpTasks = buildMockFollowUpTasks(tenantId, engagements)

    for (const engagement of engagements) {
      await db.query(
        `
          insert into public.omniweb_engagements (
            id,
            tenant_id,
            session_id,
            channel,
            source_url,
            language,
            visitor_name,
            visitor_email,
            visitor_phone,
            lead_status,
            intent,
            contact_captured,
            qualified,
            follow_up_needed,
            summary_short,
            summary_full,
            transcript,
            lead_score,
            pain_points,
            buying_signals,
            objections,
            key_questions,
            products_or_services,
            recommended_next_action,
            owner_notes,
            agent_mode,
            conversion_stage,
            metadata,
            message_count,
            summary_source,
            summary_is_placeholder,
            created_at,
            updated_at
          ) values (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19::jsonb, $20::jsonb, $21::jsonb, $22::jsonb, $23::jsonb, $24, $25, $26, $27, $28, $29::jsonb, $30, $31, $32, $33
          )
        `,
        [
          engagement.id,
          engagement.tenantId,
          engagement.sessionId,
          engagement.channel,
          engagement.sourceUrl,
          engagement.language,
          engagement.visitorName,
          engagement.visitorEmail,
          engagement.visitorPhone,
          engagement.leadStatus,
          engagement.intent,
          engagement.contactCaptured,
          engagement.qualified,
          engagement.followUpNeeded,
          engagement.summaryShort,
          engagement.summaryFull,
          engagement.transcript,
          engagement.leadScore,
          JSON.stringify(engagement.painPoints),
          JSON.stringify(engagement.buyingSignals),
          JSON.stringify(engagement.objections),
          JSON.stringify(engagement.keyQuestions),
          JSON.stringify(engagement.productsOrServices),
          engagement.recommendedNextAction,
          engagement.ownerNotes,
          engagement.agentMode ?? "general_lead_gen",
          engagement.conversionStage ?? "awareness",
          JSON.stringify(engagement.metadata ?? {}),
          engagement.messageCount,
          engagement.summarySource,
          engagement.summaryIsPlaceholder,
          engagement.createdAt,
          engagement.updatedAt,
        ],
      )
    }

    for (const task of followUpTasks) {
      await db.query(
        `
          insert into public.omniweb_follow_up_tasks (
            id,
            tenant_id,
            engagement_id,
            instruction,
            channel,
            status,
            internal_note,
            scheduled_for,
            created_at,
            updated_at
          ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
        [
          task.id,
          task.tenantId,
          task.engagementId,
          task.instruction,
          task.channel,
          task.status,
          task.internalNote,
          task.scheduledFor,
          task.createdAt,
          task.updatedAt,
        ],
      )
    }

    return
  }

  const store = await readAnalyticsStore()
  const count = store.engagements.filter((engagement) => engagement.tenantId === tenantId).length
  if (count > 0) {
    return
  }

  const engagements = buildMockEngagements(tenantId, seedContext)
  const followUpTasks = buildMockFollowUpTasks(tenantId, engagements)
  store.engagements.push(...engagements)
  store.followUpTasks.push(...followUpTasks)
  await writeAnalyticsStore(store)
}

function buildFilterPredicate(filters: AnalyticsFilters) {
  return (engagement: EngagementRecord) => {
    if (filters.dateFrom && new Date(engagement.createdAt) < new Date(filters.dateFrom)) {
      return false
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo)
      dateTo.setHours(23, 59, 59, 999)
      if (new Date(engagement.createdAt) > dateTo) {
        return false
      }
    }

    if (filters.channel && engagement.channel !== filters.channel) {
      return false
    }

    if (filters.leadStatus && engagement.leadStatus !== filters.leadStatus) {
      return false
    }

    if (filters.intent && engagement.intent !== filters.intent) {
      return false
    }

    if (filters.followUpNeeded !== null && filters.followUpNeeded !== undefined && engagement.followUpNeeded !== filters.followUpNeeded) {
      return false
    }

    if (filters.contactCaptured !== null && filters.contactCaptured !== undefined && engagement.contactCaptured !== filters.contactCaptured) {
      return false
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim().toLowerCase()
      const haystack = [
        engagement.sessionId,
        engagement.visitorName ?? "",
        engagement.visitorEmail ?? "",
        engagement.visitorPhone ?? "",
        engagement.sourceUrl,
        engagement.summaryShort ?? "",
      ].join(" ").toLowerCase()

      if (!haystack.includes(search)) {
        return false
      }
    }

    return true
  }
}

function applyFilters(engagements: EngagementRecord[], filters: AnalyticsFilters) {
  return engagements.filter(buildFilterPredicate(filters)).sort((left, right) => {
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  })
}

function buildDbFilterQuery(tenantId: string, filters: AnalyticsFilters) {
  const params: unknown[] = [tenantId]
  const clauses = ["tenant_id = $1"]

  if (filters.dateFrom) {
    params.push(new Date(filters.dateFrom).toISOString())
    clauses.push(`created_at >= $${params.length}`)
  }

  if (filters.dateTo) {
    const dateTo = new Date(filters.dateTo)
    dateTo.setHours(23, 59, 59, 999)
    params.push(dateTo.toISOString())
    clauses.push(`created_at <= $${params.length}`)
  }

  if (filters.channel) {
    params.push(filters.channel)
    clauses.push(`channel = $${params.length}`)
  }

  if (filters.leadStatus) {
    params.push(filters.leadStatus)
    clauses.push(`lead_status = $${params.length}`)
  }

  if (filters.intent) {
    params.push(filters.intent)
    clauses.push(`intent = $${params.length}`)
  }

  if (filters.followUpNeeded !== null && filters.followUpNeeded !== undefined) {
    params.push(filters.followUpNeeded)
    clauses.push(`follow_up_needed = $${params.length}`)
  }

  if (filters.contactCaptured !== null && filters.contactCaptured !== undefined) {
    params.push(filters.contactCaptured)
    clauses.push(`contact_captured = $${params.length}`)
  }

  if (filters.search?.trim()) {
    params.push(`%${filters.search.trim()}%`)
    clauses.push(`(
      session_id ilike $${params.length}
      or coalesce(visitor_name, '') ilike $${params.length}
      or coalesce(visitor_email, '') ilike $${params.length}
      or coalesce(visitor_phone, '') ilike $${params.length}
      or source_url ilike $${params.length}
      or coalesce(summary_short, '') ilike $${params.length}
    )`)
  }

  return {
    whereClause: clauses.join(" and "),
    params,
  }
}

function computeAnalyticsMetrics(engagements: EngagementRecord[]): AnalyticsSummaryMetrics {
  const totalConversations = engagements.length
  const qualifiedLeads = engagements.filter((engagement) => engagement.qualified || engagement.leadStatus === "qualified").length
  const followUpNeeded = engagements.filter((engagement) => engagement.followUpNeeded).length
  const contactInfoCaptured = engagements.filter((engagement) => engagement.contactCaptured).length
  const avgMessagesPerSession = totalConversations > 0
    ? Number((engagements.reduce((sum, engagement) => sum + engagement.messageCount, 0) / totalConversations).toFixed(1))
    : 0
  const conversionRate = totalConversations > 0
    ? Number(((qualifiedLeads / totalConversations) * 100).toFixed(1))
    : 0

  return {
    totalConversations,
    qualifiedLeads,
    followUpNeeded,
    contactInfoCaptured,
    avgMessagesPerSession,
    conversionRate,
  }
}

function mergeEngagement(existing: EngagementRecord, updates: Partial<Omit<EngagementRecord, "id" | "tenantId" | "createdAt" | "updatedAt">>): EngagementRecord {
  return {
    ...existing,
    ...updates,
    painPoints: updates.painPoints ?? existing.painPoints,
    buyingSignals: updates.buyingSignals ?? existing.buyingSignals,
    objections: updates.objections ?? existing.objections,
    keyQuestions: updates.keyQuestions ?? existing.keyQuestions,
    productsOrServices: updates.productsOrServices ?? existing.productsOrServices,
    updatedAt: new Date().toISOString(),
  }
}

export async function requireCurrentTenantAnalyticsAccess(): Promise<AnalyticsApiAccessResult> {
  const { userId } = await auth()

  if (!userId) {
    return {
      ok: false,
      status: 401,
      body: { error: "Authentication required" },
    }
  }

  const status = await getCurrentUserTenantStatus()

  if (!status.tenantId || !status.onboardingCompleted) {
    return {
      ok: false,
      status: 403,
      body: { error: "Complete onboarding first" },
    }
  }

  if (!status.canAccessFeatures) {
    return {
      ok: false,
      status: 403,
      body: { error: "Upgrade required to access analytics" },
    }
  }

  return {
    ok: true,
    tenantId: status.tenantId,
    status,
  }
}

export function parseAnalyticsFilters(searchParams: URLSearchParams): AnalyticsFilters {
  const readValue = (key: string) => {
    const value = searchParams.get(key)
    return value && value !== "all" ? value : null
  }

  const parseBoolean = (value: string | null) => {
    if (value === null) return null
    if (value === "true") return true
    if (value === "false") return false
    return null
  }

  return {
    dateFrom: readValue("dateFrom"),
    dateTo: readValue("dateTo"),
    channel: readValue("channel") as AnalyticsFilters["channel"],
    leadStatus: readValue("leadStatus") as AnalyticsFilters["leadStatus"],
    intent: readValue("intent") as AnalyticsFilters["intent"],
    followUpNeeded: parseBoolean(readValue("followUpNeeded")),
    contactCaptured: parseBoolean(readValue("contactCaptured")),
    search: readValue("search"),
  }
}

export async function listEngagementsForTenant(tenantId: string, filters: AnalyticsFilters, seedContext?: AnalyticsSeedContext) {
  await ensureMockAnalyticsSeed(tenantId, seedContext)

  if (hasDatabaseUrl()) {
    await ensureSaasSchema()
    const db = getSaasDbPool()
    const { whereClause, params } = buildDbFilterQuery(tenantId, filters)
    const result = await db.query(
      `select * from public.omniweb_engagements where ${whereClause} order by created_at desc`,
      params,
    )

    return result.rows.map((row) => mapEngagementRow(row))
  }

  const store = await readAnalyticsStore()
  return applyFilters(store.engagements.filter((engagement) => engagement.tenantId === tenantId), filters)
}

export async function getAnalyticsSummaryForTenant(tenantId: string, filters: AnalyticsFilters, seedContext?: AnalyticsSeedContext) {
  const engagements = await listEngagementsForTenant(tenantId, filters, seedContext)
  return computeAnalyticsMetrics(engagements)
}

export async function getEngagementDetailForTenant(tenantId: string, engagementId: string) {
  if (hasDatabaseUrl()) {
    await ensureSaasSchema()
    const db = getSaasDbPool()
    const engagementResult = await db.query(
      `select * from public.omniweb_engagements where tenant_id = $1 and id = $2 limit 1`,
      [tenantId, engagementId],
    )

    const engagement = engagementResult.rows[0] ? mapEngagementRow(engagementResult.rows[0]) : null

    if (!engagement) {
      return null
    }

    const followUpTasksResult = await db.query(
      `select * from public.omniweb_follow_up_tasks where tenant_id = $1 and engagement_id = $2 order by created_at desc`,
      [tenantId, engagementId],
    )

    return {
      engagement,
      followUpTasks: followUpTasksResult.rows.map((row) => mapFollowUpTaskRow(row)),
    }
  }

  const store = await readAnalyticsStore()
  const engagement = store.engagements.find((item) => item.tenantId === tenantId && item.id === engagementId) ?? null

  if (!engagement) {
    return null
  }

  return {
    engagement,
    followUpTasks: store.followUpTasks
      .filter((item) => item.tenantId === tenantId && item.engagementId === engagementId)
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
  }
}

export async function updateEngagementForTenant(
  tenantId: string,
  engagementId: string,
  updates: Partial<Omit<EngagementRecord, "id" | "tenantId" | "createdAt" | "updatedAt">>,
) {
  const detail = await getEngagementDetailForTenant(tenantId, engagementId)
  if (!detail) {
    return null
  }

  const nextEngagement = mergeEngagement(detail.engagement, updates)

  if (hasDatabaseUrl()) {
    await ensureSaasSchema()
    const db = getSaasDbPool()
    const result = await db.query(
      `
        update public.omniweb_engagements
        set
          session_id = $3,
          channel = $4,
          source_url = $5,
          language = $6,
          visitor_name = $7,
          visitor_email = $8,
          visitor_phone = $9,
          lead_status = $10,
          intent = $11,
          contact_captured = $12,
          qualified = $13,
          follow_up_needed = $14,
          summary_short = $15,
          summary_full = $16,
          transcript = $17,
          lead_score = $18,
          pain_points = $19::jsonb,
          buying_signals = $20::jsonb,
          objections = $21::jsonb,
          key_questions = $22::jsonb,
          products_or_services = $23::jsonb,
          recommended_next_action = $24,
          owner_notes = $25,
          agent_mode = $26,
          conversion_stage = $27,
          metadata = $28::jsonb,
          message_count = $29,
          summary_source = $30,
          summary_is_placeholder = $31,
          updated_at = $32
        where tenant_id = $1 and id = $2
        returning *
      `,
      [
        tenantId,
        engagementId,
        nextEngagement.sessionId,
        nextEngagement.channel,
        nextEngagement.sourceUrl,
        nextEngagement.language,
        nextEngagement.visitorName,
        nextEngagement.visitorEmail,
        nextEngagement.visitorPhone,
        nextEngagement.leadStatus,
        nextEngagement.intent,
        nextEngagement.contactCaptured,
        nextEngagement.qualified,
        nextEngagement.followUpNeeded,
        nextEngagement.summaryShort,
        nextEngagement.summaryFull,
        nextEngagement.transcript,
        nextEngagement.leadScore,
        JSON.stringify(nextEngagement.painPoints),
        JSON.stringify(nextEngagement.buyingSignals),
        JSON.stringify(nextEngagement.objections),
        JSON.stringify(nextEngagement.keyQuestions),
        JSON.stringify(nextEngagement.productsOrServices),
        nextEngagement.recommendedNextAction,
        nextEngagement.ownerNotes,
        nextEngagement.agentMode ?? "general_lead_gen",
        nextEngagement.conversionStage ?? "awareness",
        JSON.stringify(nextEngagement.metadata ?? {}),
        nextEngagement.messageCount,
        nextEngagement.summarySource,
        nextEngagement.summaryIsPlaceholder,
        nextEngagement.updatedAt,
      ],
    )

    return result.rows[0] ? mapEngagementRow(result.rows[0]) : null
  }

  const store = await readAnalyticsStore()
  const index = store.engagements.findIndex((item) => item.tenantId === tenantId && item.id === engagementId)

  if (index < 0) {
    return null
  }

  store.engagements[index] = nextEngagement
  await writeAnalyticsStore(store)
  return nextEngagement
}

export async function summarizeEngagementForTenant(tenantId: string, engagementId: string) {
  const detail = await getEngagementDetailForTenant(tenantId, engagementId)

  if (!detail?.engagement.transcript) {
    return null
  }

  const summary = await summarizeEngagementWithDeepgram(detail.engagement.transcript)

  return updateEngagementForTenant(tenantId, engagementId, {
    summaryShort: summary.summaryShort,
    summaryFull: summary.summaryFull,
    intent: summary.intent,
    leadStatus: summary.leadStatus,
    leadScore: summary.leadScore,
    painPoints: summary.painPoints,
    buyingSignals: summary.buyingSignals,
    objections: summary.objections,
    keyQuestions: summary.keyQuestions,
    productsOrServices: summary.productsOrServices,
    recommendedNextAction: summary.recommendedNextAction,
    followUpNeeded: summary.followUpNeeded,
    qualified: summary.qualified,
    summarySource: summary.summarySource,
    summaryIsPlaceholder: summary.summaryIsPlaceholder,
  })
}

export async function createFollowUpTaskForTenant(input: {
  tenantId: string
  engagementId: string
  instruction: string
  channel: FollowUpChannel
  internalNote?: string | null
  scheduledFor?: string | null
}) {
  const detail = await getEngagementDetailForTenant(input.tenantId, input.engagementId)
  if (!detail) {
    return null
  }

  const now = new Date().toISOString()
  const task: FollowUpTaskRecord = {
    id: randomUUID(),
    tenantId: input.tenantId,
    engagementId: input.engagementId,
    instruction: input.instruction,
    channel: input.channel,
    status: "pending",
    internalNote: input.internalNote ?? null,
    scheduledFor: input.scheduledFor ?? null,
    createdAt: now,
    updatedAt: now,
  }

  if (hasDatabaseUrl()) {
    await ensureSaasSchema()
    const db = getSaasDbPool()
    const result = await db.query(
      `
        insert into public.omniweb_follow_up_tasks (
          id,
          tenant_id,
          engagement_id,
          instruction,
          channel,
          status,
          internal_note,
          scheduled_for,
          created_at,
          updated_at
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        returning *
      `,
      [
        task.id,
        task.tenantId,
        task.engagementId,
        task.instruction,
        task.channel,
        task.status,
        task.internalNote,
        task.scheduledFor,
        task.createdAt,
        task.updatedAt,
      ],
    )

    await updateEngagementForTenant(input.tenantId, input.engagementId, {
      followUpNeeded: true,
      leadStatus: detail.engagement.leadStatus === "resolved" ? "needs_follow_up" : detail.engagement.leadStatus,
    })

    return result.rows[0] ? mapFollowUpTaskRow(result.rows[0]) : task
  }

  const store = await readAnalyticsStore()
  store.followUpTasks.push(task)
  const engagementIndex = store.engagements.findIndex((item) => item.tenantId === input.tenantId && item.id === input.engagementId)
  if (engagementIndex >= 0) {
    store.engagements[engagementIndex] = {
      ...store.engagements[engagementIndex],
      followUpNeeded: true,
      leadStatus: store.engagements[engagementIndex].leadStatus === "resolved"
        ? "needs_follow_up"
        : store.engagements[engagementIndex].leadStatus,
      updatedAt: now,
    }
  }

  await writeAnalyticsStore(store)
  return task
}
