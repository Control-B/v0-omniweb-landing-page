-- Create documents table for knowledge base
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create embeddings table for vector search (RAG)
create table if not exists public.embeddings (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade,
  content text not null,
  embedding vector(1536), -- OpenAI ada-002 embedding size
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.documents enable row level security;
alter table public.embeddings enable row level security;

-- Public read access for documents and embeddings (knowledge base is public)
create policy "documents_select_public" on public.documents for select using (true);
create policy "embeddings_select_public" on public.embeddings for select using (true);

-- Only service role can insert/update/delete documents
create policy "documents_insert_service" on public.documents for insert with check (false);
create policy "documents_update_service" on public.documents for update using (false);
create policy "documents_delete_service" on public.documents for delete using (false);

create policy "embeddings_insert_service" on public.embeddings for insert with check (false);
create policy "embeddings_update_service" on public.embeddings for update using (false);
create policy "embeddings_delete_service" on public.embeddings for delete using (false);

-- Create index for vector similarity search
create index if not exists embeddings_embedding_idx on public.embeddings 
using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Function to search for similar embeddings
create or replace function match_embeddings(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    embeddings.id,
    embeddings.document_id,
    embeddings.content,
    embeddings.metadata,
    1 - (embeddings.embedding <=> query_embedding) as similarity
  from embeddings
  where 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  order by embeddings.embedding <=> query_embedding
  limit match_count;
$$;
