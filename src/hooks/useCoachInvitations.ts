import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../features/auth/useAuthStore";
import { sendInvitationEmail } from "../services/invitations/emailGateway";
import { buildInvitationLink, buildInvitationMessage } from "../services/invitations/invitationShare";
import {
  createCoachInvitation,
  fetchCoachSentInvitations,
  type CoachInvitation,
} from "../services/coachflowService";

type InviteResult = {
  error: string | null;
  invitation: CoachInvitation | null;
  invitationLink: string | null;
  invitationText: string | null;
  emailStatus: "sent" | "queued" | "disabled" | "error";
};

export function useCoachInvitations() {
  const initialized = useAuthStore((state) => state.initialized);
  const role = useAuthStore((state) => state.role);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const coachName = useAuthStore((state) => {
    const fullName = state.user?.user_metadata?.full_name;
    return typeof fullName === "string" && fullName.trim() ? fullName.trim() : "Coach";
  });

  const [invitations, setInvitations] = useState<CoachInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!initialized) return;
    if (role !== "coach") {
      setInvitations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await fetchCoachSentInvitations();
      setInvitations(rows);
    } catch (err) {
      setInvitations([]);
      setError(err instanceof Error ? err.message : "Erreur de chargement invitations");
    } finally {
      setLoading(false);
    }
  }, [initialized, role]);

  useEffect(() => {
    load();
  }, [load, userId]);

  const invite = useCallback(
    async (clientEmail: string, message?: string): Promise<InviteResult> => {
      const result = await createCoachInvitation(clientEmail, message);
      if (result.error) {
        setError(result.error);
        return {
          error: result.error,
          invitation: null,
          invitationLink: null,
          invitationText: null,
          emailStatus: "error",
        };
      }

      const invitation = result.invitation;
      if (!invitation) {
        setError("Invitation creee mais indisponible.");
        return {
          error: "Invitation creee mais indisponible.",
          invitation: null,
          invitationLink: null,
          invitationText: null,
          emailStatus: "error",
        };
      }

      const invitationLink = buildInvitationLink(invitation.id);
      const invitationText = buildInvitationMessage({
        coachName,
        clientEmail: invitation.clientEmail,
        invitationLink,
        customMessage: invitation.message,
      });

      const emailResult = await sendInvitationEmail({
        invitationId: invitation.id,
        coachName,
        clientEmail: invitation.clientEmail,
        invitationLink,
        message: invitation.message,
      });

      await load();
      return {
        error: emailResult.error,
        invitation,
        invitationLink,
        invitationText,
        emailStatus: emailResult.status,
      };
    },
    [coachName, load],
  );

  return { invitations, loading, error, invite, reload: load };
}
