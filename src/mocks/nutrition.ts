import type { ClientNutritionPlan } from "./types";

export const nutritionPlans: ClientNutritionPlan[] = [
  {
    clientId: "c-001",
    targetCalories: 2200,
    proteinTarget: 150,
    carbTarget: 230,
    fatTarget: 70,
    meals: [
      { time: "07:30", label: "Petit-dejeuner proteine", calories: 520, proteins: 35, carbs: 52, fats: 18 },
      { time: "12:30", label: "Bol poulet quinoa", calories: 700, proteins: 48, carbs: 75, fats: 21 },
      { time: "20:00", label: "Saumon + patate douce", calories: 760, proteins: 55, carbs: 58, fats: 28 },
    ],
  },
  {
    clientId: "c-002",
    targetCalories: 3050,
    proteinTarget: 190,
    carbTarget: 360,
    fatTarget: 90,
    meals: [
      { time: "08:00", label: "Omelette + avoine", calories: 780, proteins: 52, carbs: 82, fats: 27 },
      { time: "13:00", label: "Riz boeuf legumes", calories: 960, proteins: 60, carbs: 118, fats: 30 },
      { time: "20:30", label: "Pates + dinde", calories: 920, proteins: 57, carbs: 110, fats: 24 },
    ],
  },
  {
    clientId: "c-003",
    targetCalories: 2450,
    proteinTarget: 145,
    carbTarget: 285,
    fatTarget: 72,
    meals: [
      { time: "07:00", label: "Porridge fruits", calories: 560, proteins: 28, carbs: 86, fats: 14 },
      { time: "12:00", label: "Wrap dinde", calories: 760, proteins: 43, carbs: 88, fats: 23 },
      { time: "19:30", label: "Bowl tofu riz", calories: 760, proteins: 39, carbs: 93, fats: 25 },
    ],
  },
];
