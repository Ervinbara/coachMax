update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email = 'coach.202603071413@gmail.com';
