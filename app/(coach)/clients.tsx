import { router } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import { AppButton, AppCard, Screen } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { dataService } from "../../src/services/dataService";

export default function ClientsScreen() {
  const role = useAuthStore((state) => state.role);
  const setSelectedClientId = useAuthStore((state) => state.setSelectedClientId);
  const clients = dataService.getClients();

  if (role !== "coach") {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <Screen>
      <AppTopBar title="Clients" subtitle="Gestion de tous les clients" showBack backHref="/(coach)/dashboard" />
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
                    {client.sport}
                  </Text>
                </YStack>
                <Text color="$accentColor" fontWeight="700">
                  {client.adherence}%
                </Text>
              </XStack>
              <Text color="$color" opacity={0.75} fontSize={13}>
                Objectif: {client.goal}
              </Text>
              <XStack>
                <AppButton
                  label="Ouvrir fiche client"
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
