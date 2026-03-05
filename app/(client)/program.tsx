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
        <Text style={{ color: "#E8E9F5", fontWeight: "700", fontSize: 18 }}>
          {program?.title ?? t(locale, "client.program.empty")}
        </Text>
        <View style={{ gap: 8 }}>
          {program?.sessions.map((session) => (
            <View
              key={`${session.day}-${session.focus}`}
              style={{ padding: 8, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.02)" }}
            >
              <Text style={{ color: "#6266F1", fontWeight: "700" }}>
                {session.day} - {session.focus}
              </Text>
              <Text style={{ color: "#E8E9F5", opacity: 0.75, fontSize: 13 }}>
                {session.exercises.join(", ")}
              </Text>
            </View>
          ))}
        </View>
      </AppCard>
    </Screen>
  );
}
