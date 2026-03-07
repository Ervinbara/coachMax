import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../features/auth/useAuthStore";
import type { CoachflowClient } from "../mocks/coachflow";
import { fetchCoachflowClients } from "../services/coachflowService";

export function useCoachflowClients() {
  const initialized = useAuthStore((state) => state.initialized);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const [clients, setClients] = useState<CoachflowClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!initialized) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchCoachflowClients();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement clients");
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  useEffect(() => {
    if (!initialized) return;

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCoachflowClients();
        if (!mounted) return;
        setClients(data);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Erreur de chargement clients");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [initialized, userId]);

  return { clients, loading, error, setClients, reload };
}
