-- Create contact form submissions table
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  message text not null,
  status text default 'new' check (status in ('new', 'read', 'responded', 'archived')),
  created_at timestamp with time zone default now()
);

-- Create newsletter subscribers table
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed_at timestamp with time zone default now(),
  unsubscribed_at timestamp with time zone
);

-- Enable RLS
alter table public.contact_submissions enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Public can insert contact submissions and newsletter signups
create policy "contact_insert_public" on public.contact_submissions for insert with check (true);
create policy "newsletter_insert_public" on public.newsletter_subscribers for insert with check (true);

-- Only authenticated admins can read (we'll handle this via service role)
create policy "contact_select_service" on public.contact_submissions for select using (false);
create policy "newsletter_select_service" on public.newsletter_subscribers for select using (false);
