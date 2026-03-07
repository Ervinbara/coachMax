import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../features/auth/useAuthStore";
import {
  acceptCoachInvitation,
  fetchClientPendingInvitations,
  type CoachInvitation,
} from "../services/coachflowService";

export function useClientInvitations() {
  const initialized = useAuthStore((state) => state.initialized);
  const role = useAuthStore((state) => state.role);
  const userId = useAuthStore((state) => state.user?.id ?? null);

  const [invitations, setInvitations] = useState<CoachInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!initialized) return;
    if (role !== "client") {
      setInvitations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await fetchClientPendingInvitations();
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

  const accept = useCallback(
    async (invitationId: string) => {
      const result = await acceptCoachInvitation(invitationId);
      if (result.error) {
        setError(result.error);
        return result;
      }
      await load();
      return { error: null };
    },
    [load],
  );

  return { invitations, loading, error, accept, reload: load };
}
