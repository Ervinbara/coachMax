create extension if not exists "pgcrypto";
create type app_role as enum ('coach','client');
create type message_sender as enum ('coach','client');
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role app_role not null default 'client',
  created_at timestamptz not null default now()
);
create table if not exists public.coach_clients (
  coach_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  primary key (coach_id, client_id),
  check (coach_id <> client_id)
);
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  duration_weeks int not null default 8,
  created_at timestamptz not null default now()
);
create table if not exists public.program_sessions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  day text not null,
  focus text not null,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.nutrition_plans (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  target_calories int not null,
  protein_target int not null,
  carb_target int not null,
  fat_target int not null,
  created_at timestamptz not null default now()
);
create table if not exists public.nutrition_meals (
  id uuid primary key default gen_random_uuid(),
  nutrition_plan_id uuid not null references public.nutrition_plans(id) on delete cascade,
  meal_time text not null,
  label text not null,
  calories int not null,
  proteins int not null,
  carbs int not null,
  fats int not null
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  sender message_sender not null,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_coach_clients_client_id on public.coach_clients (client_id);
create index if not exists idx_programs_client_coach on public.programs (client_id, coach_id);
create index if not exists idx_nutrition_plans_client_coach on public.nutrition_plans (client_id, coach_id);
create index if not exists idx_messages_client_coach_created on public.messages (client_id, coach_id, created_at desc);
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), 'client')
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
alter table public.profiles enable row level security;
alter table public.coach_clients enable row level security;
alter table public.programs enable row level security;
alter table public.program_sessions enable row level security;
alter table public.nutrition_plans enable row level security;
alter table public.nutrition_meals enable row level security;
alter table public.messages enable row level security;
drop policy if exists "profiles_select_self_or_linked" on public.profiles;
create policy "profiles_select_self_or_linked" on public.profiles
for select using (
  id = auth.uid()
  or exists (
    select 1 from public.coach_clients cc
    where (cc.coach_id = auth.uid() and cc.client_id = profiles.id)
       or (cc.client_id = auth.uid() and cc.coach_id = profiles.id)
  )
);
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
for update using (id = auth.uid());
drop policy if exists "coach_clients_select_linked" on public.coach_clients;
create policy "coach_clients_select_linked" on public.coach_clients
for select using (coach_id = auth.uid() or client_id = auth.uid());
drop policy if exists "coach_clients_insert_by_coach" on public.coach_clients;
create policy "coach_clients_insert_by_coach" on public.coach_clients
for insert with check (coach_id = auth.uid());
drop policy if exists "programs_select_linked" on public.programs;
create policy "programs_select_linked" on public.programs
for select using (coach_id = auth.uid() or client_id = auth.uid());
drop policy if exists "programs_write_coach" on public.programs;
create policy "programs_write_coach" on public.programs
for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());
drop policy if exists "sessions_select_linked" on public.program_sessions;
create policy "sessions_select_linked" on public.program_sessions
for select using (
  exists (
    select 1 from public.programs p
    where p.id = program_sessions.program_id
      and (p.coach_id = auth.uid() or p.client_id = auth.uid())
  )
);
drop policy if exists "sessions_write_coach" on public.program_sessions;
create policy "sessions_write_coach" on public.program_sessions
for all using (
  exists (
    select 1 from public.programs p
    where p.id = program_sessions.program_id
      and p.coach_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.programs p
    where p.id = program_sessions.program_id
      and p.coach_id = auth.uid()
  )
);
drop policy if exists "nutrition_select_linked" on public.nutrition_plans;
create policy "nutrition_select_linked" on public.nutrition_plans
for select using (coach_id = auth.uid() or client_id = auth.uid());
drop policy if exists "nutrition_write_coach" on public.nutrition_plans;
create policy "nutrition_write_coach" on public.nutrition_plans
for all using (coach_id = auth.uid()) with check (coach_id = auth.uid());
drop policy if exists "meals_select_linked" on public.nutrition_meals;
create policy "meals_select_linked" on public.nutrition_meals
for select using (
  exists (
    select 1 from public.nutrition_plans np
    where np.id = nutrition_meals.nutrition_plan_id
      and (np.coach_id = auth.uid() or np.client_id = auth.uid())
  )
);
drop policy if exists "meals_write_coach" on public.nutrition_meals;
create policy "meals_write_coach" on public.nutrition_meals
for all using (
  exists (
    select 1 from public.nutrition_plans np
    where np.id = nutrition_meals.nutrition_plan_id
      and np.coach_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.nutrition_plans np
    where np.id = nutrition_meals.nutrition_plan_id
      and np.coach_id = auth.uid()
  )
);
drop policy if exists "messages_select_linked" on public.messages;
create policy "messages_select_linked" on public.messages
for select using (coach_id = auth.uid() or client_id = auth.uid());
drop policy if exists "messages_insert_linked" on public.messages;
create policy "messages_insert_linked" on public.messages
for insert with check (coach_id = auth.uid() or client_id = auth.uid());
