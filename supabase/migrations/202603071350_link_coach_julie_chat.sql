do $$
declare
  v_coach_id uuid;
  v_client_id uuid;
begin
  select id into v_coach_id from auth.users where email = 'coach.202603071413@gmail.com' limit 1;
  select id into v_client_id from auth.users where email = 'julie.martin.demo@gmail.com' limit 1;

  if v_coach_id is null or v_client_id is null then
    raise exception 'Coach or Julie user missing';
  end if;

  insert into public.coach_clients (coach_id, client_id, status)
  values (v_coach_id, v_client_id, 'active')
  on conflict (coach_id, client_id)
  do update set status = excluded.status;

  insert into public.messages (coach_id, client_id, sender, content)
  values
    (v_coach_id, v_client_id, 'coach',  'Salut Julie, bienvenue sur CoachFlow.'),
    (v_coach_id, v_client_id, 'client', 'Merci coach, je viens de terminer ma seance.'),
    (v_coach_id, v_client_id, 'coach',  'Parfait, envoie-moi ton ressenti de demain.');
end $$;
