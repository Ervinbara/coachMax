import { Link, router } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import { AppButton, AppCard, DashboardWidget, Screen, StatusPill } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useLocaleStore } from "../../src/features/settings/useLocaleStore";
import { useCurrentClient } from "../../src/hooks/useCurrentClient";
import { t } from "../../src/lib/i18n";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { RoleNav } from "../../src/layout/RoleNav";
import { dataService } from "../../src/services/dataService";

export default function ClientDashboardScreen() {
  const role = useAuthStore((state) => state.role);
  const logout = useAuthStore((state) => state.logout);
  const locale = useLocaleStore((state) => state.locale);
  const client = useCurrentClient();
  const messages = client ? dataService.getMessagesByClientId(client.id) : [];

  if (role !== "client") {
    router.replace("/(auth)/login");
    return null;
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
        <YStack gap="$2">
          <XStack jc="space-between" ai="center">
            <Text color="$color" fontWeight="800" fontSize={19}>
              {locale === "fr" ? "Mon cockpit perf" : "My performance cockpit"}
            </Text>
            <StatusPill
              label={client.status}
              tone={client.status === "critical" ? "danger" : client.status === "attention" ? "warning" : "success"}
            />
          </XStack>
          <Text color="$color" opacity={0.72}>
            {locale === "fr"
              ? `Prochain check-in: ${client.nextCheckIn} • Serie active: ${client.streakDays} jours`
              : `Next check-in: ${client.nextCheckIn} • Current streak: ${client.streakDays} days`}
          </Text>
        </YStack>
      </AppCard>
      <XStack gap="$3" $sm={{ fd: "column" }}>
        <YStack f={1}>
          <DashboardWidget label={t(locale, "nav.progress")} value={`${client.adherence}%`} hint={locale === "fr" ? "Sur 30 jours" : "Last 30 days"} tone="accent" />
        </YStack>
        <YStack f={1}>
          <DashboardWidget label={locale === "fr" ? "Seances" : "Sessions"} value={String(client.sessionsCompleted)} tone="orange" />
        </YStack>
        <YStack f={1}>
          <DashboardWidget label={locale === "fr" ? "Minutes/semaine" : "Minutes/week"} value={String(client.weeklyMinutes)} tone="sky" />
        </YStack>
      </XStack>

      <AppCard>
        <YStack gap="$2">
          <Text color="$color" fontWeight="700" fontSize={18}>
            {t(locale, "client.dashboard.space")}
          </Text>
          <XStack gap="$2" fw="wrap">
            <Link href="/(client)/program" asChild>
              <XStack>
                <AppButton label={t(locale, "nav.program")} />
              </XStack>
            </Link>
            <Link href="/(client)/nutrition" asChild>
              <XStack>
                <AppButton label={t(locale, "nav.nutrition")} variant="ghost" />
              </XStack>
            </Link>
            <Link href="/(client)/progress" asChild>
              <XStack>
                <AppButton label={t(locale, "nav.progress")} variant="ghost" />
              </XStack>
            </Link>
            <Link href="/(client)/chat" asChild>
              <XStack>
                <AppButton label={t(locale, "nav.chat")} variant="ghost" />
              </XStack>
            </Link>
          </XStack>
        </YStack>
      </AppCard>

      <AppCard>
        <YStack gap="$2">
          <Text color="$color" fontWeight="700">{t(locale, "client.dashboard.videoTitle")}</Text>
          <Text color="$color" opacity={0.7}>{t(locale, "client.dashboard.videoDesc")}</Text>
          <AppButton label={t(locale, "client.dashboard.upload")} />
          <AppButton label={t(locale, "common.logout")} variant="ghost" onPress={logout} />
        </YStack>
      </AppCard>

      <AppCard>
        <YStack gap="$2">
          <Text color="$color" fontWeight="700">{t(locale, "client.dashboard.messages")}</Text>
          {messages.slice(-3).map((message) => (
            <XStack key={message.id} jc="space-between" ai="center">
              <Text color="$color" opacity={0.8} f={1}>
                {message.content}
              </Text>
              <StatusPill label={message.sender === "coach" ? t(locale, "status.coach") : t(locale, "status.me")} tone="neutral" />
            </XStack>
          ))}
        </YStack>
      </AppCard>
    </Screen>
  );
}
