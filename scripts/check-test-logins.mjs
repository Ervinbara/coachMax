import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(Boolean).filter(l=>!l.startsWith('#')).map(l=>{const i=l.indexOf('='); return [l.slice(0,i), l.slice(i+1)];}));
const url = env.EXPO_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const anon = env.EXPO_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

const emails = [
  'coachflow.coach.demo@gmail.com',
  'coachflow.client1.demo@gmail.com',
  'coachflow.client2.demo@gmail.com',
  'coach.202603071413@gmail.com',
  'coach.202603071412@gmail.com',
  'coach.202603071411@gmail.com'
];

for (const email of emails) {
  const client = createClient(url, anon);
  const { error, data } = await client.auth.signInWithPassword({ email, password: 'Coachflow!2026' });
  if (error) {
    console.log(email, '=>', error.message);
  } else {
    console.log(email, '=> OK', data.user?.id);
  }
}
