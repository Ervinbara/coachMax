update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email in (
  'coachflow.coach.demo@gmail.com',
  'coachflow.client1.demo@gmail.com',
  'coachflow.client2.demo@gmail.com'
);
