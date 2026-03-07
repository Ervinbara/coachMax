import { Platform } from "react-native";

export function buildInvitationLink(invitationId: string) {
  const explicitBase = process.env.EXPO_PUBLIC_APP_BASE_URL?.trim();
  let baseUrl = explicitBase || "https://coachflow.app";

  if (!explicitBase && Platform.OS === "web" && typeof window !== "undefined" && window.location?.origin) {
    baseUrl = window.location.origin;
  }

  return `${baseUrl.replace(/\/+$/, "")}/program?invite=${encodeURIComponent(invitationId)}`;
}

export function buildInvitationMessage(params: {
  coachName?: string;
  clientEmail: string;
  invitationLink: string;
  customMessage?: string | null;
}) {
  const lines = [
    "Bonjour,",
    `${params.coachName ?? "Votre coach"} vous invite sur CoachFlow.`,
    `Email cible: ${params.clientEmail}`,
    `Lien d'invitation: ${params.invitationLink}`,
  ];

  if (params.customMessage?.trim()) {
    lines.push(`Message du coach: ${params.customMessage.trim()}`);
  }

  lines.push("Si vous avez deja un compte, connectez-vous puis acceptez l'invitation dans Mon Programme.");

  return lines.join("\n");
}
