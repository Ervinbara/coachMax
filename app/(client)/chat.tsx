import { router } from "expo-router";
import { Text, View } from "react-native";
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
      <View style={{ gap: 8 }}>
        {chatMessages.map((message) => (
          <AppCard key={message.id}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <Text style={{ color: message.sender === "coach" ? "#6266F1" : "#E8E9F5", fontWeight: "700" }}>
                {message.sender === "coach" ? t(locale, "status.coach") : t(locale, "status.me")}
              </Text>
              <Text style={{ color: "#E8E9F5", opacity: 0.55, fontSize: 11 }}>
                {new Date(message.timestamp).toLocaleDateString()}
              </Text>
            </View>
            <Text style={{ color: "#E8E9F5", opacity: 0.85 }}>{message.content}</Text>
          </AppCard>
        ))}
      </View>
    </Screen>
  );
}
