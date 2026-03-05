import { Link, router } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import { AppButton, AppCard, DashboardWidget, Screen } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useCurrentClient } from "../../src/hooks/useCurrentClient";
import { AppTopBar } from "../../src/layout/AppTopBar";

export default function ClientDashboardScreen() {
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
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
      <AppTopBar title={`Bonjour ${client.fullName.split(" ")[0]}`} subtitle={client.goal} />
      <XStack gap="$3" $sm={{ fd: "column" }}>
        <YStack f={1}>
          <DashboardWidget label="Progression" value={`${client.adherence}%`} hint="Sur 30 jours" />
        </YStack>
        <YStack f={1}>
          <DashboardWidget label="Seances terminees" value={String(client.sessionsCompleted)} />
        </YStack>
        <YStack f={1}>
          <DashboardWidget label="Minutes / semaine" value={String(client.weeklyMinutes)} />
        </YStack>
      </XStack>

      <AppCard>
        <YStack gap="$2">
          <Text color="$color" fontWeight="700" fontSize={18}>
            Espace client
          </Text>
          <XStack gap="$2" fw="wrap">
            <Link href="/(client)/program" asChild>
              <XStack>
                <AppButton label="Programme" />
              </XStack>
            </Link>
            <Link href="/(client)/nutrition" asChild>
              <XStack>
                <AppButton label="Nutrition" variant="ghost" />
              </XStack>
            </Link>
            <Link href="/(client)/progress" asChild>
              <XStack>
                <AppButton label="Progression" variant="ghost" />
              </XStack>
            </Link>
            <Link href="/(client)/chat" asChild>
              <XStack>
                <AppButton label="Chat" variant="ghost" />
              </XStack>
            </Link>
          </XStack>
        </YStack>
      </AppCard>

      <AppCard>
        <YStack gap="$2">
          <Text color="$color" fontWeight="700">
            Upload video
          </Text>
          <Text color="$color" opacity={0.7}>
            Envoi d'une video d'exercice pour feedback (UI uniquement).
          </Text>
          <AppButton label="Uploader une video" />
          <AppButton label="Deconnexion" variant="ghost" onPress={logout} />
        </YStack>
      </AppCard>
    </Screen>
  );
}
