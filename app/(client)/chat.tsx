import { router } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import { AppCard, Screen } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useLocaleStore } from "../../src/features/settings/useLocaleStore";
import { useCurrentClient } from "../../src/hooks/useCurrentClient";
import { t } from "../../src/lib/i18n";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { RoleNav } from "../../src/layout/RoleNav";
import { dataService } from "../../src/services/dataService";

export default function ClientChatScreen() {
  const role = useAuthStore((state) => state.role);
  const locale = useLocaleStore((state) => state.locale);
  const client = useCurrentClient();
  const chatMessages = client ? dataService.getMessagesByClientId(client.id) : [];

  if (role !== "client") {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <Screen>
      <AppTopBar title={t(locale, "client.chat.title")} showBack backHref="/(client)/dashboard" />
      <RoleNav role="client" />
      <YStack gap="$2">
        {chatMessages.map((message) => (
          <AppCard key={message.id}>
            <XStack jc="space-between" ai="center" gap="$2">
              <Text color={message.sender === "coach" ? "$accentColor" : "$color"} fontWeight="700">
                {message.sender === "coach" ? t(locale, "status.coach") : t(locale, "status.me")}
              </Text>
              <Text color="$color" opacity={0.55} fontSize={11}>
                {new Date(message.timestamp).toLocaleDateString()}
              </Text>
            </XStack>
            <Text color="$color" opacity={0.85}>
              {message.content}
            </Text>
          </AppCard>
        ))}
      </YStack>
    </Screen>
  );
}
