import { Link, router } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import { AppButton, AppCard, DashboardWidget, Screen } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { dataService } from "../../src/services/dataService";

export default function CoachDashboardScreen() {
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const clients = dataService.getClients();
  const totalSessions = clients.reduce((acc, client) => acc + client.sessionsCompleted, 0);
  const avgAdherence = Math.round(clients.reduce((acc, client) => acc + client.adherence, 0) / clients.length);

  if (role !== "coach") {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <Screen>
      <AppTopBar title="Dashboard Coach" subtitle="Vue globale des clients et performances" />

      <XStack gap="$3" $sm={{ fd: "column" }}>
        <YStack f={1}>
          <DashboardWidget label="Clients actifs" value={String(clients.length)} hint="+2 cette semaine" />
        </YStack>
        <YStack f={1}>
          <DashboardWidget label="Seances completees" value={String(totalSessions)} hint="MVP mock data" />
        </YStack>
        <YStack f={1}>
          <DashboardWidget label="Adherence moyenne" value={`${avgAdherence}%`} hint="Objectif > 80%" />
        </YStack>
      </XStack>

      <AppCard>
        <YStack gap="$3">
          <Text color="$color" fontWeight="700" fontSize={18}>
            Acces rapide
          </Text>
          <XStack gap="$2" $sm={{ fd: "column" }}>
            <Link href="/(coach)/clients" asChild>
              <XStack>
                <AppButton label="Voir clients" />
              </XStack>
            </Link>
            <Link href="/(coach)/program-builder" asChild>
              <XStack>
                <AppButton label="Program builder" variant="ghost" />
              </XStack>
            </Link>
            <Link href="/(coach)/nutrition-builder" asChild>
              <XStack>
                <AppButton label="Nutrition builder" variant="ghost" />
              </XStack>
            </Link>
            <AppButton label="Deconnexion" variant="ghost" onPress={logout} />
          </XStack>
        </YStack>
      </AppCard>

      <AppCard>
        <YStack gap="$2">
          <Text color="$color" fontWeight="700" fontSize={18}>
            Derniers clients suivis
          </Text>
          {clients.slice(0, 3).map((client) => (
            <Link
              key={client.id}
              href={{ pathname: "/(coach)/client-detail", params: { clientId: client.id } }}
              asChild
            >
              <XStack
                px="$3"
                py="$2"
                jc="space-between"
                ai="center"
                br="$4"
                borderWidth={1}
                borderColor="$borderColor"
                bg="rgba(255,255,255,0.02)"
              >
                <YStack>
                  <Text color="$color" fontWeight="600">
                    {client.fullName}
                  </Text>
                  <Text color="$color" opacity={0.6} fontSize={12}>
                    {client.goal}
                  </Text>
                </YStack>
                <Text color="$accentColor">{client.adherence}%</Text>
              </XStack>
            </Link>
          ))}
        </YStack>
      </AppCard>
    </Screen>
  );
}
