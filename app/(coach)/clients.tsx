import { router } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import { AppButton, AppCard, Screen, StatusPill } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useLocaleStore } from "../../src/features/settings/useLocaleStore";
import { t } from "../../src/lib/i18n";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { RoleNav } from "../../src/layout/RoleNav";
import { dataService } from "../../src/services/dataService";

export default function ClientsScreen() {
  const role = useAuthStore((state) => state.role);
  const locale = useLocaleStore((state) => state.locale);
  const setSelectedClientId = useAuthStore((state) => state.setSelectedClientId);
  const clients = dataService.getClients();

  if (role !== "coach") {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <Screen>
      <AppTopBar title={t(locale, "nav.clients")} subtitle={t(locale, "clients.subtitle")} showBack backHref="/(coach)/dashboard" />
      <RoleNav role="coach" />
      <YStack gap="$3">
        {clients.map((client) => (
          <AppCard key={client.id}>
            <YStack gap="$2">
              <XStack jc="space-between" ai="center">
                <YStack>
                  <Text color="$color" fontWeight="700" fontSize={17}>
                    {client.fullName}
                  </Text>
                  <Text color="$color" opacity={0.7} fontSize={12}>
                    {client.sport} • {locale === "fr" ? "prochain check-in" : "next check-in"} {client.nextCheckIn}
                  </Text>
                </YStack>
                <StatusPill
                  label={client.status}
                  tone={client.status === "critical" ? "danger" : client.status === "attention" ? "warning" : "success"}
                />
              </XStack>
              <XStack jc="space-between" ai="center">
                <Text color="$color" opacity={0.75} fontSize={13}>{t(locale, "clients.goal")}: {client.goal}</Text>
                <Text color="$accentColor" fontWeight="700">{client.adherence}%</Text>
              </XStack>
              <Text color="$color" opacity={0.6} fontSize={12}>
                {locale === "fr"
                  ? `Poids ${client.currentWeightKg}kg vers cible ${client.targetWeightKg}kg | serie ${client.streakDays} jours`
                  : `Weight ${client.currentWeightKg}kg toward ${client.targetWeightKg}kg target | streak ${client.streakDays} days`}
              </Text>
              <XStack>
                <AppButton
                  label={t(locale, "clients.openProfile")}
                  onPress={() => {
                    setSelectedClientId(client.id);
                    router.push({ pathname: "/(coach)/client-detail", params: { clientId: client.id } });
                  }}
                />
              </XStack>
            </YStack>
          </AppCard>
        ))}
      </YStack>
    </Screen>
  );
}
