export type UserRole = "coach" | "client";

export type Client = {
  id: string;
  fullName: string;
  sport: string;
  goal: string;
  avatar: string;
  status: "on-track" | "attention" | "critical";
  riskLevel: "low" | "medium" | "high";
  nextCheckIn: string;
  currentWeightKg: number;
  targetWeightKg: number;
  streakDays: number;
  adherence: number;
  sessionsCompleted: number;
  weeklyMinutes: number;
  progress: Array<{ week: string; value: number }>;
};

export type ProgramSession = {
  day: string;
  focus: string;
  exercises: string[];
};

export type ClientProgram = {
  clientId: string;
  title: string;
  durationWeeks: number;
  sessions: ProgramSession[];
};

export type Meal = {
  time: string;
  label: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
};

export type ClientNutritionPlan = {
  clientId: string;
  targetCalories: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  meals: Meal[];
};

export type ChatMessage = {
  id: string;
  clientId: string;
  sender: "coach" | "client";
  content: string;
  timestamp: string;
};

export type CoachTask = {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
  done: boolean;
};

export type PaymentRecord = {
  id: string;
  clientId: string;
  amountEur: number;
  plan: string;
  status: "paid" | "pending" | "late";
  date: string;
};

export type ActivityEvent = {
  id: string;
  clientId: string;
  label: string;
  type: "workout" | "meal" | "checkin" | "message";
  timestamp: string;
};
