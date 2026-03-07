import { useEffect, useMemo, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import {
  AppShell,
  Avatar,
  Card,
  ProgressChartCard,
  ScrollColumn,
  WorkoutCard,
} from "../../src/components/coachflow";
import { useResponsive } from "../../src/design/responsive";
import { colors, spacing } from "../../src/design/tokens";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useClientCoaches } from "../../src/hooks/useClientCoaches";
import { useClientInvitations } from "../../src/hooks/useClientInvitations";
import { useCoachflowClients } from "../../src/hooks/useCoachflowClients";
import { globalProgress } from "../../src/mocks/coachflow";
import { fetchClientProgram } from "../../src/services/coachflowService";

export default function ClientProgramScreen() {
  const { isDesktop } = useResponsive();
  const initialized = useAuthStore((state) => state.initialized);
  const role = useAuthStore((state) => state.role);
  const selectedCoachId = useAuthStore((state) => state.selectedCoachId);
  const setSelectedCoachId = useAuthStore((state) => state.setSelectedCoachId);
  const { clients, loading, reload: reloadClients } = useCoachflowClients();
  const { coaches, loading: loadingCoaches, error: coachesError, reload: reloadCoaches } = useClientCoaches();
  const {
    invitations,
    loading: loadingInvitations,
    error: invitationsError,
    accept: acceptInvitation,
  } = useClientInvitations();
  const [invitationFeedback, setInvitationFeedback] = useState<string | null>(null);

  const client = useMemo(() => clients[0], [clients]);
  const [programTitle, setProgramTitle] = useState("Full Body");
  const [programSessions, setProgramSessions] = useState(client?.sessions ?? []);

  useEffect(() => {
    if (!client) return;
    const loadProgram = async () => {
      const data = await fetchClientProgram(client.id, selectedCoachId || undefined);
      setProgramTitle(data.title);
      setProgramSessions(data.sessions);
    };
    loadProgram();
  }, [client, selectedCoachId]);

  if (!initialized || loading) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
  }

  if (role !== "client") {
    return <Redirect href="/(auth)/login" />;
  }

  const handleAcceptInvitation = async (invitationId: string) => {
    const result = await acceptInvitation(invitationId);
    if (result.error) {
      setInvitationFeedback(result.error);
      return;
    }
    await reloadCoaches();
    await reloadClients();
    setInvitationFeedback("Invitation acceptee, coach ajoute.");
  };

  if (!client) {
    return (
      <AppShell
        title="Mon Programme"
        subtitle="Aucun profil client relie pour le moment"
        profileName=""
        profileAvatar=""
        activeMenu="program"
        navRole="client"
      >
        <Card>
          <Text style={{ fontSize: 16, color: "#1F2A44", fontWeight: "600" }}>
            Profil client indisponible
          </Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: "#6B7A99" }}>
            Votre session est active mais aucun profil n'est encore charge. Reconnectez-vous ou creez le profil dans Supabase.
          </Text>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Mon Programme"
      subtitle={`Bonjour ${client.name.split(" ")[0]}!`}
      profileName=""
      profileAvatar=""
      activeMenu="program"
      navRole="client"
    >
      <ScrollColumn>
        <WorkoutCard title={programTitle} exercises={programSessions} videoUrl={client.heroUrl} />
        <View style={{ flexDirection: isDesktop ? "row" : "column", gap: spacing.md }}>
          <View style={{ flex: 1.2 }}>
            <ProgressChartCard title="Ma Progression" values={globalProgress} suffix="kg" />
          </View>
          <View style={{ flex: 1, gap: spacing.md }}>
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 22, padding: 20, borderWidth: 1, borderColor: "#E8EEF5" }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#1F2A44" }}>Objectif de la semaine</Text>
              <Text style={{ marginTop: 8, fontSize: 15, color: "#6B7A99" }}>
                3 seances completes, 1 video envoyee, nutrition validee 5/7 jours.
              </Text>
            </View>
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 22, padding: 20, borderWidth: 1, borderColor: "#E8EEF5" }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#1F2A44" }}>Mes coachs</Text>
              {loadingCoaches ? (
                <Text style={{ marginTop: 8, fontSize: 14, color: "#6B7A99" }}>Chargement des coachs...</Text>
              ) : coaches.length ? (
                <View style={{ marginTop: 12, gap: 10 }}>
                  {coaches.map((coach) => (
                    <Pressable
                      key={coach.id}
                      onPress={() => setSelectedCoachId(coach.id)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderWidth: selectedCoachId === coach.id ? 1.5 : 1,
                        borderColor: selectedCoachId === coach.id ? "#2F80ED" : "#E8EEF5",
                        borderRadius: 14,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        backgroundColor: selectedCoachId === coach.id ? "#EAF3FF" : "#F9FBFF",
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                        <Avatar source={coach.avatarUrl} size={34} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontWeight: "600", color: "#1F2A44" }}>{coach.name}</Text>
                          <Text style={{ fontSize: 12, color: "#6B7A99" }}>{coach.email ?? "Email non renseigne"}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#27C281" }}>
                        {selectedCoachId === coach.id ? "Coach actif" : coach.status === "active" ? "Actif" : coach.status}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={{ marginTop: 8, fontSize: 14, color: "#6B7A99" }}>
                  Aucun coach associe pour l'instant.
                </Text>
              )}
              {coachesError ? (
                <Text style={{ marginTop: 8, fontSize: 12, color: "#D94343" }}>{coachesError}</Text>
              ) : null}
            </View>
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 22, padding: 20, borderWidth: 1, borderColor: "#E8EEF5" }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#1F2A44" }}>Invitations en attente</Text>
              {loadingInvitations ? (
                <Text style={{ marginTop: 8, fontSize: 14, color: "#6B7A99" }}>Chargement des invitations...</Text>
              ) : invitations.length ? (
                <View style={{ marginTop: 12, gap: 10 }}>
                  {invitations.map((invitation) => (
                    <View
                      key={invitation.id}
                      style={{
                        borderWidth: 1,
                        borderColor: "#E8EEF5",
                        borderRadius: 14,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        backgroundColor: "#F9FBFF",
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontSize: 15, fontWeight: "600", color: "#1F2A44" }}>{invitation.coachName}</Text>
                      <Text style={{ fontSize: 12, color: "#6B7A99" }}>{invitation.clientEmail}</Text>
                      {invitation.message ? (
                        <Text style={{ fontSize: 12, color: "#6B7A99" }}>{invitation.message}</Text>
                      ) : null}
                      <View style={{ alignItems: "flex-start", marginTop: 4 }}>
                        <Pressable
                          onPress={() => handleAcceptInvitation(invitation.id)}
                          style={{
                            height: 38,
                            borderRadius: 12,
                            backgroundColor: "#2F80ED",
                            justifyContent: "center",
                            paddingHorizontal: 14,
                          }}
                        >
                          <Text style={{ color: "#fff", fontWeight: "700" }}>Accepter</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{ marginTop: 8, fontSize: 14, color: "#6B7A99" }}>
                  Aucune invitation en attente.
                </Text>
              )}
              {invitationFeedback ? (
                <Text style={{ marginTop: 8, fontSize: 12, color: "#2F80ED" }}>{invitationFeedback}</Text>
              ) : null}
              {invitationsError ? (
                <Text style={{ marginTop: 8, fontSize: 12, color: "#D94343" }}>{invitationsError}</Text>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollColumn>
    </AppShell>
  );
}


