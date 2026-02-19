-- Admin policies for garages, spare_parts, profiles and enable realtime for messages

-- Garages: allow admins to update any garage (e.g., toggle verification)
alter table public.garages enable row level security;
drop policy if exists "garages_allow_admin_update" on public.garages;
create policy "garages_allow_admin_update" on public.garages
  for update using (has_role(auth.uid(), 'admin')) with check (has_role(auth.uid(), 'admin'));

-- Spare parts: allow admins to select/update all spare parts (including unavailable)
alter table public.spare_parts enable row level security;
drop policy if exists "spare_parts_admin_full_access" on public.spare_parts;
create policy "spare_parts_admin_full_access" on public.spare_parts
  for select using (has_role(auth.uid(), 'admin'));
create policy "spare_parts_admin_update" on public.spare_parts
  for update using (has_role(auth.uid(), 'admin')) with check (has_role(auth.uid(), 'admin'));

-- Profiles: allow admins to view all profiles
alter table public.profiles enable row level security;
drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select" on public.profiles
  for select using (has_role(auth.uid(), 'admin'));

-- Optionally: allow admins to select conversations/messages for moderation
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
drop policy if exists "admin_full_conversations" on public.conversations;
create policy "admin_full_conversations" on public.conversations
  for select using (has_role(auth.uid(), 'admin'));
drop policy if exists "admin_full_messages" on public.messages;
create policy "admin_full_messages" on public.messages
  for select using (has_role(auth.uid(), 'admin'));

-- Enable realtime replication for messages table (so clients can subscribe to inserts)
-- Note: supabase_realtime publication must exist in the DB; this adds the messages table to it
alter publication supabase_realtime add table public.messages;
