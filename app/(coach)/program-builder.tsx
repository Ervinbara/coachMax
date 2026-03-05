import { useState } from "react";
import { router } from "expo-router";
import { Input, Text, XStack, YStack } from "tamagui";
import { AppButton, AppCard, Screen } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useLocaleStore } from "../../src/features/settings/useLocaleStore";
import { t } from "../../src/lib/i18n";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { RoleNav } from "../../src/layout/RoleNav";

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
  const locale = useLocaleStore((state) => state.locale);
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
      <AppTopBar title={t(locale, "builder.program.title")} subtitle={t(locale, "builder.program.subtitle")} showBack backHref="/(coach)/dashboard" />
      <RoleNav role="coach" />
      <AppCard>
        <YStack gap="$3">
          <Text color="$color" fontWeight="700" fontSize={18}>
            {t(locale, "builder.program.step1")}
          </Text>
          <Input value={sessionName} onChangeText={setSessionName} bg="#07091a" borderColor="#1D2040" color="#E8E9F5" />
          <Text color="$color" opacity={0.65} fontSize={13}>
            {t(locale, "builder.program.step2")}
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
          <AppButton label={t(locale, "builder.program.save")} />
        </YStack>
      </AppCard>
    </Screen>
  );
}
