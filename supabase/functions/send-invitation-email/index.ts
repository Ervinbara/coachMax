// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type InvitationPayload = {
  invitationId: string;
  coachName?: string;
  clientEmail: string;
  invitationLink: string;
  message?: string | null;
};

type FunctionResponse = {
  ok: boolean;
  status: "sent" | "queued" | "disabled" | "error";
  provider: string;
  error?: string | null;
};

function jsonResponse(body: FunctionResponse, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

function sanitizeProvider(raw: string | undefined) {
  const provider = (raw ?? "disabled").trim().toLowerCase();
  if (provider === "brevo" || provider === "mailjet" || provider === "disabled") {
    return provider;
  }
  return "disabled";
}

async function sendViaBrevo(payload: InvitationPayload) {
  const apiKey = Deno.env.get("BREVO_API_KEY") ?? "";
  const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL") ?? "";
  const senderName = Deno.env.get("BREVO_SENDER_NAME") ?? "CoachFlow";

  if (!apiKey || !senderEmail) {
    return { ok: false, status: "disabled" as const, error: "BREVO_API_KEY/BREVO_SENDER_EMAIL manquants." };
  }

  const emailBody = [
    "Bonjour,",
    `${payload.coachName ?? "Votre coach"} vous invite sur CoachFlow.`,
    `Lien: ${payload.invitationLink}`,
    payload.message ? `Message: ${payload.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: senderName,
      },
      to: [{ email: payload.clientEmail }],
      subject: "Invitation CoachFlow",
      textContent: emailBody,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    return { ok: false, status: "error" as const, error: `Brevo: ${response.status} ${details}` };
  }

  return { ok: true, status: "sent" as const, error: null };
}

async function sendViaMailjet(payload: InvitationPayload) {
  const apiKey = Deno.env.get("MAILJET_API_KEY") ?? "";
  const apiSecret = Deno.env.get("MAILJET_API_SECRET") ?? "";
  const senderEmail = Deno.env.get("MAILJET_SENDER_EMAIL") ?? "";
  const senderName = Deno.env.get("MAILJET_SENDER_NAME") ?? "CoachFlow";

  if (!apiKey || !apiSecret || !senderEmail) {
    return { ok: false, status: "disabled" as const, error: "MAILJET_API_KEY/MAILJET_API_SECRET/MAILJET_SENDER_EMAIL manquants." };
  }

  const emailBody = [
    "Bonjour,",
    `${payload.coachName ?? "Votre coach"} vous invite sur CoachFlow.`,
    `Lien: ${payload.invitationLink}`,
    payload.message ? `Message: ${payload.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const token = btoa(`${apiKey}:${apiSecret}`);
  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: senderEmail, Name: senderName },
          To: [{ Email: payload.clientEmail }],
          Subject: "Invitation CoachFlow",
          TextPart: emailBody,
        },
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    return { ok: false, status: "error" as const, error: `Mailjet: ${response.status} ${details}` };
  }

  return { ok: true, status: "sent" as const, error: null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return jsonResponse({ ok: true, status: "queued", provider: "cors", error: null }, 200);
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, status: "error", provider: "none", error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const provider = sanitizeProvider(Deno.env.get("INVITE_EMAIL_PROVIDER"));

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ ok: false, status: "error", provider, error: "Variables SUPABASE manquantes." }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ ok: false, status: "error", provider, error: "Authorization manquante." }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  const userId = userData.user?.id ?? null;
  if (userError || !userId) {
    return jsonResponse({ ok: false, status: "error", provider, error: "Session invalide." }, 401);
  }

  const payload = (await req.json()) as InvitationPayload;
  if (!payload?.invitationId || !payload?.clientEmail || !payload?.invitationLink) {
    return jsonResponse({ ok: false, status: "error", provider, error: "Payload invalide." }, 400);
  }

  const { data: invitation, error: invitationError } = await serviceClient
    .from("coach_invitations")
    .select("id, coach_id, client_email, status")
    .eq("id", payload.invitationId)
    .maybeSingle();

  if (invitationError || !invitation) {
    return jsonResponse({ ok: false, status: "error", provider, error: "Invitation introuvable." }, 404);
  }

  if (invitation.coach_id !== userId) {
    return jsonResponse({ ok: false, status: "error", provider, error: "Invitation non autorisee." }, 403);
  }

  if (invitation.status !== "pending") {
    return jsonResponse({ ok: false, status: "disabled", provider, error: "Invitation deja traitee." }, 200);
  }

  if (provider === "disabled") {
    return jsonResponse({ ok: true, status: "disabled", provider, error: null }, 200);
  }

  const finalPayload: InvitationPayload = {
    ...payload,
    clientEmail: invitation.client_email,
  };

  const result = provider === "brevo" ? await sendViaBrevo(finalPayload) : await sendViaMailjet(finalPayload);
  if (!result.ok) {
    return jsonResponse({ ok: false, status: result.status, provider, error: result.error }, 200);
  }

  return jsonResponse({ ok: true, status: result.status, provider, error: null }, 200);
});
