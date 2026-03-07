create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean, false);
$$;
alter table public.profiles
  add column if not exists status text not null default 'active';
alter table public.profiles
  drop constraint if exists profiles_status_check;
alter table public.profiles
  add constraint profiles_status_check check (status in ('active', 'disabled'));
drop policy if exists "profiles_select_super_admin" on public.profiles;
create policy "profiles_select_super_admin" on public.profiles
for select using (public.is_super_admin());
drop policy if exists "profiles_update_super_admin" on public.profiles;
create policy "profiles_update_super_admin" on public.profiles
for update using (public.is_super_admin()) with check (public.is_super_admin());
drop policy if exists "coach_clients_select_super_admin" on public.coach_clients;
create policy "coach_clients_select_super_admin" on public.coach_clients
for select using (public.is_super_admin());
drop policy if exists "programs_select_super_admin" on public.programs;
create policy "programs_select_super_admin" on public.programs
for select using (public.is_super_admin());
drop policy if exists "sessions_select_super_admin" on public.program_sessions;
create policy "sessions_select_super_admin" on public.program_sessions
for select using (public.is_super_admin());
drop policy if exists "nutrition_select_super_admin" on public.nutrition_plans;
create policy "nutrition_select_super_admin" on public.nutrition_plans
for select using (public.is_super_admin());
drop policy if exists "meals_select_super_admin" on public.nutrition_meals;
create policy "meals_select_super_admin" on public.nutrition_meals
for select using (public.is_super_admin());
drop policy if exists "messages_select_super_admin" on public.messages;
create policy "messages_select_super_admin" on public.messages
for select using (public.is_super_admin());
