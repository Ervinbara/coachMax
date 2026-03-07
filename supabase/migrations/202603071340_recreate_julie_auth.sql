do $$
declare
  v_email text := 'julie.martin.demo@gmail.com';
  v_password text := 'Coachflow!2026';
  v_user_id uuid := gen_random_uuid();
  v_instance_id uuid;
begin
  select coalesce((select instance_id from auth.users limit 1), '00000000-0000-0000-0000-000000000000'::uuid)
    into v_instance_id;

  delete from public.messages
  where client_id in (select id from auth.users where email = v_email)
     or coach_id in (select id from auth.users where email = v_email);

  delete from public.coach_clients
  where client_id in (select id from auth.users where email = v_email)
     or coach_id in (select id from auth.users where email = v_email);

  delete from public.profiles where email = v_email;

  delete from auth.identities where user_id in (select id from auth.users where email = v_email);
  delete from auth.users where email = v_email;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values (
    v_instance_id,
    v_user_id,
    'authenticated',
    'authenticated',
    v_email,
    extensions.crypt(v_password, extensions.gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"client","full_name":"Julie Martin"}'::jsonb,
    now(),
    now()
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at,
    last_sign_in_at
  )
  values (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email),
    'email',
    v_email,
    now(),
    now(),
    now()
  );

  insert into public.profiles (id, email, full_name, role, status)
  values (v_user_id, v_email, 'Julie Martin', 'client', 'active')
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      role = excluded.role,
      status = excluded.status;
end $$;
