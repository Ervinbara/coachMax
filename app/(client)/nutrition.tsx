import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { AppCard, Screen } from "../../src/components";
import { colors } from "../../src/design/tokens";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useLocaleStore } from "../../src/features/settings/useLocaleStore";
import { useCurrentClient } from "../../src/hooks/useCurrentClient";
import { t } from "../../src/lib/i18n";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { RoleNav } from "../../src/layout/RoleNav";
import { dataService } from "../../src/services/dataService";

export default function ClientNutritionScreen() {
  const initialized = useAuthStore((state) => state.initialized);
  const role = useAuthStore((state) => state.role);
  const locale = useLocaleStore((state) => state.locale);
  const client = useCurrentClient();
  const nutrition = client ? dataService.getNutritionByClientId(client.id) : null;

  if (!initialized) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
  }

  if (role !== "client") {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Screen>
      <AppTopBar title={t(locale, "client.nutrition.title")} showBack backHref="/(client)/dashboard" />
      <RoleNav role="client" />
      <AppCard>
        <Text style={{ color: "#E8E9F5", fontWeight: "700", fontSize: 18 }}>
          {t(locale, "client.nutrition.dailyTargets")}
        </Text>
        <Text style={{ color: "#E8E9F5", opacity: 0.8 }}>
          {nutrition?.targetCalories ?? "-"} kcal | P {nutrition?.proteinTarget ?? "-"} / C{" "}
          {nutrition?.carbTarget ?? "-"} / F {nutrition?.fatTarget ?? "-"}
        </Text>
      </AppCard>
      <View style={{ gap: 8 }}>
        {nutrition?.meals.map((meal) => (
          <AppCard key={`${meal.time}-${meal.label}`}>
            <Text style={{ color: "#6266F1", fontWeight: "700" }}>
              {meal.time} - {meal.label}
            </Text>
            <Text style={{ color: "#E8E9F5", opacity: 0.8, fontSize: 13 }}>
              {meal.calories} kcal | P {meal.proteins}g / C {meal.carbs}g / F {meal.fats}g
            </Text>
          </AppCard>
        ))}
      </View>
    </Screen>
  );
}
