create table if not exists public.exercise_library (
  id uuid primary key default gen_random_uuid(),
  external_id bigint not null unique,
  source text not null default 'wger',
  language text not null default 'fr',
  name text not null,
  description text null,
  category text null,
  equipment text[] not null default '{}',
  muscles text[] not null default '{}',
  last_sync_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_exercise_library_name on public.exercise_library (name);
create index if not exists idx_exercise_library_category on public.exercise_library (category);
create index if not exists idx_exercise_library_muscles on public.exercise_library using gin (muscles);
create index if not exists idx_exercise_library_equipment on public.exercise_library using gin (equipment);

alter table public.exercise_library enable row level security;

drop policy if exists "exercise_library_select_authenticated" on public.exercise_library;
create policy "exercise_library_select_authenticated"
on public.exercise_library
for select
using (auth.role() = 'authenticated');

drop policy if exists "exercise_library_write_coach" on public.exercise_library;
create policy "exercise_library_write_coach"
on public.exercise_library
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'coach'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'coach'
  )
);

create or replace function public.handle_exercise_library_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_exercise_library_updated_at on public.exercise_library;
create trigger trg_exercise_library_updated_at
before update on public.exercise_library
for each row
execute function public.handle_exercise_library_updated_at();
