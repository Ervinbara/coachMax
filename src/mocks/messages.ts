import type { ChatMessage } from "./types";

export const messages: ChatMessage[] = [
  {
    id: "m-001",
    clientId: "c-001",
    sender: "coach",
    content: "Top la seance jambes, continue sur ce rythme.",
    timestamp: "2026-03-03T09:42:00Z",
  },
  {
    id: "m-002",
    clientId: "c-001",
    sender: "client",
    content: "Merci, je sens une vraie progression sur les squats.",
    timestamp: "2026-03-03T10:08:00Z",
  },
  {
    id: "m-003",
    clientId: "c-002",
    sender: "coach",
    content: "Pense a augmenter les glucides les jours jambes.",
    timestamp: "2026-03-02T17:10:00Z",
  },
  {
    id: "m-004",
    clientId: "c-003",
    sender: "client",
    content: "Sortie longue terminee. Sensations stables.",
    timestamp: "2026-03-04T08:26:00Z",
  },
  {
    id: "m-005",
    clientId: "c-004",
    sender: "coach",
    content: "On reste sur des charges legeres cette semaine.",
    timestamp: "2026-03-04T18:00:00Z",
  },
  {
    id: "m-006",
    clientId: "c-004",
    sender: "client",
    content: "Parfait, je valide le planning et les repas.",
    timestamp: "2026-03-04T18:12:00Z",
  },
  {
    id: "m-007",
    clientId: "c-005",
    sender: "coach",
    content: "Tu peux passer sur 8 rounds samedi.",
    timestamp: "2026-03-05T07:50:00Z",
  },
];
