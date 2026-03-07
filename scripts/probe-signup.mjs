import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(Boolean).filter(l=>!l.startsWith('#')).map(l=>{const i=l.indexOf('='); return [l.slice(0,i), l.slice(i+1)];}));
const url = env.EXPO_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const anon = env.EXPO_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
const client = createClient(url, anon);
const email = `cf.client.${Date.now()}@gmail.com`;
const { error } = await client.auth.signUp({ email, password: 'Coachflow!2026' });
console.log(email, error ? error.message : 'SIGNUP_OK');
