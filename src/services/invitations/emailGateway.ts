import { supabase } from "../../lib/supabaseClient";

export type InvitationEmailStatus = "sent" | "queued" | "disabled" | "error";

export type InvitationEmailPayload = {
  invitationId: string;
  coachName?: string;
  clientEmail: string;
  invitationLink: string;
  message?: string | null;
};

type InvitationEmailResult = {
  status: InvitationEmailStatus;
  error: string | null;
};

type ProviderMode = "disabled" | "supabase-function" | "webhook";

function getProviderMode(): ProviderMode {
  const raw = (process.env.EXPO_PUBLIC_INVITE_EMAIL_PROVIDER ?? "disabled").trim().toLowerCase();
  if (raw === "supabase-function") return "supabase-function";
  if (raw === "webhook") return "webhook";
  return "disabled";
}

async function sendWithSupabaseFunction(payload: InvitationEmailPayload): Promise<InvitationEmailResult> {
  const { data, error } = await supabase.functions.invoke("send-invitation-email", {
    body: payload,
  });
  if (error) {
    return { status: "error", error: error.message };
  }

  const statusFromFunction =
    data && typeof data === "object" && "status" in data && typeof data.status === "string"
      ? data.status
      : "queued";
  const errorFromFunction =
    data && typeof data === "object" && "error" in data && typeof data.error === "string"
      ? data.error
      : null;

  if (statusFromFunction === "sent" || statusFromFunction === "queued" || statusFromFunction === "disabled") {
    return { status: statusFromFunction, error: errorFromFunction };
  }

  return { status: "queued", error: errorFromFunction };
}

async function sendWithWebhook(payload: InvitationEmailPayload): Promise<InvitationEmailResult> {
  const webhookUrl = process.env.EXPO_PUBLIC_INVITE_EMAIL_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    return { status: "error", error: "Webhook email non configure." };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return { status: "error", error: `Webhook email en echec (${response.status}).` };
  }

  return { status: "queued", error: null };
}

export async function sendInvitationEmail(payload: InvitationEmailPayload): Promise<InvitationEmailResult> {
  const provider = getProviderMode();

  if (provider === "disabled") {
    return { status: "disabled", error: null };
  }

  if (provider === "supabase-function") {
    return sendWithSupabaseFunction(payload);
  }

  return sendWithWebhook(payload);
}
