-- Create conversations and messages tables for chat
-- Conversations track threads between two users (optionally about a garage or spare part)
create extension if not exists pgcrypto;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_one uuid not null,
  participant_two uuid not null,
  garage_id uuid null,
  spare_part_id uuid null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Client should ensure participants are stored in a deterministic order (e.g. smaller uuid as participant_one)
create unique index if not exists conversations_unique_idx on public.conversations (participant_one, participant_two, garage_id, spare_part_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid not null,
  content text not null,
  "read" boolean default false not null,
  created_at timestamptz default now() not null
);

-- Trigger to keep updated_at in conversations
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_conversations_updated_at
before update on public.conversations
for each row execute function public.update_updated_at_column();

-- Enable RLS (policies added in separate migration file)
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
