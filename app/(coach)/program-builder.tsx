import { useState } from "react";
import { router } from "expo-router";
import { Input, Text, XStack, YStack } from "tamagui";
import { AppButton, AppCard, Screen } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { AppTopBar } from "../../src/layout/AppTopBar";

const exerciseSuggestions = [
  "Back Squat",
  "Deadlift",
  "Pull-up",
  "Bench Press",
  "Walking Lunges",
  "Burpees",
  "Core Circuit",
];

export default function ProgramBuilderScreen() {
  const role = useAuthStore((state) => state.role);
  const [sessionName, setSessionName] = useState("Lower Body Strength");
  const [selectedExercises, setSelectedExercises] = useState<string[]>(exerciseSuggestions.slice(0, 3));

  if (role !== "coach") {
    router.replace("/(auth)/login");
    return null;
  }

  const toggleExercise = (exercise: string) => {
    setSelectedExercises((current) =>
      current.includes(exercise) ? current.filter((item) => item !== exercise) : [...current, exercise]
    );
  };

  return (
    <Screen>
      <AppTopBar title="Program Builder" subtitle="Creation de seances" showBack backHref="/(coach)/dashboard" />
      <AppCard>
        <YStack gap="$3">
          <Text color="$color" fontWeight="700" fontSize={18}>
            Nouvelle seance
          </Text>
          <Input value={sessionName} onChangeText={setSessionName} bg="rgba(255,255,255,0.03)" borderColor="$borderColor" />
          <Text color="$color" opacity={0.65} fontSize={13}>
            Ajout d'exercices (mock data)
          </Text>
          <XStack gap="$2" fw="wrap">
            {exerciseSuggestions.map((exercise) => {
              const selected = selectedExercises.includes(exercise);
              return (
                <AppButton
                  key={exercise}
                  label={exercise}
                  variant={selected ? "primary" : "ghost"}
                  onPress={() => toggleExercise(exercise)}
                />
              );
            })}
          </XStack>
          <AppButton label="Sauvegarder la seance (UI only)" />
        </YStack>
      </AppCard>
    </Screen>
  );
}
