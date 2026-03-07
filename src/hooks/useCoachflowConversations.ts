import { useCallback, useEffect, useState } from "react";
import type { ConversationSummary } from "../services/coachflowService";
import { fetchConversationSummaries } from "../services/coachflowService";

export function useCoachflowConversations(pollMs = 30000) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const rows = await fetchConversationSummaries();
      setConversations(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement conversations");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      load();
    }, pollMs);

    return () => clearInterval(timer);
  }, [load, pollMs]);

  return { conversations, loading, error, reload: load };
}
