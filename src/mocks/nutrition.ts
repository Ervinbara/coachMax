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
  {
    clientId: "c-004",
    targetCalories: 2050,
    proteinTarget: 132,
    carbTarget: 220,
    fatTarget: 68,
    meals: [
      { time: "07:45", label: "Skyr granola fruits", calories: 510, proteins: 32, carbs: 58, fats: 16 },
      { time: "12:30", label: "Salade quinoa thon", calories: 640, proteins: 41, carbs: 62, fats: 21 },
      { time: "19:00", label: "Omelette legumes", calories: 690, proteins: 45, carbs: 36, fats: 31 },
    ],
  },
  {
    clientId: "c-005",
    targetCalories: 2880,
    proteinTarget: 182,
    carbTarget: 325,
    fatTarget: 84,
    meals: [
      { time: "08:15", label: "Riz lait whey", calories: 720, proteins: 44, carbs: 98, fats: 16 },
      { time: "13:15", label: "Boeuf riz legumes", calories: 1010, proteins: 63, carbs: 112, fats: 30 },
      { time: "20:45", label: "Saumon pommes de terre", calories: 890, proteins: 55, carbs: 84, fats: 29 },
    ],
  },
];
