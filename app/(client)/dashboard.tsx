import { Redirect, router } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { AppButton, AppCard, DashboardWidget, Screen, StatusPill } from "../../src/components";
import { colors } from "../../src/design/tokens";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useLocaleStore } from "../../src/features/settings/useLocaleStore";
import { useCurrentClient } from "../../src/hooks/useCurrentClient";
import { t } from "../../src/lib/i18n";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { RoleNav } from "../../src/layout/RoleNav";
import { dataService } from "../../src/services/dataService";

export default function ClientDashboardScreen() {
  const initialized = useAuthStore((state) => state.initialized);
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const locale = useLocaleStore((state) => state.locale);
  const client = useCurrentClient();
  const messages = client ? dataService.getMessagesByClientId(client.id) : [];

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
      <AppTopBar
        title={`${locale === "fr" ? "Bonjour" : "Hello"} ${client.fullName.split(" ")[0]}`}
        subtitle={client.goal}
      />
      <RoleNav role="client" />
      <AppCard>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#E8E9F5", fontWeight: "800", fontSize: 19 }}>
              {locale === "fr" ? "Mon cockpit perf" : "My performance cockpit"}
            </Text>
            <StatusPill
              label={client.status}
              tone={client.status === "critical" ? "danger" : client.status === "attention" ? "warning" : "success"}
            />
          </View>
          <Text style={{ color: "#E8E9F5", opacity: 0.72 }}>
            {locale === "fr"
              ? `Prochain check-in: ${client.nextCheckIn} • Serie active: ${client.streakDays} jours`
              : `Next check-in: ${client.nextCheckIn} • Current streak: ${client.streakDays} days`}
          </Text>
        </View>
      </AppCard>

      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        <View style={{ flex: 1 }}>
          <DashboardWidget label={t(locale, "nav.progress")} value={`${client.adherence}%`} hint={locale === "fr" ? "Sur 30 jours" : "Last 30 days"} tone="accent" />
        </View>
        <View style={{ flex: 1 }}>
          <DashboardWidget label={locale === "fr" ? "Seances" : "Sessions"} value={String(client.sessionsCompleted)} tone="orange" />
        </View>
        <View style={{ flex: 1 }}>
          <DashboardWidget label={locale === "fr" ? "Minutes/semaine" : "Minutes/week"} value={String(client.weeklyMinutes)} tone="sky" />
        </View>
      </View>

      <AppCard>
        <View style={{ gap: 8 }}>
          <Text style={{ color: "#E8E9F5", fontWeight: "700", fontSize: 18 }}>
            {t(locale, "client.dashboard.space")}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <AppButton label={t(locale, "nav.program")} onPress={() => router.push("/(client)/program")} />
            <AppButton label={t(locale, "nav.nutrition")} variant="ghost" onPress={() => router.push("/(client)/nutrition")} />
            <AppButton label={t(locale, "nav.progress")} variant="ghost" onPress={() => router.push("/(client)/progress")} />
            <AppButton label={t(locale, "nav.chat")} variant="ghost" onPress={() => router.push("/(client)/chat")} />
          </View>
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 8 }}>
          <Text style={{ color: "#E8E9F5", fontWeight: "700" }}>{t(locale, "client.dashboard.videoTitle")}</Text>
          <Text style={{ color: "#E8E9F5", opacity: 0.7 }}>{t(locale, "client.dashboard.videoDesc")}</Text>
          <AppButton label={t(locale, "client.dashboard.upload")} />
          <AppButton label={t(locale, "common.logout")} variant="ghost" onPress={logout} />
        </View>
      </AppCard>

      <AppCard>
        <View style={{ gap: 8 }}>
          <Text style={{ color: "#E8E9F5", fontWeight: "700" }}>{t(locale, "client.dashboard.messages")}</Text>
          {messages.slice(-3).map((message) => (
            <View key={message.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: "#E8E9F5", opacity: 0.8, flex: 1 }}>{message.content}</Text>
              <StatusPill label={message.sender === "coach" ? t(locale, "status.coach") : t(locale, "status.me")} tone="neutral" />
            </View>
          ))}
        </View>
      </AppCard>
    </Screen>
  );
}
