import { router } from "expo-router";
import { Text, YStack } from "tamagui";
import { AppCard, Screen } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useLocaleStore } from "../../src/features/settings/useLocaleStore";
import { useCurrentClient } from "../../src/hooks/useCurrentClient";
import { t } from "../../src/lib/i18n";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { RoleNav } from "../../src/layout/RoleNav";
import { dataService } from "../../src/services/dataService";

export default function ClientNutritionScreen() {
  const role = useAuthStore((state) => state.role);
  const locale = useLocaleStore((state) => state.locale);
  const client = useCurrentClient();
  const nutrition = client ? dataService.getNutritionByClientId(client.id) : null;

  if (role !== "client") {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <Screen>
      <AppTopBar title={t(locale, "client.nutrition.title")} showBack backHref="/(client)/dashboard" />
      <RoleNav role="client" />
      <AppCard>
        <Text color="$color" fontWeight="700" fontSize={18}>
          {t(locale, "client.nutrition.dailyTargets")}
        </Text>
        <Text color="$color" opacity={0.8}>
          {nutrition?.targetCalories ?? "-"} kcal | P {nutrition?.proteinTarget ?? "-"} / C{" "}
          {nutrition?.carbTarget ?? "-"} / F {nutrition?.fatTarget ?? "-"}
        </Text>
      </AppCard>
      <YStack gap="$2">
        {nutrition?.meals.map((meal) => (
          <AppCard key={`${meal.time}-${meal.label}`}>
            <Text color="$accentColor" fontWeight="700">
              {meal.time} - {meal.label}
            </Text>
            <Text color="$color" opacity={0.8} fontSize={13}>
              {meal.calories} kcal | P {meal.proteins}g / C {meal.carbs}g / F {meal.fats}g
            </Text>
          </AppCard>
        ))}
      </YStack>
    </Screen>
  );
}
