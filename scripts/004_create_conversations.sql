-- Create conversations table for chatbot history
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create messages table for conversation messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default now()
);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Conversations policies (allow both authenticated users and anonymous via session_id)
create policy "conversations_select" on public.conversations for select using (
  auth.uid() = user_id or user_id is null
);
create policy "conversations_insert" on public.conversations for insert with check (
  auth.uid() = user_id or user_id is null
);
create policy "conversations_update" on public.conversations for update using (
  auth.uid() = user_id or user_id is null
);

-- Messages policies
create policy "messages_select" on public.messages for select using (
  exists (
    select 1 from public.conversations c 
    where c.id = conversation_id 
    and (c.user_id = auth.uid() or c.user_id is null)
  )
);
create policy "messages_insert" on public.messages for insert with check (
  exists (
    select 1 from public.conversations c 
    where c.id = conversation_id 
    and (c.user_id = auth.uid() or c.user_id is null)
  )
);

-- Create indexes for performance
create index if not exists conversations_user_id_idx on public.conversations(user_id);
create index if not exists conversations_session_id_idx on public.conversations(session_id);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
