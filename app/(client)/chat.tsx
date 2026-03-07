import { useEffect, useMemo, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import {
  AppShell,
  Card,
  MessageBubble,
  PrimaryButton,
  ScrollColumn,
  SearchInput,
  SectionHeader,
} from "../../src/components/coachflow";
import { useResponsive } from "../../src/design/responsive";
import { colors, radius, spacing, typography } from "../../src/design/tokens";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useCoachflowChat } from "../../src/hooks/useCoachflowChat";
import { useClientCoaches } from "../../src/hooks/useClientCoaches";
import { useCoachflowConversations } from "../../src/hooks/useCoachflowConversations";

export default function ClientChatScreen() {
  const { isDesktop } = useResponsive();
  const initialized = useAuthStore((state) => state.initialized);
  const role = useAuthStore((state) => state.role);
  const selectedCoachId = useAuthStore((state) => state.selectedCoachId);
  const setSelectedCoachId = useAuthStore((state) => state.setSelectedCoachId);
  useClientCoaches();
  const {
    conversations,
    loading: convLoading,
    error: convError,
    reload: reloadConversations,
  } = useCoachflowConversations(30000);
  const [activeConversation, setActiveConversation] = useState<string>("");
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!conversations.length) {
      if (activeConversation) setActiveConversation("");
      return;
    }

    if (role === "client") {
      const hasSelectedCoach = Boolean(selectedCoachId && conversations.some((c) => c.peerId === selectedCoachId));
      const targetConversation = hasSelectedCoach ? (selectedCoachId as string) : conversations[0].peerId;

      if (activeConversation !== targetConversation) {
        setActiveConversation(targetConversation);
      }
      return;
    }

    if (!activeConversation || !conversations.some((c) => c.peerId === activeConversation)) {
      setActiveConversation(conversations[0].peerId);
    }
  }, [activeConversation, conversations, role, selectedCoachId, setSelectedCoachId]);

  const active = useMemo(
    () => conversations.find((conversation) => conversation.peerId === activeConversation) ?? conversations[0],
    [conversations, activeConversation],
  );

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return conversations;
    return conversations.filter((conversation) => conversation.peerName.toLowerCase().includes(normalized));
  }, [search, conversations]);

  const { messages, loading: messagesLoading, error, send, reload, markAsRead, simulateIncoming } = useCoachflowChat(
    active?.peerId ?? "",
    {
      pollMs: 25000,
    },
  );

  useEffect(() => {
    if (!active?.peerId) return;
    markAsRead();
  }, [active?.peerId, markAsRead]);

  if (!initialized || convLoading || messagesLoading) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
  }

  if (!role) {
    return <Redirect href="/(auth)/login" />;
  }

  const handleSend = async () => {
    const result = await send(draft);
    if (!result.error) {
      setDraft("");
      await reloadConversations();
    }
  };

  const handleRefresh = async () => {
    await reload();
    await reloadConversations();
  };

  const handleMarkRead = async () => {
    await markAsRead();
    await reloadConversations();
  };

  const handleSimulateIncoming = async () => {
    const result = await simulateIncoming();
    if (!result.error) {
      await reloadConversations();
    }
  };

  return (
    <AppShell
      title="Messagerie"
      subtitle={active ? `Chat avec ${active.peerName}` : "Aucune conversation"}
      profileName=""
      profileAvatar=""
      activeMenu="messages"
      navRole={role === "coach" ? "coach" : "client"}
    >
      <View style={{ flex: 1, flexDirection: isDesktop ? "row" : "column", gap: spacing.md }}>
        <View style={{ width: isDesktop ? 320 : undefined }}>
          <Card style={{ flex: 1 }}>
            <SectionHeader title="Conversations" action="Polling 30s" />
            <SearchInput value={search} onChangeText={setSearch} placeholder="Rechercher" />
            {convError ? <Text style={{ ...typography.small, color: "#D94343", marginTop: 8 }}>{convError}</Text> : null}
            <View style={{ gap: 8, marginTop: spacing.md }}>
              {filtered.map((conversation) => (
                <View
                  key={conversation.peerId}
                  style={{
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: activeConversation === conversation.peerId ? "#BFD9FF" : colors.border,
                    backgroundColor: activeConversation === conversation.peerId ? "#EAF3FF" : "#F9FBFF",
                    padding: spacing.sm,
                    gap: 6,
                  }}
                >
                  <PrimaryButton
                    label={conversation.peerName}
                    onPress={() => {
                      if (role === "client") {
                        setSelectedCoachId(conversation.peerId);
                      }
                      setActiveConversation(conversation.peerId);
                    }}
                  />
                  <Text style={{ ...typography.caption, color: colors.textSecondary }} numberOfLines={1}>
                    {conversation.lastMessage}
                  </Text>
                  {conversation.unreadCount > 0 ? (
                    <Text style={{ ...typography.caption, color: colors.primary, fontWeight: "700" }}>
                      {conversation.unreadCount} non lus
                    </Text>
                  ) : null}
                </View>
              ))}
              {!filtered.length ? (
                <Text style={{ ...typography.small, color: colors.textSecondary }}>
                  Aucune conversation. Reliez d'abord des clients a votre compte coach.
                </Text>
              ) : null}
            </View>
          </Card>
        </View>

        <Card style={{ flex: 1, paddingBottom: spacing.sm }}>
          <SectionHeader title={active ? `Chat avec ${active.peerName}` : "Conversation"} />
          {role === "client" && active ? (
            <Text style={{ ...typography.caption, color: colors.primary, marginBottom: spacing.sm }}>
              Coach actif: {active.peerName}
            </Text>
          ) : null}
          <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm, flexWrap: "wrap" }}>
            <PrimaryButton label="Actualiser" onPress={handleRefresh} />
            <PrimaryButton label="Marquer comme lu" onPress={handleMarkRead} />
            <PrimaryButton label="Simuler entrant" onPress={handleSimulateIncoming} />
          </View>

          {error ? (
            <Text style={{ ...typography.small, color: "#D94343", marginBottom: spacing.sm }}>{error}</Text>
          ) : null}

          {!active ? (
            <Text style={{ ...typography.body, color: colors.textSecondary }}>
              Aucun fil de discussion disponible.
            </Text>
          ) : (
            <>
              <ScrollColumn>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    avatar={active.peerAvatarUrl}
                    isOwnMessage={message.sender === role}
                    ownLabel="Moi"
                    peerLabel={active.peerName}
                  />
                ))}
                {!messages.length ? (
                  <Text style={{ ...typography.small, color: colors.textSecondary }}>
                    Aucun message pour le moment.
                  </Text>
                ) : null}
              </ScrollColumn>
              <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Ecrire un message..."
                  placeholderTextColor={colors.textMuted}
                  editable={Boolean(active)}
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: "#fff",
                    paddingHorizontal: 14,
                    color: colors.textMain,
                    ...typography.body,
                  }}
                />
                <PrimaryButton label="Send" onPress={handleSend} />
              </View>
            </>
          )}
        </Card>
      </View>
    </AppShell>
  );
}


