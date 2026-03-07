import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv(envPath) {
  const content = fs.readFileSync(envPath, "utf8");
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    out[key] = value;
  }
  return out;
}

async function ensureSession(url, anon, account) {
  const client = createClient(url, anon);

  const signIn = await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });

  if (!signIn.error && signIn.data.user) {
    return { client, user: signIn.data.user };
  }

  const msg = String(signIn.error?.message || "").toLowerCase();
  if (msg.includes("email not confirmed")) {
    throw new Error(
      `SignIn ${account.email} impossible: email non confirme. Activez "Confirm email" OFF temporairement ou confirmez l'utilisateur.`
    );
  }

  if (!msg.includes("invalid login credentials")) {
    throw new Error(`SignIn ${account.email} impossible: ${signIn.error?.message}`);
  }

  const signUp = await client.auth.signUp({
    email: account.email,
    password: account.password,
    options: {
      data: {
        role: account.role,
        full_name: account.full_name,
      },
    },
  });

  if (signUp.error) {
    throw new Error(`SignUp ${account.email} impossible: ${signUp.error.message}`);
  }

  const retry = await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });

  if (retry.error || !retry.data.user) {
    throw new Error(
      `SignIn ${account.email} impossible apres signup. Verifiez la confirmation email.`
    );
  }

  return { client, user: retry.data.user };
}

async function main() {
  const env = loadEnv(path.resolve(process.cwd(), ".env"));
  const url = env.EXPO_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const anon = env.EXPO_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error("Variables Supabase manquantes dans .env");
  }

  const accounts = [
    {
      label: "coach",
      email: "coachflow.coach.demo@gmail.com",
      password: "Coachflow!2026",
      role: "coach",
      full_name: "Thomas Durand",
    },
    {
      label: "client_1",
      email: "coachflow.client1.demo@gmail.com",
      password: "Coachflow!2026",
      role: "client",
      full_name: "Julie Martin",
    },
    {
      label: "client_2",
      email: "coachflow.client2.demo@gmail.com",
      password: "Coachflow!2026",
      role: "client",
      full_name: "Alex Dupont",
    },
  ];

  const created = [];

  for (const account of accounts) {
    const session = await ensureSession(url, anon, account);

    const { error: profileError } = await session.client.from("profiles").upsert(
      {
        id: session.user.id,
        role: account.role,
        full_name: account.full_name,
        email: account.email,
        status: "active",
      },
      { onConflict: "id" },
    );

    if (profileError) {
      throw new Error(`Profile upsert ${account.email} impossible: ${profileError.message}`);
    }

    created.push({ ...account, id: session.user.id, client: session.client });
  }

  const coach = created.find((item) => item.role === "coach");
  const clients = created.filter((item) => item.role === "client");

  if (!coach) throw new Error("Coach non cree");

  const { error: linkError } = await coach.client.from("coach_clients").upsert(
    clients.map((client) => ({ coach_id: coach.id, client_id: client.id, status: "active" })),
    { onConflict: "coach_id,client_id" },
  );

  if (linkError) {
    throw new Error(`Creation des liens coach_clients impossible: ${linkError.message}`);
  }

  for (const client of clients) {
    const { error: msgCoach } = await coach.client.from("messages").insert({
      coach_id: coach.id,
      client_id: client.id,
      sender: "coach",
      content: `Salut ${client.full_name}, on commence ton suivi CoachFlow cette semaine.`,
    });

    if (msgCoach) {
      throw new Error(`Message coach->${client.email} impossible: ${msgCoach.message}`);
    }

    const { error: msgClient } = await client.client.from("messages").insert({
      coach_id: coach.id,
      client_id: client.id,
      sender: "client",
      content: "Parfait coach, je viens de terminer ma seance du jour.",
    });

    if (msgClient) {
      throw new Error(`Message client->coach ${client.email} impossible: ${msgClient.message}`);
    }
  }

  const out = created.map((item) => ({
    label: item.label,
    email: item.email,
    password: item.password,
    role: item.role,
    full_name: item.full_name,
    id: item.id,
  }));

  console.log(JSON.stringify({ created: out }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
