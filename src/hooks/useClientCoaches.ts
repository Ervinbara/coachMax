import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../features/auth/useAuthStore";
import { fetchClientCoaches, type ClientCoachSummary } from "../services/coachflowService";

export function useClientCoaches() {
  const initialized = useAuthStore((state) => state.initialized);
  const role = useAuthStore((state) => state.role);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const selectedCoachId = useAuthStore((state) => state.selectedCoachId);
  const setSelectedCoachId = useAuthStore((state) => state.setSelectedCoachId);

  const [coaches, setCoaches] = useState<ClientCoachSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!initialized) return;
    if (role !== "client") {
      setCoaches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await fetchClientCoaches();
      setCoaches(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement coachs");
      setCoaches([]);
    } finally {
      setLoading(false);
    }
  }, [initialized, role]);

  useEffect(() => {
    load();
  }, [load, userId]);

  useEffect(() => {
    if (role !== "client") return;
    if (!coaches.length) return;
    if (!selectedCoachId || !coaches.some((coach) => coach.id === selectedCoachId)) {
      setSelectedCoachId(coaches[0].id);
    }
  }, [coaches, role, selectedCoachId, setSelectedCoachId]);

  return { coaches, loading, error, reload: load };
}
