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

const links = await coach.from('coach_clients').select('client_id').eq('coach_id', coachId);
const clientIds = (links.data || []).map(x => x.client_id);
const profiles = await coach.from('profiles').select('id,full_name,role').in('id', clientIds).eq('role','client');
const messages = await coach.from('messages').select('id,client_id,sender,content').eq('coach_id', coachId).in('client_id', clientIds).order('created_at',{ascending:false}).limit(10);

console.log(JSON.stringify({
  clientIds,
  clients: profiles.data,
  messages: messages.data?.slice(0,5)
}, null, 2));
