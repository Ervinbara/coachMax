import { router } from "expo-router";
import { Text, YStack } from "tamagui";
import { AppCard, Screen } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useLocaleStore } from "../../src/features/settings/useLocaleStore";
import { useCurrentClient } from "../../src/hooks/useCurrentClient";
import { t } from "../../src/lib/i18n";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { RoleNav } from "../../src/layout/RoleNav";
import { dataService } from "../../src/services/dataService";

export default function ClientProgramScreen() {
  const role = useAuthStore((state) => state.role);
  const locale = useLocaleStore((state) => state.locale);
  const client = useCurrentClient();
  const program = client ? dataService.getProgramByClientId(client.id) : null;

  if (role !== "client") {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <Screen>
      <AppTopBar title={t(locale, "client.program.title")} showBack backHref="/(client)/dashboard" />
      <RoleNav role="client" />
      <AppCard>
        <Text color="$color" fontWeight="700" fontSize={18}>
          {program?.title ?? t(locale, "client.program.empty")}
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
