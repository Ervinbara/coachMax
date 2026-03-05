import { useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { AppButton, AppCard, ProgressChart, Screen, StatusPill } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useLocaleStore } from "../../src/features/settings/useLocaleStore";
import { t } from "../../src/lib/i18n";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { RoleNav } from "../../src/layout/RoleNav";
import { dataService } from "../../src/services/dataService";

export default function ClientDetailScreen() {
  const role = useAuthStore((state) => state.role);
  const locale = useLocaleStore((state) => state.locale);
  const params = useLocalSearchParams<{ clientId?: string }>();
  const selectedClientId = useAuthStore((state) => state.selectedClientId);

  const clientId = params.clientId || selectedClientId;
  const client = useMemo(() => dataService.getClientById(clientId), [clientId]);
  const program = useMemo(() => dataService.getProgramByClientId(clientId), [clientId]);
  const nutrition = useMemo(() => dataService.getNutritionByClientId(clientId), [clientId]);
  const chatMessages = useMemo(() => dataService.getMessagesByClientId(clientId), [clientId]);

  if (role !== "coach") {
    router.replace("/(auth)/login");
    return null;
  }

  if (!client) {
    return (
      <Screen>
        <AppTopBar title={t(locale, "detail.notFound")} showBack backHref="/(coach)/clients" />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppTopBar title={client.fullName} subtitle={client.goal} showBack backHref="/(coach)/clients" />
      <RoleNav role="coach" />
      <AppCard>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <View style={{ gap: 4 }}>
            <Text style={{ color: "#E8E9F5", fontWeight: "800", fontSize: 24 }}>{client.fullName}</Text>
            <Text style={{ color: "#7B80A4" }}>{client.sport}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <StatusPill label={`${locale === "fr" ? "Poids" : "Weight"} ${client.currentWeightKg}kg`} tone="neutral" />
            <StatusPill label={`${t(locale, "clients.goal")} ${client.targetWeightKg}kg`} tone="success" />
            <StatusPill label={`check-in ${client.nextCheckIn}`} tone="warning" />
          </View>
        </View>
      </AppCard>

      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        <View style={{ flex: 1 }}>
          <AppCard>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: "#E8E9F5", fontWeight: "700" }}>{t(locale, "detail.clientInfo")}</Text>
              <StatusPill
                label={client.status}
                tone={client.status === "critical" ? "danger" : client.status === "attention" ? "warning" : "success"}
              />
            </View>
            <Text style={{ color: "#E8E9F5", opacity: 0.75 }}>{client.sport}</Text>
            <Text style={{ color: "#E8E9F5", opacity: 0.75 }}>Adherence: {client.adherence}%</Text>
            <Text style={{ color: "#E8E9F5", opacity: 0.75 }}>
              {locale === "fr" ? "Seances terminees" : "Sessions done"}: {client.sessionsCompleted}
            </Text>
            <Text style={{ color: "#E8E9F5", opacity: 0.75 }}>
              {locale === "fr" ? "Poids" : "Weight"}: {client.currentWeightKg}kg ({t(locale, "clients.goal").toLowerCase()} {client.targetWeightKg}kg)
            </Text>
            <Text style={{ color: "#E8E9F5", opacity: 0.75 }}>
              {locale === "fr" ? "Serie active" : "Current streak"}: {client.streakDays} {locale === "fr" ? "jours" : "days"}
            </Text>
          </AppCard>
        </View>
        <View style={{ flex: 1 }}>
          <AppCard>
            <Text style={{ color: "#E8E9F5", fontWeight: "700" }}>{t(locale, "detail.currentProgram")}</Text>
            <Text style={{ color: "#E8E9F5", opacity: 0.75 }}>
              {program?.title ?? (locale === "fr" ? "Aucun programme actif" : "No active program")}
            </Text>
            <Text style={{ color: "#E8E9F5", opacity: 0.75 }}>Check-in: {client.nextCheckIn}</Text>
          </AppCard>
        </View>
      </View>

      <AppCard>
        <Text style={{ color: "#E8E9F5", fontWeight: "700" }}>{t(locale, "detail.progress")}</Text>
        <ProgressChart data={client.progress} />
      </AppCard>

      <AppCard>
        <Text style={{ color: "#E8E9F5", fontWeight: "700" }}>{t(locale, "detail.nutrition")}</Text>
        <Text style={{ color: "#E8E9F5", opacity: 0.75 }}>
          {locale === "fr" ? "Cible" : "Target"}: {nutrition?.targetCalories ?? "-"} kcal | P {nutrition?.proteinTarget ?? "-"}g / C{" "}
          {nutrition?.carbTarget ?? "-"}g / F {nutrition?.fatTarget ?? "-"}g
        </Text>
        <View style={{ gap: 4 }}>
          {nutrition?.meals.slice(0, 2).map((meal) => (
            <Text key={meal.time} style={{ color: "#E8E9F5", opacity: 0.65, fontSize: 12 }}>
              {meal.time} - {meal.label}
            </Text>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <Text style={{ color: "#E8E9F5", fontWeight: "700" }}>{t(locale, "detail.chatRecent")}</Text>
        <View style={{ gap: 8 }}>
          {chatMessages.slice(-3).map((message) => (
            <View key={message.id} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#E8E9F5", opacity: 0.8, flex: 1 }}>{message.content}</Text>
              <Text style={{ color: "#6266F1", fontSize: 11 }}>{message.sender}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <AppButton label={t(locale, "detail.editProgram")} onPress={() => router.push("/(coach)/program-builder")} />
        <AppButton label={t(locale, "detail.editNutrition")} variant="ghost" onPress={() => router.push("/(coach)/nutrition-builder")} />
      </View>
    </Screen>
  );
}
