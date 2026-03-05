import { router } from "expo-router";
import { Text } from "tamagui";
import { AppCard, ProgressChart, Screen } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useCurrentClient } from "../../src/hooks/useCurrentClient";
import { AppTopBar } from "../../src/layout/AppTopBar";

export default function ClientProgressScreen() {
  const role = useAuthStore((state) => state.role);
  const client = useCurrentClient();

  if (role !== "client") {
    router.replace("/(auth)/login");
    return null;
  }

  if (!client) {
    return null;
  }

  return (
    <Screen>
      <AppTopBar title="Progression" subtitle="Evolution des performances" showBack backHref="/(client)/dashboard" />
      <AppCard>
        <Text color="$color" fontWeight="700">
          Score de progression
        </Text>
        <ProgressChart data={client.progress} />
      </AppCard>
    </Screen>
  );
}
