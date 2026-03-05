import { useState } from "react";
import { router } from "expo-router";
import { Input, Text, XStack, YStack } from "tamagui";
import { AppButton, AppCard, Screen } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { AppTopBar } from "../../src/layout/AppTopBar";

export default function NutritionBuilderScreen() {
  const role = useAuthStore((state) => state.role);
  const [calories, setCalories] = useState("2500");
  const [protein, setProtein] = useState("160");
  const [carbs, setCarbs] = useState("280");
  const [fats, setFats] = useState("75");

  if (role !== "coach") {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <Screen>
      <AppTopBar title="Nutrition Builder" subtitle="Creation de plan alimentaire" showBack backHref="/(coach)/dashboard" />
      <AppCard>
        <YStack gap="$3">
          <Text color="$color" fontWeight="700" fontSize={18}>
            Macros cibles
          </Text>
          <XStack gap="$2" $sm={{ fd: "column" }}>
            <YStack f={1} gap="$1">
              <Text color="$color" opacity={0.7} fontSize={12}>
                Calories
              </Text>
              <Input value={calories} onChangeText={setCalories} keyboardType="numeric" />
            </YStack>
            <YStack f={1} gap="$1">
              <Text color="$color" opacity={0.7} fontSize={12}>
                Proteines (g)
              </Text>
              <Input value={protein} onChangeText={setProtein} keyboardType="numeric" />
            </YStack>
          </XStack>
          <XStack gap="$2" $sm={{ fd: "column" }}>
            <YStack f={1} gap="$1">
              <Text color="$color" opacity={0.7} fontSize={12}>
                Glucides (g)
              </Text>
              <Input value={carbs} onChangeText={setCarbs} keyboardType="numeric" />
            </YStack>
            <YStack f={1} gap="$1">
              <Text color="$color" opacity={0.7} fontSize={12}>
                Lipides (g)
              </Text>
              <Input value={fats} onChangeText={setFats} keyboardType="numeric" />
            </YStack>
          </XStack>
          <Text color="$color" opacity={0.7} fontSize={12}>
            Repas types: petit dejeuner, lunch, post-workout, diner.
          </Text>
          <AppButton label="Sauvegarder plan (UI only)" />
        </YStack>
      </AppCard>
    </Screen>
  );
}
