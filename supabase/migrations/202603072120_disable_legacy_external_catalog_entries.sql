update public.exercise_catalog
set is_active = false,
    updated_at = now()
where slug like 'legacy-%';
