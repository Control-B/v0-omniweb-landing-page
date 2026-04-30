import "server-only"

import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { ensureSaasSchema, getSaasDbPool, hasDatabaseUrl } from "@/lib/saas/db"
import type { AgentConfigRecord, SubscriptionStatus, TenantRecord } from "@/lib/saas/types"

const STORE_DIR = path.join(process.cwd(), ".omniweb")
const STORE_PATH = path.join(STORE_DIR, "saas-state.json")

const DEFAULT_WELCOME_MESSAGE = "Welcome! I’m here to answer questions, recommend the right solution, and help you get the most value from our services. How can I help you today?"
const DEFAULT_GOALS = ["lead_qualification", "customer_support", "sales_assistance"]
const DEFAULT_SUPPORTED_LANGUAGES = ["en"]

type StoreFile = {
  tenants: TenantRecord[]
  agentConfigs: AgentConfigRecord[]
}

let writeQueue: Promise<void> = Promise.resolve()

function mapTenantRow(row: Record<string, unknown>): TenantRecord {
  return {
    id: String(row.id),
    clerkUserId: String(row.clerk_user_id),
    clerkOrgId: row.clerk_org_id ? String(row.clerk_org_id) : null,
    businessName: String(row.business_name ?? ""),
    industry: String(row.industry ?? ""),
    websiteDomain: String(row.website_domain ?? ""),
    trialStartedAt: row.trial_started_at ? new Date(String(row.trial_started_at)).toISOString() : null,
    trialEndsAt: row.trial_ends_at ? new Date(String(row.trial_ends_at)).toISOString() : null,
    subscriptionStatus: (row.subscription_status as SubscriptionStatus) ?? "trialing",
    plan: row.plan ? String(row.plan) as TenantRecord["plan"] : null,
    onboardingCompleted: Boolean(row.onboarding_completed),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

function mapAgentRow(row: Record<string, unknown>): AgentConfigRecord {
  return {
    tenantId: String(row.tenant_id),
    agentName: String(row.agent_name ?? "Omniweb AI"),
    welcomeMessage: String(row.welcome_message ?? DEFAULT_WELCOME_MESSAGE),
    tone: "professional",
    goals: Array.isArray(row.goals)
      ? row.goals.map((goal) => String(goal))
      : DEFAULT_GOALS,
    supportedLanguages: Array.isArray(row.supported_languages)
      ? row.supported_languages.map((language) => String(language))
      : DEFAULT_SUPPORTED_LANGUAGES,
    active: typeof row.active === "boolean" ? row.active : true,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

function emptyStore(): StoreFile {
  return {
    tenants: [],
    agentConfigs: [],
  }
}

async function ensureStoreFile() {
  await mkdir(STORE_DIR, { recursive: true })

  try {
    await readFile(STORE_PATH, "utf8")
  } catch {
    await writeFile(STORE_PATH, JSON.stringify(emptyStore(), null, 2), "utf8")
  }
}

async function readStore(): Promise<StoreFile> {
  await ensureStoreFile()

  try {
    const raw = await readFile(STORE_PATH, "utf8")
    const parsed = JSON.parse(raw) as Partial<StoreFile>
    return {
      tenants: Array.isArray(parsed.tenants) ? parsed.tenants : [],
      agentConfigs: Array.isArray(parsed.agentConfigs) ? parsed.agentConfigs : [],
    }
  } catch {
    return emptyStore()
  }
}

async function writeStore(data: StoreFile) {
  await ensureStoreFile()

  writeQueue = writeQueue.then(async () => {
    await writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8")
  })

  await writeQueue
}

export async function getTenantByClerkUserId(clerkUserId: string) {
  if (hasDatabaseUrl()) {
    await ensureSaasSchema()
    const db = getSaasDbPool()
    const result = await db.query(
      `select * from public.omniweb_tenants where clerk_user_id = $1 limit 1`,
      [clerkUserId],
    )

    return result.rows[0] ? mapTenantRow(result.rows[0]) : null
  }

  const store = await readStore()
  return store.tenants.find((tenant) => tenant.clerkUserId === clerkUserId) ?? null
}

export async function getTenantById(tenantId: string) {
  if (hasDatabaseUrl()) {
    await ensureSaasSchema()
    const db = getSaasDbPool()
    const result = await db.query(
      `select * from public.omniweb_tenants where id = $1 limit 1`,
      [tenantId],
    )

    return result.rows[0] ? mapTenantRow(result.rows[0]) : null
  }

  const store = await readStore()
  return store.tenants.find((tenant) => tenant.id === tenantId) ?? null
}

export async function upsertTenantByClerkUserId(
  clerkUserId: string,
  updates: Partial<TenantRecord> & Pick<TenantRecord, "businessName" | "industry" | "websiteDomain">,
) {
  if (hasDatabaseUrl()) {
    await ensureSaasSchema()
    const db = getSaasDbPool()
    const existing = await getTenantByClerkUserId(clerkUserId)
    const now = new Date().toISOString()
    const nextId = existing?.id ?? randomUUID()

    const result = await db.query(
      `
        insert into public.omniweb_tenants (
          id,
          clerk_user_id,
          clerk_org_id,
          business_name,
          industry,
          website_domain,
          trial_started_at,
          trial_ends_at,
          subscription_status,
          plan,
          onboarding_completed,
          created_at,
          updated_at
        ) values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        )
        on conflict (clerk_user_id)
        do update set
          clerk_org_id = excluded.clerk_org_id,
          business_name = excluded.business_name,
          industry = excluded.industry,
          website_domain = excluded.website_domain,
          trial_started_at = excluded.trial_started_at,
          trial_ends_at = excluded.trial_ends_at,
          subscription_status = excluded.subscription_status,
          plan = excluded.plan,
          onboarding_completed = excluded.onboarding_completed,
          updated_at = excluded.updated_at
        returning *
      `,
      [
        nextId,
        clerkUserId,
        updates.clerkOrgId ?? existing?.clerkOrgId ?? null,
        updates.businessName ?? existing?.businessName ?? "",
        updates.industry ?? existing?.industry ?? "",
        updates.websiteDomain ?? existing?.websiteDomain ?? "",
        updates.trialStartedAt ?? existing?.trialStartedAt ?? null,
        updates.trialEndsAt ?? existing?.trialEndsAt ?? null,
        updates.subscriptionStatus ?? existing?.subscriptionStatus ?? "trialing",
        updates.plan ?? existing?.plan ?? "starter",
        updates.onboardingCompleted ?? existing?.onboardingCompleted ?? false,
        existing?.createdAt ?? now,
        now,
      ],
    )

    return mapTenantRow(result.rows[0])
  }

  const store = await readStore()
  const now = new Date().toISOString()
  const index = store.tenants.findIndex((tenant) => tenant.clerkUserId === clerkUserId)

  const existing = index >= 0 ? store.tenants[index] : null

  const next: TenantRecord = {
    id: existing?.id ?? randomUUID(),
    clerkUserId,
    clerkOrgId: updates.clerkOrgId ?? existing?.clerkOrgId ?? null,
    businessName: updates.businessName ?? existing?.businessName ?? "",
    industry: updates.industry ?? existing?.industry ?? "",
    websiteDomain: updates.websiteDomain ?? existing?.websiteDomain ?? "",
    trialStartedAt: updates.trialStartedAt ?? existing?.trialStartedAt ?? null,
    trialEndsAt: updates.trialEndsAt ?? existing?.trialEndsAt ?? null,
    subscriptionStatus: updates.subscriptionStatus ?? existing?.subscriptionStatus ?? "trialing",
    plan: updates.plan ?? existing?.plan ?? "starter",
    onboardingCompleted: updates.onboardingCompleted ?? existing?.onboardingCompleted ?? false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  if (index >= 0) {
    store.tenants[index] = next
  } else {
    store.tenants.push(next)
  }

  await writeStore(store)
  return next
}

export async function updateTenantSubscriptionStatus(clerkUserId: string, subscriptionStatus: SubscriptionStatus) {
  if (hasDatabaseUrl()) {
    await ensureSaasSchema()
    const db = getSaasDbPool()
    const result = await db.query(
      `
        update public.omniweb_tenants
        set subscription_status = $2, updated_at = now()
        where clerk_user_id = $1
        returning *
      `,
      [clerkUserId, subscriptionStatus],
    )

    return result.rows[0] ? mapTenantRow(result.rows[0]) : null
  }

  const store = await readStore()
  const index = store.tenants.findIndex((tenant) => tenant.clerkUserId === clerkUserId)

  if (index < 0) {
    return null
  }

  store.tenants[index] = {
    ...store.tenants[index],
    subscriptionStatus,
    updatedAt: new Date().toISOString(),
  }

  await writeStore(store)
  return store.tenants[index]
}

export async function getAgentConfigByTenantId(tenantId: string) {
  if (hasDatabaseUrl()) {
    await ensureSaasSchema()
    const db = getSaasDbPool()
    const result = await db.query(
      `select * from public.omniweb_agent_configs where tenant_id = $1 limit 1`,
      [tenantId],
    )

    return result.rows[0] ? mapAgentRow(result.rows[0]) : null
  }

  const store = await readStore()
  return store.agentConfigs.find((config) => config.tenantId === tenantId) ?? null
}

export async function ensureDefaultAgentConfig(tenantId: string) {
  if (hasDatabaseUrl()) {
    await ensureSaasSchema()
    const existing = await getAgentConfigByTenantId(tenantId)

    if (existing) {
      return existing
    }

    const db = getSaasDbPool()
    const result = await db.query(
      `
        insert into public.omniweb_agent_configs (
          tenant_id,
          agent_name,
          welcome_message,
          tone,
          goals,
          supported_languages,
          active
        ) values ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7)
        on conflict (tenant_id) do update set updated_at = now()
        returning *
      `,
      [
        tenantId,
        "Omniweb AI",
        DEFAULT_WELCOME_MESSAGE,
        "professional",
        JSON.stringify(DEFAULT_GOALS),
        JSON.stringify(DEFAULT_SUPPORTED_LANGUAGES),
        true,
      ],
    )

    return mapAgentRow(result.rows[0])
  }

  const store = await readStore()
  const existing = store.agentConfigs.find((config) => config.tenantId === tenantId)

  if (existing) {
    return existing
  }

  const now = new Date().toISOString()
  const next: AgentConfigRecord = {
    tenantId,
    agentName: "Omniweb AI",
    welcomeMessage: DEFAULT_WELCOME_MESSAGE,
    tone: "professional",
    goals: DEFAULT_GOALS,
    supportedLanguages: DEFAULT_SUPPORTED_LANGUAGES,
    active: true,
    createdAt: now,
    updatedAt: now,
  }

  store.agentConfigs.push(next)
  await writeStore(store)
  return next
}

export async function updateAgentConfig(
  tenantId: string,
  updates: Partial<Omit<AgentConfigRecord, "tenantId" | "createdAt" | "updatedAt">>,
) {
  if (hasDatabaseUrl()) {
    await ensureSaasSchema()
    const existing = await ensureDefaultAgentConfig(tenantId)
    const db = getSaasDbPool()
    const result = await db.query(
      `
        update public.omniweb_agent_configs
        set
          agent_name = $2,
          welcome_message = $3,
          tone = $4,
          goals = $5::jsonb,
          supported_languages = $6::jsonb,
          active = $7,
          updated_at = now()
        where tenant_id = $1
        returning *
      `,
      [
        tenantId,
        updates.agentName ?? existing.agentName,
        updates.welcomeMessage ?? existing.welcomeMessage,
        updates.tone ?? existing.tone,
        JSON.stringify(updates.goals ?? existing.goals),
        JSON.stringify(updates.supportedLanguages ?? existing.supportedLanguages),
        updates.active ?? existing.active,
      ],
    )

    return mapAgentRow(result.rows[0])
  }

  const store = await readStore()
  const index = store.agentConfigs.findIndex((config) => config.tenantId === tenantId)
  const now = new Date().toISOString()

  const base = index >= 0
    ? store.agentConfigs[index]
    : {
        tenantId,
        agentName: "Omniweb AI",
        welcomeMessage: DEFAULT_WELCOME_MESSAGE,
        tone: "professional" as const,
        goals: DEFAULT_GOALS,
        supportedLanguages: DEFAULT_SUPPORTED_LANGUAGES,
        active: true,
        createdAt: now,
        updatedAt: now,
      }

  const next: AgentConfigRecord = {
    ...base,
    ...updates,
    tenantId,
    updatedAt: now,
  }

  if (index >= 0) {
    store.agentConfigs[index] = next
  } else {
    store.agentConfigs.push(next)
  }

  await writeStore(store)
  return next
}

export function buildWidgetEmbedCode(tenantId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://YOUR_DOMAIN"
  return `<script src="${appUrl}/widget.js" data-tenant-id="${tenantId}" async></script>`
}
