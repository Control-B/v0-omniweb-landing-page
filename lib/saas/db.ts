import "server-only"

import { Pool } from "pg"

let pool: Pool | null = null
let schemaReadyPromise: Promise<void> | null = null

function shouldUseSsl(connectionString: string) {
  return /sslmode=require/i.test(connectionString) || /render\.com|supabase|railway|neon\.tech/i.test(connectionString)
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL)
}

export function getSaasDbPool() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured")
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
    })
  }

  return pool
}

export async function ensureSaasSchema() {
  if (!hasDatabaseUrl()) {
    return
  }

  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const db = getSaasDbPool()
      await db.query(`
        create extension if not exists pgcrypto;

        create table if not exists public.omniweb_tenants (
          id uuid primary key default gen_random_uuid(),
          clerk_user_id text not null unique,
          clerk_org_id text,
          business_name text not null default '',
          industry text not null default '',
          website_domain text not null default '',
          trial_started_at timestamptz,
          trial_ends_at timestamptz,
          subscription_status text not null default 'trialing' check (subscription_status in ('trialing', 'active', 'expired', 'canceled')),
          plan text check (plan in ('starter', 'pro', 'business')),
          onboarding_completed boolean not null default false,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        );

        create table if not exists public.omniweb_agent_configs (
          tenant_id uuid primary key references public.omniweb_tenants(id) on delete cascade,
          agent_name text not null default 'Omniweb AI',
          welcome_message text not null default 'Welcome! I’m here to answer questions, recommend the right solution, and help you get the most value from our services. How can I help you today?',
          tone text not null default 'professional' check (tone in ('professional')),
          goals jsonb not null default '["lead_qualification","customer_support","sales_assistance"]'::jsonb,
          supported_languages jsonb not null default '["en"]'::jsonb,
          active boolean not null default true,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        );

        alter table public.omniweb_agent_configs
        add column if not exists supported_languages jsonb not null default '["en"]'::jsonb;

        create index if not exists omniweb_tenants_subscription_status_idx on public.omniweb_tenants(subscription_status);
        create index if not exists omniweb_tenants_trial_ends_at_idx on public.omniweb_tenants(trial_ends_at);
      `)
    })().catch((error) => {
      schemaReadyPromise = null
      throw error
    })
  }

  await schemaReadyPromise
}
