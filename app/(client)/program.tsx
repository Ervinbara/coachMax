import { router } from "expo-router";
import { Text, YStack } from "tamagui";
import { AppCard, Screen } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useCurrentClient } from "../../src/hooks/useCurrentClient";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { dataService } from "../../src/services/dataService";

export default function ClientProgramScreen() {
  const role = useAuthStore((state) => state.role);
  const client = useCurrentClient();
  const program = client ? dataService.getProgramByClientId(client.id) : null;

  if (role !== "client") {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <Screen>
      <AppTopBar title="Mon programme" showBack backHref="/(client)/dashboard" />
      <AppCard>
        <Text color="$color" fontWeight="700" fontSize={18}>
          {program?.title ?? "Pas de programme actif"}
        </Text>
        <YStack gap="$2">
          {program?.sessions.map((session) => (
            <YStack key={`${session.day}-${session.focus}`} p="$2" br="$4" bg="rgba(255,255,255,0.02)">
              <Text color="$accentColor" fontWeight="700">
                {session.day} - {session.focus}
              </Text>
              <Text color="$color" opacity={0.75} fontSize={13}>
                {session.exercises.join(", ")}
              </Text>
            </YStack>
          ))}
        </YStack>
      </AppCard>
    </Screen>
  );
}
