import { useCallback, useEffect, useState } from "react";
import type { CoachflowMessage } from "../mocks/coachflow";
import {
  fetchConversationMessages,
  insertDemoIncomingMessage,
  markConversationAsRead,
  sendConversationMessage,
} from "../services/coachflowService";

type Options = {
  pollMs?: number;
};

export function useCoachflowChat(peerId: string, options?: Options) {
  const pollMs = options?.pollMs ?? 30000;
  const [messages, setMessages] = useState<CoachflowMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!peerId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setError(null);
    const rows = await fetchConversationMessages(peerId);
    setMessages(rows);
    setLoading(false);
  }, [peerId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    if (!peerId) return;
    const timer = setInterval(() => {
      load();
    }, pollMs);

    return () => clearInterval(timer);
  }, [load, pollMs, peerId]);

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return { error: "Message vide." };
      const result = await sendConversationMessage(peerId, trimmed);
      if (result.error) {
        setError(result.error);
        return result;
      }
      setError(null);
      await load();
      return { error: null };
    },
    [peerId, load],
  );

  const markAsRead = useCallback(async () => {
    const result = await markConversationAsRead(peerId);
    if (result.error) {
      setError(result.error);
      return result;
    }
    await load();
    return { error: null };
  }, [peerId, load]);

  const simulateIncoming = useCallback(async () => {
    const result = await insertDemoIncomingMessage(peerId);
    if (result.error) {
      setError(result.error);
      return result;
    }
    await load();
    return { error: null };
  }, [peerId, load]);

  return { messages, loading, error, reload: load, send, markAsRead, simulateIncoming };
}
