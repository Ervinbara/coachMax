import { useMemo } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import {
  AppShell,
  Card,
  ClientRowCard,
  ProgressChartCard,
  ScrollColumn,
  SectionHeader,
  StatCard,
  TaskListCard,
} from "../../src/components/coachflow";
import { useResponsive } from "../../src/design/responsive";
import { colors, spacing, typography } from "../../src/design/tokens";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useCoachflowClients } from "../../src/hooks/useCoachflowClients";
import { coachProfile, dayTasks, globalProgress } from "../../src/mocks/coachflow";

export default function CoachDashboardScreen() {
  const { isDesktop, isTablet } = useResponsive();
  const initialized = useAuthStore((state) => state.initialized);
  const role = useAuthStore((state) => state.role);
  const { clients, loading, error } = useCoachflowClients();

  const topClients = useMemo(() => clients.slice(0, 3), [clients]);

  if (!initialized || loading) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
  }

  if (role !== "coach") {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <AppShell
      title="Bonjour Thomas!"
      subtitle="Vue globale de vos clients"
      profileName={coachProfile.name}
      profileAvatar={coachProfile.avatarUrl}
      activeMenu="dashboard"
      navRole="coach"
    >
      <ScrollColumn>
        <View style={{ flexDirection: "row", gap: spacing.md, flexWrap: "wrap" }}>
          <StatCard label="Clients actifs" value={String(clients.length)} hint="Suivi actif" />
          <StatCard label="Messages" value="-" hint="Voir messagerie" />
          <StatCard label="Poids moyen" value="-" hint="En cours" />
        </View>

        <Card>
          <SectionHeader title="Mes Clients" action="Ajouter un client" />
          {error ? <Text style={{ ...typography.small, color: "#D94343" }}>{error}</Text> : null}
          <View style={{ gap: spacing.sm }}>
            {topClients.map((client) => (
              <ClientRowCard key={client.id} client={client} href={`/(coach)/client-detail?clientId=${client.id}`} />
            ))}
            {!topClients.length ? (
              <Text style={{ ...typography.small, color: colors.textSecondary }}>
                Aucun client lie. Ajoutez un client ou liez un compte client a ce coach.
              </Text>
            ) : null}
          </View>
        </Card>

        <View style={{ flexDirection: isDesktop || isTablet ? "row" : "column", gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <ProgressChartCard title="Progression Globale" values={globalProgress} suffix="kg" />
          </View>
          <View style={{ flex: 1 }}>
            <TaskListCard tasks={dayTasks} />
          </View>
        </View>
      </ScrollColumn>
    </AppShell>
  );
}

