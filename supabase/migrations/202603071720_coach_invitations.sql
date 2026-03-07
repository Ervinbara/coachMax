create table if not exists public.coach_invitations (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  client_email text not null,
  client_id uuid null references public.profiles(id) on delete set null,
  status text not null default 'pending',
  message text null,
  created_at timestamptz not null default now(),
  responded_at timestamptz null,
  constraint coach_invitations_status_check check (status in ('pending', 'accepted', 'declined', 'cancelled', 'expired'))
);

create index if not exists idx_coach_invitations_coach_status
  on public.coach_invitations (coach_id, status, created_at desc);

create index if not exists idx_coach_invitations_client_email_status
  on public.coach_invitations (lower(client_email), status, created_at desc);

alter table public.coach_invitations enable row level security;

drop policy if exists "coach_invitations_select" on public.coach_invitations;
create policy "coach_invitations_select"
on public.coach_invitations
for select
using (
  coach_id = auth.uid()
  or lower(client_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "coach_invitations_insert_coach" on public.coach_invitations;
create policy "coach_invitations_insert_coach"
on public.coach_invitations
for insert
with check (
  coach_id = auth.uid()
  and status = 'pending'
);

drop policy if exists "coach_invitations_update_coach" on public.coach_invitations;
create policy "coach_invitations_update_coach"
on public.coach_invitations
for update
using (coach_id = auth.uid())
with check (coach_id = auth.uid());

create or replace function public.accept_coach_invitation(p_invitation_id uuid)
returns table(success boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_invite public.coach_invitations%rowtype;
begin
  if v_user_id is null then
    return query select false, 'Session introuvable.';
    return;
  end if;

  if v_email = '' then
    return query select false, 'Email utilisateur introuvable.';
    return;
  end if;

  select *
  into v_invite
  from public.coach_invitations
  where id = p_invitation_id
  for update;

  if not found then
    return query select false, 'Invitation introuvable.';
    return;
  end if;

  if v_invite.status <> 'pending' then
    return query select false, 'Invitation deja traitee.';
    return;
  end if;

  if lower(v_invite.client_email) <> v_email then
    return query select false, 'Invitation non autorisee pour ce compte.';
    return;
  end if;

  insert into public.coach_clients (coach_id, client_id, status)
  values (v_invite.coach_id, v_user_id, 'active')
  on conflict (coach_id, client_id)
  do update set status = 'active';

  update public.coach_invitations
  set status = 'accepted',
      client_id = v_user_id,
      responded_at = now()
  where id = v_invite.id;

  return query select true, 'Invitation acceptee.';
end;
$$;

grant execute on function public.accept_coach_invitation(uuid) to authenticated;
