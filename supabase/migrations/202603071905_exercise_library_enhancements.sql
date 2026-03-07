alter table public.exercise_library
  add column if not exists image_url text null,
  add column if not exists muscle_group_fr text null;

create index if not exists idx_exercise_library_muscle_group_fr
  on public.exercise_library (muscle_group_fr);
