import { useMemo } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import { AppButton, AppCard, ProgressChart, Screen } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { dataService } from "../../src/services/dataService";

export default function ClientDetailScreen() {
  const role = useAuthStore((state) => state.role);
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
        <AppTopBar title="Client introuvable" showBack backHref="/(coach)/clients" />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppTopBar title={client.fullName} subtitle={client.goal} showBack backHref="/(coach)/clients" />
      <XStack gap="$3" $sm={{ fd: "column" }}>
        <YStack f={1}>
          <AppCard>
            <Text color="$color" fontWeight="700">
              Infos client
            </Text>
            <Text color="$color" opacity={0.75}>
              Sport: {client.sport}
            </Text>
            <Text color="$color" opacity={0.75}>
              Adherence: {client.adherence}%
            </Text>
            <Text color="$color" opacity={0.75}>
              Seances terminees: {client.sessionsCompleted}
            </Text>
          </AppCard>
        </YStack>
        <YStack f={1}>
          <AppCard>
            <Text color="$color" fontWeight="700">
              Programme actuel
            </Text>
            <Text color="$color" opacity={0.75}>
              {program?.title ?? "Aucun programme actif"}
            </Text>
          </AppCard>
        </YStack>
      </XStack>

      <AppCard>
        <Text color="$color" fontWeight="700">
          Progression
        </Text>
        <ProgressChart data={client.progress} />
      </AppCard>

      <AppCard>
        <Text color="$color" fontWeight="700">
          Plan alimentaire
        </Text>
        <Text color="$color" opacity={0.75}>
          Cible: {nutrition?.targetCalories ?? "-"} kcal | P {nutrition?.proteinTarget ?? "-"}g / C{" "}
          {nutrition?.carbTarget ?? "-"}g / F {nutrition?.fatTarget ?? "-"}g
        </Text>
      </AppCard>

      <AppCard>
        <Text color="$color" fontWeight="700">
          Chat recent
        </Text>
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
            <AppButton label="Modifier programme" />
          </XStack>
        </Link>
        <Link href="/(coach)/nutrition-builder" asChild>
          <XStack>
            <AppButton label="Modifier nutrition" variant="ghost" />
          </XStack>
        </Link>
      </XStack>
    </Screen>
  );
}
