alter table public.messages
  add column if not exists read_at timestamptz;

create index if not exists idx_messages_unread
  on public.messages (coach_id, client_id, sender, read_at)
  where read_at is null;
