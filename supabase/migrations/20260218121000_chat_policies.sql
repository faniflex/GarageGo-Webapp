-- RLS policies and helper functions for conversations and messages

-- Helper: check if a user is participant of a conversation
create or replace function public.is_conversation_participant(conv_id uuid, uid uuid)
returns boolean stable as $$
  select exists(
    select 1 from public.conversations c where c.id = conv_id and (c.participant_one = uid or c.participant_two = uid)
  );
$$ language sql security definer;

-- Allow conversation participants to select and insert conversations
drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant" on public.conversations
  for select using (participant_one = auth.uid() or participant_two = auth.uid());

drop policy if exists "conversations_insert_participant" on public.conversations;
create policy "conversations_insert_participant" on public.conversations
  for insert with check (participant_one = auth.uid() or participant_two = auth.uid());

-- Allow message participants to select and insert messages
drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant" on public.messages
  for select using (public.is_conversation_participant(conversation_id, auth.uid()));

drop policy if exists "messages_insert_participant" on public.messages;
create policy "messages_insert_participant" on public.messages
  for insert with check (public.is_conversation_participant(conversation_id, auth.uid()) and sender_id = auth.uid());

-- Admin policies: allow admins full read access for moderation
-- Assumes existence of has_role(user_uuid, role_text) function
drop policy if exists "admin_select_conversations" on public.conversations;
create policy "admin_select_conversations" on public.conversations
  for select using (has_role(auth.uid(), 'admin'));

drop policy if exists "admin_select_messages" on public.messages;
create policy "admin_select_messages" on public.messages
  for select using (has_role(auth.uid(), 'admin'));

-- Admin insert/update/delete policies are optional; only allow select for moderation by default
