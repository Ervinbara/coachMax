import { Redirect } from "expo-router";
import { ActivityIndicator, Text } from "react-native";
import { AppCard, ProgressChart, Screen } from "../../src/components";
import { colors } from "../../src/design/tokens";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useLocaleStore } from "../../src/features/settings/useLocaleStore";
import { useCurrentClient } from "../../src/hooks/useCurrentClient";
import { t } from "../../src/lib/i18n";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { RoleNav } from "../../src/layout/RoleNav";

export default function ClientProgressScreen() {
  const initialized = useAuthStore((state) => state.initialized);
  const role = useAuthStore((state) => state.role);
  const locale = useLocaleStore((state) => state.locale);
  const client = useCurrentClient();

  if (!initialized) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
  }

  if (role !== "client") {
    return <Redirect href="/(auth)/login" />;
  }

  if (!client) {
    return null;
  }

  return (
    <Screen>
      <AppTopBar title={t(locale, "client.progress.title")} subtitle={t(locale, "client.progress.subtitle")} showBack backHref="/(client)/dashboard" />
      <RoleNav role="client" />
      <AppCard>
        <Text style={{ color: "#E8E9F5", fontWeight: "700" }}>
          {t(locale, "client.progress.score")}
        </Text>
        <ProgressChart data={client.progress} />
      </AppCard>
    </Screen>
  );
}
