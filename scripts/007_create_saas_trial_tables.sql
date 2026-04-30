create table if not exists public.omniweb_tenants (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  clerk_org_id text,
  business_name text not null,
  industry text not null,
  website_domain text not null,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  subscription_started_at timestamptz,
  subscription_ends_at timestamptz,
  subscription_status text not null default 'trialing' check (subscription_status in ('trialing', 'active', 'expired', 'canceled')),
  plan text default 'starter' check (plan in ('starter', 'standard', 'business')),
  stripe_customer_id text,
  stripe_subscription_id text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.omniweb_tenants add column if not exists subscription_started_at timestamptz;
alter table public.omniweb_tenants add column if not exists subscription_ends_at timestamptz;
alter table public.omniweb_tenants add column if not exists stripe_customer_id text;
alter table public.omniweb_tenants add column if not exists stripe_subscription_id text;
update public.omniweb_tenants set plan = 'standard' where plan = 'pro';
alter table public.omniweb_tenants drop constraint if exists omniweb_tenants_plan_check;
alter table public.omniweb_tenants add constraint omniweb_tenants_plan_check check (plan in ('starter', 'standard', 'business'));

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

create table if not exists public.omniweb_telephony_configs (
  tenant_id uuid primary key references public.omniweb_tenants(id) on delete cascade,
  omniweb_phone_agent_id text not null default 'agent_xxxxxxxxxx',
  ai_phone_number text not null default '+15551234567',
  escalation_phone text not null default '+15557654321',
  escalation_email text not null default 'owner@example.com',
  escalation_message text not null default 'Let me connect you with a human who can help with this directly.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.omniweb_engagements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.omniweb_tenants(id) on delete cascade,
  session_id text not null,
  channel text not null check (channel in ('website_chat', 'ai_voice_call', 'ai_telephony', 'shopify_storefront')),
  source_url text not null default '',
  language text not null default 'en',
  visitor_name text,
  visitor_email text,
  visitor_phone text,
  lead_status text not null default 'new' check (lead_status in ('new', 'qualified', 'needs_follow_up', 'not_qualified', 'resolved')),
  intent text not null default 'other' check (intent in ('product_question', 'pricing_question', 'service_inquiry', 'support_request', 'booking_request_quote', 'complaint', 'other')),
  contact_captured boolean not null default false,
  qualified boolean not null default false,
  follow_up_needed boolean not null default false,
  summary_short text,
  summary_full text,
  transcript text,
  lead_score integer,
  pain_points jsonb not null default '[]'::jsonb,
  buying_signals jsonb not null default '[]'::jsonb,
  objections jsonb not null default '[]'::jsonb,
  key_questions jsonb not null default '[]'::jsonb,
  products_or_services jsonb not null default '[]'::jsonb,
  recommended_next_action text,
  owner_notes text,
  message_count integer not null default 0,
  summary_source text,
  summary_is_placeholder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.omniweb_follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.omniweb_tenants(id) on delete cascade,
  engagement_id uuid not null references public.omniweb_engagements(id) on delete cascade,
  instruction text not null,
  channel text not null check (channel in ('email', 'sms', 'voice_call', 'website_chat')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'canceled')),
  internal_note text,
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists omniweb_tenants_subscription_status_idx on public.omniweb_tenants(subscription_status);
create index if not exists omniweb_tenants_trial_ends_at_idx on public.omniweb_tenants(trial_ends_at);
create index if not exists omniweb_engagements_tenant_created_idx on public.omniweb_engagements(tenant_id, created_at desc);
create index if not exists omniweb_engagements_tenant_status_idx on public.omniweb_engagements(tenant_id, lead_status);
create index if not exists omniweb_follow_up_tasks_tenant_created_idx on public.omniweb_follow_up_tasks(tenant_id, created_at desc);
