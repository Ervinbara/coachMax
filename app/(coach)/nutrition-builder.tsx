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

const inputStyle = {
  backgroundColor: "#07091a",
  borderWidth: 1,
  borderColor: "#1D2040",
  color: "#E8E9F5",
  borderRadius: 10,
  padding: 12,
  fontSize: 15,
} as const;

export default function NutritionBuilderScreen() {
  const initialized = useAuthStore((state) => state.initialized);
  const role = useAuthStore((state) => state.role);
  const locale = useLocaleStore((state) => state.locale);
  const [calories, setCalories] = useState("2500");
  const [protein, setProtein] = useState("160");
  const [carbs, setCarbs] = useState("280");
  const [fats, setFats] = useState("75");

  if (!initialized) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
  }

  if (role !== "coach") {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <Screen>
      <AppTopBar title={t(locale, "builder.nutrition.title")} subtitle={t(locale, "builder.nutrition.subtitle")} showBack backHref="/(coach)/dashboard" />
      <RoleNav role="coach" />
      <AppCard>
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#E8E9F5", fontWeight: "700", fontSize: 18 }}>
            {t(locale, "builder.nutrition.step1")}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: "#E8E9F5", opacity: 0.7, fontSize: 12 }}>Calories</Text>
              <TextInput value={calories} onChangeText={setCalories} keyboardType="numeric" style={inputStyle} placeholderTextColor="#7B80A4" />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: "#E8E9F5", opacity: 0.7, fontSize: 12 }}>Proteines (g)</Text>
              <TextInput value={protein} onChangeText={setProtein} keyboardType="numeric" style={inputStyle} placeholderTextColor="#7B80A4" />
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: "#E8E9F5", opacity: 0.7, fontSize: 12 }}>Glucides (g)</Text>
              <TextInput value={carbs} onChangeText={setCarbs} keyboardType="numeric" style={inputStyle} placeholderTextColor="#7B80A4" />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: "#E8E9F5", opacity: 0.7, fontSize: 12 }}>Lipides (g)</Text>
              <TextInput value={fats} onChangeText={setFats} keyboardType="numeric" style={inputStyle} placeholderTextColor="#7B80A4" />
            </View>
          </View>
          <Text style={{ color: "#E8E9F5", opacity: 0.7, fontSize: 12 }}>
            {t(locale, "builder.nutrition.step2")}
          </Text>
          <AppButton label={t(locale, "builder.nutrition.save")} />
        </View>
      </AppCard>
    </Screen>
  );
}
