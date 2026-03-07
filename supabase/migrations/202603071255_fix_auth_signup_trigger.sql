create or replace function public.safe_parse_role(raw_role text)
returns public.app_role
language plpgsql
stable
as $$
begin
  if raw_role = 'coach' then
    return 'coach'::public.app_role;
  end if;

  if raw_role = 'client' then
    return 'client'::public.app_role;
  end if;

  return 'client'::public.app_role;
end;
$$;

create or replace function public.handle_new_user_profile_safe()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_role public.app_role;
begin
  next_role := public.safe_parse_role(new.raw_user_meta_data ->> 'role');

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    next_role
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      role = excluded.role,
      updated_at = now();

  return new;
exception
  when others then
    -- Never block auth signups because of profile sync issues.
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row
execute function public.handle_new_user_profile_safe();
