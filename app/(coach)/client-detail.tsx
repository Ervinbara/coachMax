import { useMemo } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
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
        <XStack jc="space-between" ai="center" $sm={{ fd: "column", ai: "flex-start", gap: "$2" }}>
          <YStack gap="$1">
            <Text color="#E8E9F5" fontWeight="800" fontSize={24}>
              {client.fullName}
            </Text>
            <Text color="#7B80A4">{client.sport}</Text>
          </YStack>
          <XStack gap="$2" fw="wrap">
            <StatusPill label={`${locale === "fr" ? "Poids" : "Weight"} ${client.currentWeightKg}kg`} tone="neutral" />
            <StatusPill label={`${t(locale, "clients.goal")} ${client.targetWeightKg}kg`} tone="success" />
            <StatusPill label={`check-in ${client.nextCheckIn}`} tone="warning" />
          </XStack>
        </XStack>
      </AppCard>
      <XStack gap="$3" $sm={{ fd: "column" }}>
        <YStack f={1}>
          <AppCard>
            <XStack jc="space-between" ai="center">
              <Text color="$color" fontWeight="700">{t(locale, "detail.clientInfo")}</Text>
              <StatusPill
                label={client.status}
                tone={client.status === "critical" ? "danger" : client.status === "attention" ? "warning" : "success"}
              />
            </XStack>
            <Text color="$color" opacity={0.75}>{client.sport}</Text>
            <Text color="$color" opacity={0.75}>Adherence: {client.adherence}%</Text>
            <Text color="$color" opacity={0.75}>{locale === "fr" ? "Seances terminees" : "Sessions done"}: {client.sessionsCompleted}</Text>
            <Text color="$color" opacity={0.75}>
              {locale === "fr" ? "Poids" : "Weight"}: {client.currentWeightKg}kg ({t(locale, "clients.goal").toLowerCase()} {client.targetWeightKg}kg)
            </Text>
            <Text color="$color" opacity={0.75}>
              {locale === "fr" ? "Serie active" : "Current streak"}: {client.streakDays} {locale === "fr" ? "jours" : "days"}
            </Text>
          </AppCard>
        </YStack>
        <YStack f={1}>
          <AppCard>
            <Text color="$color" fontWeight="700">{t(locale, "detail.currentProgram")}</Text>
            <Text color="$color" opacity={0.75}>{program?.title ?? (locale === "fr" ? "Aucun programme actif" : "No active program")}</Text>
            <Text color="$color" opacity={0.75}>Check-in: {client.nextCheckIn}</Text>
          </AppCard>
        </YStack>
      </XStack>

      <AppCard>
        <Text color="$color" fontWeight="700">{t(locale, "detail.progress")}</Text>
        <ProgressChart data={client.progress} />
      </AppCard>

      <AppCard>
        <Text color="$color" fontWeight="700">{t(locale, "detail.nutrition")}</Text>
        <Text color="$color" opacity={0.75}>
          {locale === "fr" ? "Cible" : "Target"}: {nutrition?.targetCalories ?? "-"} kcal | P {nutrition?.proteinTarget ?? "-"}g / C{" "}
          {nutrition?.carbTarget ?? "-"}g / F {nutrition?.fatTarget ?? "-"}g
        </Text>
        <YStack gap="$1">
          {nutrition?.meals.slice(0, 2).map((meal) => (
            <Text key={meal.time} color="$color" opacity={0.65} fontSize={12}>
              {meal.time} - {meal.label}
            </Text>
          ))}
        </YStack>
      </AppCard>

      <AppCard>
        <Text color="$color" fontWeight="700">{t(locale, "detail.chatRecent")}</Text>
        <YStack gap="$2">
          {chatMessages.slice(-3).map((message) => (
            <XStack key={message.id} jc="space-between">
              <Text color="$color" opacity={0.8} f={1}>
                {message.content}
              </Text>
              <Text color="$accentColor" fontSize={11}>
                {message.sender}
              </Text>
            </XStack>
          ))}
        </YStack>
      </AppCard>

      <XStack gap="$2" $sm={{ fd: "column" }}>
        <Link href="/(coach)/program-builder" asChild>
          <XStack>
            <AppButton label={t(locale, "detail.editProgram")} />
          </XStack>
        </Link>
        <Link href="/(coach)/nutrition-builder" asChild>
          <XStack>
            <AppButton label={t(locale, "detail.editNutrition")} variant="ghost" />
          </XStack>
        </Link>
      </XStack>
    </Screen>
  );
}
