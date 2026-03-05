import type { ClientProgram } from "./types";

export const programs: ClientProgram[] = [
  {
    clientId: "c-001",
    title: "Body Recomposition - 8 semaines",
    durationWeeks: 8,
    sessions: [
      { day: "Lundi", focus: "Lower Body", exercises: ["Back Squat", "RDL", "Walking Lunges"] },
      { day: "Mercredi", focus: "Upper Push", exercises: ["Bench Press", "Overhead Press", "Dips"] },
      { day: "Vendredi", focus: "Conditioning", exercises: ["Bike Intervals", "Core Circuit"] },
    ],
  },
  {
    clientId: "c-002",
    title: "Hypertrophie - Push Pull Legs",
    durationWeeks: 12,
    sessions: [
      { day: "Mardi", focus: "Push", exercises: ["Incline DB Press", "Triceps Pushdown", "Lateral Raise"] },
      { day: "Jeudi", focus: "Pull", exercises: ["Weighted Pull-up", "Row", "Biceps Curl"] },
      { day: "Samedi", focus: "Legs", exercises: ["Hack Squat", "Leg Curl", "Calf Raise"] },
    ],
  },
  {
    clientId: "c-003",
    title: "10K Performance Block",
    durationWeeks: 6,
    sessions: [
      { day: "Mardi", focus: "Intervals", exercises: ["6 x 400m", "Technique Drills"] },
      { day: "Jeudi", focus: "Tempo", exercises: ["25 min tempo", "Mobility"] },
      { day: "Dimanche", focus: "Long Run", exercises: ["60 min Z2", "Recovery Stretch"] },
    ],
  },
];
