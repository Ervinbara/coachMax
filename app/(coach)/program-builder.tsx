import { useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { AppButton, AppCard, Screen } from "../../src/components";
import { colors } from "../../src/design/tokens";
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
  const initialized = useAuthStore((state) => state.initialized);
  const role = useAuthStore((state) => state.role);
  const locale = useLocaleStore((state) => state.locale);
  const [sessionName, setSessionName] = useState("Lower Body Strength");
  const [selectedExercises, setSelectedExercises] = useState<string[]>(exerciseSuggestions.slice(0, 3));

  if (!initialized) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
  }

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
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#E8E9F5", fontWeight: "700", fontSize: 18 }}>
            {t(locale, "builder.program.step1")}
          </Text>
          <TextInput
            value={sessionName}
            onChangeText={setSessionName}
            style={{
              backgroundColor: "#07091a",
              borderWidth: 1,
              borderColor: "#1D2040",
              color: "#E8E9F5",
              borderRadius: 10,
              padding: 12,
              fontSize: 15,
            }}
            placeholderTextColor="#7B80A4"
          />
          <Text style={{ color: "#E8E9F5", opacity: 0.65, fontSize: 13 }}>
            {t(locale, "builder.program.step2")}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
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
          </View>
          <AppButton label={t(locale, "builder.program.save")} />
        </View>
      </AppCard>
    </Screen>
  );
}
