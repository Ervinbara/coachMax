import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync('.env','utf8').split(/\r?\n/).filter(Boolean).filter(l=>!l.startsWith('#')).map(l=>{const i=l.indexOf('='); return [l.slice(0,i), l.slice(i+1)];})
);
const url = env.EXPO_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const anon = env.EXPO_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

const coach = createClient(url, anon);
const login = await coach.auth.signInWithPassword({ email: 'coach.202603071413@gmail.com', password: 'Coachflow!2026' });
if (login.error || !login.data.user) throw new Error(login.error?.message || 'login failed');
const coachId = login.data.user.id;

const profile = await coach.from('profiles').select('id,email,full_name,role,status').eq('id', coachId).maybeSingle();
const links = await coach.from('coach_clients').select('*').eq('coach_id', coachId);
const clients = await coach.from('profiles').select('id,email,full_name,role').in('id', (links.data||[]).map(x=>x.client_id));
const msgs = await coach.from('messages').select('id,coach_id,client_id,sender,content,created_at,read_at').eq('coach_id', coachId).order('created_at',{ascending:false}).limit(20);

console.log(JSON.stringify({
  coachId,
  profileError: profile.error?.message || null,
  profile: profile.data,
  linksError: links.error?.message || null,
  links: links.data,
  clientsError: clients.error?.message || null,
  clients: clients.data,
  msgsError: msgs.error?.message || null,
  msgsCount: msgs.data?.length || 0,
  firstMsgs: msgs.data?.slice(0,5) || []
}, null, 2));
