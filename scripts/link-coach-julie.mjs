import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync('.env','utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((l)=>!l.startsWith('#'))
    .map((l)=>{ const i=l.indexOf('='); return [l.slice(0,i), l.slice(i+1)]; })
);

const url = env.EXPO_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const anon = env.EXPO_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

const coach = createClient(url, anon);
const julie = createClient(url, anon);

const coachLogin = await coach.auth.signInWithPassword({ email: 'coach.202603071413@gmail.com', password: 'Coachflow!2026' });
if (coachLogin.error || !coachLogin.data.user) throw new Error(`coach login failed: ${coachLogin.error?.message}`);

const julieLogin = await julie.auth.signInWithPassword({ email: 'julie.martin.demo@gmail.com', password: 'Coachflow!2026' });
if (julieLogin.error || !julieLogin.data.user) throw new Error(`julie login failed: ${julieLogin.error?.message}`);

const coachId = coachLogin.data.user.id;
const julieId = julieLogin.data.user.id;

const link = await coach.from('coach_clients').upsert({ coach_id: coachId, client_id: julieId, status: 'active' }, { onConflict: 'coach_id,client_id' });
if (link.error) throw new Error(`link failed: ${link.error.message}`);

const m1 = await coach.from('messages').insert({ coach_id: coachId, client_id: julieId, sender: 'coach', content: 'Salut Julie, bienvenue sur CoachFlow.' });
if (m1.error) throw new Error(`coach message 1 failed: ${m1.error.message}`);

const m2 = await julie.from('messages').insert({ coach_id: coachId, client_id: julieId, sender: 'client', content: 'Merci coach, je viens de terminer ma seance.' });
if (m2.error) throw new Error(`julie message failed: ${m2.error.message}`);

const m3 = await coach.from('messages').insert({ coach_id: coachId, client_id: julieId, sender: 'coach', content: 'Parfait, envoie-moi ton ressenti de demain.' });
if (m3.error) throw new Error(`coach message 2 failed: ${m3.error.message}`);

console.log(JSON.stringify({ coachId, julieId, status: 'OK' }, null, 2));
