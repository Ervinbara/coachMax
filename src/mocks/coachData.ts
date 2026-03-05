import type { ActivityEvent, CoachTask, PaymentRecord } from "./types";

export const coachTasks: CoachTask[] = [
  { id: "t-001", title: "Valider check-in Nora", priority: "high", dueDate: "2026-03-06", done: false },
  { id: "t-002", title: "Adapter nutrition Lucas", priority: "medium", dueDate: "2026-03-07", done: false },
  { id: "t-003", title: "Envoyer recap hebdo", priority: "low", dueDate: "2026-03-08", done: true },
];

export const paymentRecords: PaymentRecord[] = [
  { id: "p-001", clientId: "c-001", amountEur: 149, plan: "Premium", status: "paid", date: "2026-03-01" },
  { id: "p-002", clientId: "c-002", amountEur: 99, plan: "Standard", status: "pending", date: "2026-03-02" },
  { id: "p-003", clientId: "c-004", amountEur: 79, plan: "Starter", status: "late", date: "2026-02-28" },
  { id: "p-004", clientId: "c-005", amountEur: 149, plan: "Premium", status: "paid", date: "2026-03-03" },
];

export const activityEvents: ActivityEvent[] = [
  {
    id: "a-001",
    clientId: "c-001",
    label: "Seance lower body completee",
    type: "workout",
    timestamp: "2026-03-05T06:20:00Z",
  },
  {
    id: "a-002",
    clientId: "c-003",
    label: "Check-in hebdo soumis",
    type: "checkin",
    timestamp: "2026-03-04T17:15:00Z",
  },
  {
    id: "a-003",
    clientId: "c-004",
    label: "Message sur la fatigue musculaire",
    type: "message",
    timestamp: "2026-03-04T18:13:00Z",
  },
  {
    id: "a-004",
    clientId: "c-005",
    label: "Journal nutrition complete",
    type: "meal",
    timestamp: "2026-03-04T21:41:00Z",
  },
];
