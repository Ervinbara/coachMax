import { useMemo, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, Platform, Share, Text, TextInput, View } from "react-native";
import {
  AppShell,
  Card,
  ClientRowCard,
  PrimaryButton,
  ScrollColumn,
  SearchInput,
  SectionHeader,
} from "../../src/components/coachflow";
import { colors, spacing, typography } from "../../src/design/tokens";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useCoachflowClients } from "../../src/hooks/useCoachflowClients";
import { useCoachInvitations } from "../../src/hooks/useCoachInvitations";
import { coachProfile } from "../../src/mocks/coachflow";

export default function CoachClientsScreen() {
  const [query, setQuery] = useState("");
  const initialized = useAuthStore((state) => state.initialized);
  const role = useAuthStore((state) => state.role);
  const { clients, loading, error } = useCoachflowClients();
  const {
    invitations,
    loading: invitationsLoading,
    error: invitationError,
    invite,
  } = useCoachInvitations();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteFeedback, setInviteFeedback] = useState<string | null>(null);
  const [manualInviteLink, setManualInviteLink] = useState<string>("");
  const [manualInviteText, setManualInviteText] = useState<string>("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return clients;
    }
    return clients.filter((client) => client.name.toLowerCase().includes(normalized));
  }, [query, clients]);

  if (!initialized || loading) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
  }

  if (role !== "coach") {
    return <Redirect href="/(auth)/login" />;
  }

  const handleInvite = async () => {
    const result = await invite(inviteEmail, inviteMessage);
    if (result.error) {
      setInviteFeedback(
        result.emailStatus === "error"
          ? `Invitation creee, envoi email en echec: ${result.error}`
          : result.error,
      );
    } else if (result.emailStatus === "queued" || result.emailStatus === "sent") {
      setInviteFeedback("Invitation creee et email prepare pour envoi automatique.");
    } else {
      setInviteFeedback("Invitation creee. Envoi manuel possible ci-dessous.");
    }
    setManualInviteLink(result.invitationLink ?? "");
    setManualInviteText(result.invitationText ?? "");
    setInviteEmail("");
    setInviteMessage("");
  };

  const handleCopyManualText = async () => {
    if (!manualInviteText) return;

    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(manualInviteText);
      setInviteFeedback("Invitation copiee dans le presse-papiers.");
      return;
    }

    setInviteFeedback("Copie non disponible ici. Utilisez Partager.");
  };

  const handleShareManualText = async () => {
    if (!manualInviteText) return;
    await Share.share({
      message: manualInviteText,
      title: "Invitation CoachFlow",
    });
  };

  return (
    <AppShell
      title="Clients"
      subtitle="Gestion centralisee de votre portefeuille"
      profileName={coachProfile.name}
      profileAvatar={coachProfile.avatarUrl}
      activeMenu="clients"
      navRole="coach"
    >
      <ScrollColumn>
        <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <SearchInput value={query} onChangeText={setQuery} placeholder="Rechercher" />
          </View>
          <PrimaryButton label="+ Ajouter" />
        </View>

        <Card>
          <SectionHeader title="Inviter un client" />
          <View style={{ gap: spacing.sm }}>
            <TextInput
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="email.client@gmail.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                height: 46,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: "#fff",
                paddingHorizontal: 14,
                color: colors.textMain,
                ...typography.body,
              }}
            />
            <TextInput
              value={inviteMessage}
              onChangeText={setInviteMessage}
              placeholder="Message optionnel"
              placeholderTextColor={colors.textMuted}
              style={{
                minHeight: 78,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: "#fff",
                paddingHorizontal: 14,
                paddingVertical: 10,
                color: colors.textMain,
                ...typography.body,
              }}
              multiline
            />
            <View style={{ alignItems: "flex-start" }}>
              <PrimaryButton label="Envoyer invitation" onPress={handleInvite} />
            </View>
            {inviteFeedback ? <Text style={{ ...typography.small, color: colors.primary }}>{inviteFeedback}</Text> : null}
            {invitationError ? <Text style={{ ...typography.small, color: "#D94343" }}>{invitationError}</Text> : null}

            {manualInviteText ? (
              <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                <Text style={{ ...typography.small, color: colors.textSecondary }}>
                  Fallback manuel: copiez ou partagez l'invitation si l'email ne part pas.
                </Text>
                <Text
                  selectable
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 10,
                    backgroundColor: "#F9FBFF",
                    color: colors.textMain,
                    ...typography.caption,
                  }}
                >
                  {manualInviteLink}
                </Text>
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  <PrimaryButton label="Copier invitation" onPress={handleCopyManualText} />
                  <PrimaryButton label="Partager" onPress={handleShareManualText} />
                </View>
              </View>
            ) : null}
          </View>
        </Card>

        <Card>
          <SectionHeader title="Invitations envoyees" action={invitationsLoading ? "Chargement..." : `${invitations.length} enregistrees`} />
          <View style={{ gap: spacing.sm }}>
            {invitations.map((invitation) => (
              <View
                key={invitation.id}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 14,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: "#F9FBFF",
                  gap: 4,
                }}
              >
                <Text style={{ ...typography.body, color: colors.textMain, fontWeight: "600" }}>{invitation.clientEmail}</Text>
                <Text style={{ ...typography.caption, color: colors.textSecondary }}>
                  Statut: {invitation.status} - {new Date(invitation.createdAt).toLocaleString("fr-FR")}
                </Text>
                {invitation.message ? (
                  <Text style={{ ...typography.caption, color: colors.textSecondary }}>{invitation.message}</Text>
                ) : null}
              </View>
            ))}
            {!invitations.length ? (
              <Text style={{ ...typography.small, color: colors.textSecondary }}>
                Aucune invitation envoyee.
              </Text>
            ) : null}
          </View>
        </Card>

        <Card>
          <SectionHeader title="Liste Clients" action={`${filtered.length} profils`} />
          {error ? <Text style={{ ...typography.small, color: "#D94343" }}>{error}</Text> : null}
          <View style={{ gap: spacing.sm }}>
            {filtered.map((client) => (
              <ClientRowCard key={client.id} client={client} href={`/(coach)/client-detail?clientId=${client.id}`} />
            ))}
            {!filtered.length ? (
              <Text style={{ ...typography.small, color: colors.textSecondary }}>
                Aucun client a afficher.
              </Text>
            ) : null}
          </View>
        </Card>
      </ScrollColumn>
    </AppShell>
  );
}


