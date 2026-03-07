drop trigger if exists trg_exercise_library_updated_at on public.exercise_library;
drop function if exists public.handle_exercise_library_updated_at();

drop policy if exists "exercise_library_select_authenticated" on public.exercise_library;
drop policy if exists "exercise_library_write_coach" on public.exercise_library;

drop table if exists public.exercise_library cascade;
