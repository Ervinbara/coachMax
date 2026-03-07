create extension if not exists unaccent;
create extension if not exists pg_trgm;

create table if not exists public.exercise_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_fr text not null,
  description_fr text null,
  muscle_group_fr text not null,
  primary_muscles_fr text[] not null default '{}',
  secondary_muscles_fr text[] not null default '{}',
  movement_pattern_fr text null,
  difficulty text not null default 'intermediaire',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exercise_catalog_difficulty_check check (difficulty in ('debutant', 'intermediaire', 'avance'))
);

create table if not exists public.exercise_variant (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercise_catalog(id) on delete cascade,
  name_fr text not null,
  equipment_fr text not null default 'Poids du corps',
  unilateral boolean not null default false,
  grip_fr text null,
  stance_fr text null,
  tempo_default text null,
  image_url text null,
  video_url text null,
  cues_fr text[] not null default '{}',
  common_mistakes_fr text[] not null default '{}',
  searchable_text text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_exercise_catalog_group on public.exercise_catalog (muscle_group_fr);
create index if not exists idx_exercise_catalog_name_trgm on public.exercise_catalog using gin (name_fr gin_trgm_ops);
create index if not exists idx_exercise_variant_exercise on public.exercise_variant (exercise_id);
create index if not exists idx_exercise_variant_equipment on public.exercise_variant (equipment_fr);
create index if not exists idx_exercise_variant_name_trgm on public.exercise_variant using gin (name_fr gin_trgm_ops);
create index if not exists idx_exercise_variant_searchable_trgm on public.exercise_variant using gin (searchable_text gin_trgm_ops);

create or replace function public.refresh_exercise_variant_searchable()
returns trigger
language plpgsql
as $$
begin
  new.searchable_text := trim(
    coalesce(new.name_fr, '') || ' ' ||
    coalesce(new.equipment_fr, '') || ' ' ||
    coalesce(new.grip_fr, '') || ' ' ||
    coalesce(new.stance_fr, '') || ' ' ||
    array_to_string(coalesce(new.cues_fr, '{}'), ' ') || ' ' ||
    array_to_string(coalesce(new.common_mistakes_fr, '{}'), ' ')
  );
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_exercise_variant_searchable on public.exercise_variant;
create trigger trg_exercise_variant_searchable
before insert or update on public.exercise_variant
for each row
execute function public.refresh_exercise_variant_searchable();

create or replace function public.refresh_exercise_catalog_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_exercise_catalog_updated_at on public.exercise_catalog;
create trigger trg_exercise_catalog_updated_at
before update on public.exercise_catalog
for each row
execute function public.refresh_exercise_catalog_updated_at();

alter table public.exercise_catalog enable row level security;
alter table public.exercise_variant enable row level security;

drop policy if exists "exercise_catalog_select_authenticated" on public.exercise_catalog;
create policy "exercise_catalog_select_authenticated"
on public.exercise_catalog
for select
using (auth.role() = 'authenticated');

drop policy if exists "exercise_variant_select_authenticated" on public.exercise_variant;
create policy "exercise_variant_select_authenticated"
on public.exercise_variant
for select
using (auth.role() = 'authenticated');

drop policy if exists "exercise_catalog_write_coach" on public.exercise_catalog;
create policy "exercise_catalog_write_coach"
on public.exercise_catalog
for all
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach')
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach')
);

drop policy if exists "exercise_variant_write_coach" on public.exercise_variant;
create policy "exercise_variant_write_coach"
on public.exercise_variant
for all
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach')
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'coach')
);

create or replace function public.search_exercise_variants(
  p_query text default null,
  p_muscle_group text default null,
  p_equipment text default null,
  p_limit int default 80
)
returns table(
  variant_id uuid,
  exercise_id uuid,
  exercise_name_fr text,
  variant_name_fr text,
  muscle_group_fr text,
  equipment_fr text,
  description_fr text,
  image_url text,
  score numeric
)
language sql
stable
as $$
  with q as (
    select nullif(trim(unaccent(lower(coalesce(p_query, '')))), '') as query
  ),
  terms as (
    select regexp_split_to_array((select query from q), '\s+') as arr
  ),
  base as (
    select
      v.id as variant_id,
      e.id as exercise_id,
      e.name_fr as exercise_name_fr,
      v.name_fr as variant_name_fr,
      e.muscle_group_fr,
      v.equipment_fr,
      e.description_fr,
      v.image_url,
      unaccent(lower(e.name_fr || ' ' || v.name_fr || ' ' || coalesce(v.searchable_text, '') || ' ' || coalesce(e.description_fr, '') || ' ' || e.muscle_group_fr || ' ' || v.equipment_fr)) as search_blob
    from public.exercise_variant v
    join public.exercise_catalog e on e.id = v.exercise_id
    where e.is_active = true
      and v.is_active = true
      and (p_muscle_group is null or p_muscle_group = '' or e.muscle_group_fr = p_muscle_group)
      and (p_equipment is null or p_equipment = '' or v.equipment_fr = p_equipment)
  ),
  filtered as (
    select b.*
    from base b, q
    where
      (q.query is null)
      or not exists (
        select 1
        from unnest((select arr from terms)) t(term)
        where term <> '' and b.search_blob not like '%' || term || '%'
      )
  )
  select
    f.variant_id,
    f.exercise_id,
    f.exercise_name_fr,
    f.variant_name_fr,
    f.muscle_group_fr,
    f.equipment_fr,
    f.description_fr,
    f.image_url,
    (
      case when q.query is null then 0 else similarity(f.search_blob, q.query) end
      + case when q.query is null then 0 else (case when f.search_blob like q.query || '%' then 0.4 else 0 end) end
    )::numeric as score
  from filtered f, q
  order by score desc, f.exercise_name_fr asc, f.variant_name_fr asc
  limit greatest(coalesce(p_limit, 80), 1);
$$;

grant execute on function public.search_exercise_variants(text, text, text, int) to authenticated;

insert into public.exercise_catalog (slug, name_fr, description_fr, muscle_group_fr, primary_muscles_fr, secondary_muscles_fr, movement_pattern_fr, difficulty)
values
  ('squat', 'Squat', 'Mouvement fondamental de flexion de jambes.', 'Jambes', array['Quadriceps', 'Fessiers'], array['Ischio-jambiers'], 'Squat', 'debutant'),
  ('deadlift', 'Souleve de terre', 'Mouvement de charniere hanche puissant.', 'Dos', array['Dos', 'Ischio-jambiers'], array['Fessiers'], 'Hinge', 'intermediaire'),
  ('bench-press', 'Developpe couche', 'Poussee horizontale pour les pectoraux.', 'Pectoraux', array['Pectoraux', 'Triceps'], array['Epaules'], 'Push', 'intermediaire'),
  ('pull-up', 'Traction', 'Tirage vertical poids du corps.', 'Dos', array['Dos', 'Biceps'], array['Abdominaux'], 'Pull', 'intermediaire'),
  ('overhead-press', 'Developpe militaire', 'Poussee verticale des epaules.', 'Epaules', array['Epaules', 'Triceps'], array['Abdominaux'], 'Push', 'intermediaire'),
  ('row', 'Rowing', 'Tirage horizontal pour le dos.', 'Dos', array['Dos', 'Biceps'], array['Epaules'], 'Pull', 'debutant'),
  ('hip-thrust', 'Hip Thrust', 'Extension de hanche cible fessiers.', 'Fessiers', array['Fessiers'], array['Ischio-jambiers'], 'Hinge', 'debutant'),
  ('lunge', 'Fentes', 'Mouvement unilateral des jambes.', 'Jambes', array['Quadriceps', 'Fessiers'], array['Ischio-jambiers'], 'Squat', 'debutant'),
  ('plank', 'Planche', 'Gainage statique du tronc.', 'Abdominaux', array['Abdominaux'], array['Epaules'], 'Core', 'debutant'),
  ('curl', 'Curl biceps', 'Flexion de coude pour biceps.', 'Bras', array['Biceps'], array[]::text[], 'Isolation', 'debutant'),
  ('triceps-extension', 'Extension triceps', 'Extension coude pour triceps.', 'Bras', array['Triceps'], array[]::text[], 'Isolation', 'debutant'),
  ('calf-raise', 'Elevations mollets', 'Extension cheville pour mollets.', 'Jambes', array['Mollets'], array[]::text[], 'Isolation', 'debutant')
on conflict (slug) do update
set
  name_fr = excluded.name_fr,
  description_fr = excluded.description_fr,
  muscle_group_fr = excluded.muscle_group_fr,
  primary_muscles_fr = excluded.primary_muscles_fr,
  secondary_muscles_fr = excluded.secondary_muscles_fr,
  movement_pattern_fr = excluded.movement_pattern_fr,
  difficulty = excluded.difficulty,
  updated_at = now();

insert into public.exercise_variant (exercise_id, name_fr, equipment_fr, unilateral, image_url, cues_fr, common_mistakes_fr)
select e.id, v.name_fr, v.equipment_fr, v.unilateral, v.image_url, v.cues_fr, v.common_mistakes_fr
from (
  values
    ('squat', 'Squat poids du corps', 'Poids du corps', false, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80', array['Dos droit', 'Genoux alignes'], array['Dos arrondi']),
    ('squat', 'Back Squat barre', 'Barre', false, 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=400&q=80', array['Gainage fort', 'Controle descente'], array['Talons qui decollent']),
    ('deadlift', 'Souleve de terre barre', 'Barre', false, 'https://images.unsplash.com/photo-1517963628607-235ccdd5476d?w=400&q=80', array['Barre proche du corps'], array['Dos rond']),
    ('deadlift', 'Souleve de terre halteres', 'Halteres', false, 'https://images.unsplash.com/photo-1584863231364-2edc166de576?w=400&q=80', array['Charniere hanche'], array['Traction bras']),
    ('bench-press', 'Developpe couche barre', 'Barre', false, 'https://images.unsplash.com/photo-1598971639058-999ec7f5e9c5?w=400&q=80', array['Pieds stables'], array['Epaules remontees']),
    ('bench-press', 'Developpe couche halteres', 'Halteres', false, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', array['Amplitude controlee'], array['Poignets casses']),
    ('pull-up', 'Traction pronation', 'Poids du corps', false, 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=400&q=80', array['Tirer les coudes'], array['Balancement']),
    ('pull-up', 'Traction assistee elastique', 'Elastique', false, 'https://images.unsplash.com/photo-1544216717-3bbf52512659?w=400&q=80', array['Controle vitesse'], array['Tension elastique faible']),
    ('overhead-press', 'Developpe militaire barre', 'Barre', false, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80', array['Fesses serrees'], array['Hyperlordose']),
    ('overhead-press', 'Developpe epaules halteres assis', 'Halteres', false, 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&q=80', array['Trajectoire verticale'], array['Coude trop bas']),
    ('row', 'Rowing barre buste penche', 'Barre', false, 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80', array['Dos neutre'], array['Dos arrondi']),
    ('row', 'Rowing un bras haltere', 'Halteres', true, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80', array['Tirer coude vers hanche'], array['Rotation du buste']),
    ('hip-thrust', 'Hip Thrust barre', 'Barre', false, 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80', array['Verrouiller en haut'], array['Hyperextension lombaire']),
    ('hip-thrust', 'Hip Thrust poids du corps', 'Poids du corps', false, 'https://images.unsplash.com/photo-1571388208497-71bedc66e932?w=400&q=80', array['Pousser par les talons'], array['Genoux qui rentrent']),
    ('lunge', 'Fente avant alternee', 'Poids du corps', true, 'https://images.unsplash.com/photo-1549476464-37392f717541?w=400&q=80', array['Grand pas controle'], array['Genou interieur']),
    ('lunge', 'Fente marchée halteres', 'Halteres', true, 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee4?w=400&q=80', array['Tronc gainé'], array['Petit pas']),
    ('plank', 'Planche avant', 'Poids du corps', false, 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80', array['Alignement tete-hanches'], array['Bassin trop bas']),
    ('plank', 'Planche laterale', 'Poids du corps', true, 'https://images.unsplash.com/photo-1518310952931-b1de897abd40?w=400&q=80', array['Corps en ligne'], array['Rotation epaules']),
    ('curl', 'Curl biceps halteres', 'Halteres', false, 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80', array['Coudes fixes'], array['Elan du buste']),
    ('curl', 'Curl biceps barre EZ', 'Barre EZ', false, 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80', array['Amplitude complete'], array['Poignets casses']),
    ('triceps-extension', 'Extension triceps poulie corde', 'Poulie', false, 'https://images.unsplash.com/photo-1518459031867-a89b944bffe4?w=400&q=80', array['Coudes serres'], array['Epaules qui avancent']),
    ('triceps-extension', 'Skull crusher barre EZ', 'Barre EZ', false, 'https://images.unsplash.com/photo-1594737625785-c90f1c6b6dc8?w=400&q=80', array['Controle descente'], array['Coudes qui s ouvrent']),
    ('calf-raise', 'Elevations mollets debout', 'Poids du corps', false, 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80', array['Pause en haut'], array['Amplitude reduite']),
    ('calf-raise', 'Elevations mollets machine', 'Machine', false, 'https://images.unsplash.com/photo-1558611848-73f7eb4001ab?w=400&q=80', array['Tempo controle'], array['Rebond'])
) as v(slug, name_fr, equipment_fr, unilateral, image_url, cues_fr, common_mistakes_fr)
join public.exercise_catalog e on e.slug = v.slug
on conflict do nothing;

insert into public.exercise_catalog (slug, name_fr, description_fr, muscle_group_fr, primary_muscles_fr, secondary_muscles_fr, movement_pattern_fr, difficulty)
select
  'legacy-' || external_id::text,
  name,
  description,
  coalesce(muscle_group_fr, 'Autres'),
  coalesce(muscles, '{}'),
  '{}',
  null,
  'intermediaire'
from public.exercise_library l
where not exists (
  select 1 from public.exercise_catalog e where e.slug = 'legacy-' || l.external_id::text
);

insert into public.exercise_variant (exercise_id, name_fr, equipment_fr, unilateral, image_url, cues_fr, common_mistakes_fr)
select
  e.id,
  coalesce(l.name, 'Exercice'),
  coalesce(nullif((l.equipment)[1], ''), 'Poids du corps'),
  false,
  l.image_url,
  '{}',
  '{}'
from public.exercise_library l
join public.exercise_catalog e on e.slug = 'legacy-' || l.external_id::text
where not exists (
  select 1
  from public.exercise_variant v
  where v.exercise_id = e.id and v.name_fr = coalesce(l.name, 'Exercice')
);
