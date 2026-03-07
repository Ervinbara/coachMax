export type CoachflowClient = {
  id: string;
  name: string;
  subtitle: string;
  progressKg: number;
  progressPct: number;
  weightKg: number;
  objective: string;
  avatarUrl: string;
  heroUrl: string;
  mensurations: { taille: number; hanches: number };
  chart: number[];
  sessions: { id: string; label: string; sets: string; done: boolean }[];
};

export type CoachflowTask = { id: string; label: string; icon: string };
export type CoachflowMessage = {
  id: string;
  sender: "coach" | "client";
  text: string;
  time: string;
  videoUrl?: string;
};

export const coachProfile = {
  name: "Thomas Durand",
  role: "Coach Pro",
  avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&q=80",
};

export const clients: CoachflowClient[] = [
  {
    id: "julie-martin",
    name: "Julie Martin",
    subtitle: "31 ans - perte de poids",
    progressKg: 2.3,
    progressPct: 3.8,
    weightKg: 62,
    objective: "Perte de poids",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
    heroUrl: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=1200&q=80",
    mensurations: { taille: 78, hanches: 95 },
    chart: [100, 92, 83, 73, 68, 67, 60],
    sessions: [
      { id: "s1", label: "Squats", sets: "3 series de 12", done: true },
      { id: "s2", label: "Pompes", sets: "3 series de 10", done: true },
      { id: "s3", label: "Rowing halteres", sets: "3 series de 15", done: true },
    ],
  },
  {
    id: "alex-dupont",
    name: "Alex Dupont",
    subtitle: "27 ans - remise en forme",
    progressKg: 1.2,
    progressPct: 1.7,
    weightKg: 79,
    objective: "Condition physique",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    heroUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
    mensurations: { taille: 86, hanches: 102 },
    chart: [110, 104, 99, 92, 90, 86, 81],
    sessions: [
      { id: "s1", label: "Cardio", sets: "25 min", done: true },
      { id: "s2", label: "Gainage", sets: "4 x 45 sec", done: false },
      { id: "s3", label: "Fentes", sets: "3 series de 12", done: false },
    ],
  },
  {
    id: "sophie-lambert",
    name: "Sophie Lambert",
    subtitle: "34 ans - tonification",
    progressKg: 2.3,
    progressPct: 3.7,
    weightKg: 67,
    objective: "Tonifier et affiner",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80",
    heroUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80",
    mensurations: { taille: 74, hanches: 91 },
    chart: [95, 92, 90, 86, 82, 79, 75],
    sessions: [
      { id: "s1", label: "Full Body", sets: "45 min", done: true },
      { id: "s2", label: "Abdos", sets: "4 series", done: true },
      { id: "s3", label: "Etirements", sets: "15 min", done: false },
    ],
  },
];

export const globalProgress = [56, 62, 54, 70, 78, 74, 85, 88, 80];

export const dayTasks: CoachflowTask[] = [
  { id: "t1", label: "Creer un programme", icon: "list" },
  { id: "t2", label: "Suivi de Sophie", icon: "heart" },
  { id: "t3", label: "Repondre a messages", icon: "chat" },
];

export const chatConversations = [
  { id: "julie-martin", label: "Julie Martin", preview: "Video seance envoyee", unread: 2 },
  { id: "alex-dupont", label: "Alex Dupont", preview: "Merci coach", unread: 0 },
  { id: "sophie-lambert", label: "Sophie Lambert", preview: "Objectif atteint", unread: 1 },
];

export const chatMessages: Record<string, CoachflowMessage[]> = {
  "julie-martin": [
    {
      id: "m1",
      sender: "coach",
      text: "Salut Julie ! Bien joue pour ta seance d'aujourd'hui. Pense a bien t'etirer apres l'entrainement.",
      time: "11:50",
    },
    {
      id: "m2",
      sender: "client",
      text: "Merci Thomas ! Voila la video de ma seance de squats, qu'en penses-tu ?",
      time: "11:55",
      videoUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1000&q=80",
    },
    {
      id: "m3",
      sender: "coach",
      text: "Super execution, continue comme ca. Je te donne quelques points d'amelioration ensuite.",
      time: "12:00",
    },
  ],
};
