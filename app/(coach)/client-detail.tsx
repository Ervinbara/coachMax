import { useMemo } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Image, Text, View } from "react-native";
import {
  AppShell,
  Badge,
  Card,
  ProgressChartCard,
  ScrollColumn,
  SectionHeader,
  VideoPreviewCard,
} from "../../src/components/coachflow";
import { useResponsive } from "../../src/design/responsive";
import { colors, radius, spacing, typography } from "../../src/design/tokens";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useCoachflowClients } from "../../src/hooks/useCoachflowClients";
import { coachProfile } from "../../src/mocks/coachflow";

export default function CoachClientDetailScreen() {
  const params = useLocalSearchParams<{ clientId?: string }>();
  const { isDesktop } = useResponsive();
  const initialized = useAuthStore((state) => state.initialized);
  const role = useAuthStore((state) => state.role);
  const { clients, loading } = useCoachflowClients();

  const client = useMemo(() => {
    const id = typeof params.clientId === "string" ? params.clientId : clients[0]?.id;
    return clients.find((item) => item.id === id) ?? clients[0];
  }, [params.clientId, clients]);

  if (!initialized || loading) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
  }

  if (role !== "coach") {
    return <Redirect href="/(auth)/login" />;
  }

  if (!client) {
    return (
      <AppShell
        title="Profil client"
        subtitle="Aucun client"
        profileName={coachProfile.name}
        profileAvatar={coachProfile.avatarUrl}
        activeMenu="clients"
        navRole="coach"
      >
        <Card>
          <Text style={{ ...typography.body, color: colors.textSecondary }}>
            Aucun client disponible pour afficher une fiche detail.
          </Text>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={client.name}
      subtitle="Profil client"
      profileName={coachProfile.name}
      profileAvatar={coachProfile.avatarUrl}
      activeMenu="clients"
        navRole="coach"
    >
      <ScrollColumn>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <Image source={{ uri: client.heroUrl }} style={{ width: "100%", height: 210 }} />
          <View style={{ backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: "#fff", ...typography.h2 }}>{client.name}</Text>
            <Badge tone="primary" label="Actif" />
          </View>
        </Card>

        <View style={{ flexDirection: isDesktop ? "row" : "column", gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Card>
              <SectionHeader title="Infos du Client" />
              <View style={{ gap: 10 }}>
                <InfoRow label="Poids" value={`${client.weightKg} kg`} />
                <InfoRow label="Mensurations" value={`Taille ${client.mensurations.taille} cm, Hanches ${client.mensurations.hanches} cm`} />
                <InfoRow label="Objectif" value={client.objective} />
              </View>
            </Card>
          </View>
          <View style={{ flex: 1 }}>
            <Card>
              <SectionHeader title="Programme de la Semaine" />
              <View style={{ gap: spacing.sm }}>
                {client.sessions.map((session) => (
                  <View key={session.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F9FBFF", borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm }}>
                    <Text style={{ color: colors.textMain, ...typography.body }}>{session.label}</Text>
                    <Badge tone={session.done ? "success" : "warning"} label={session.done ? "Fait" : "A faire"} />
                  </View>
                ))}
              </View>
            </Card>
          </View>
        </View>

        <View style={{ flexDirection: isDesktop ? "row" : "column", gap: spacing.md }}>
          <View style={{ flex: 1.3 }}>
            <ProgressChartCard title="Evolution du Poids" values={client.chart} suffix="kg" />
          </View>
          <View style={{ flex: 1 }}>
            <Card>
              <SectionHeader title="Photos & Videos" action="+ Ajouter" />
              <View style={{ gap: spacing.sm }}>
                <VideoPreviewCard source={client.heroUrl} />
                <VideoPreviewCard source="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000&q=80" />
              </View>
            </Card>
          </View>
        </View>
      </ScrollColumn>
    </AppShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 }}>
      <Text style={{ color: colors.textSecondary, width: 108, ...typography.body }}>{label}</Text>
      <Text style={{ color: colors.textMain, flex: 1, ...typography.body, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}


