import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { VictoryArea, VictoryAxis, VictoryChart, VictoryTheme } from "victory-native";
import { colors, radius, shadows, spacing, typography } from "../../design/tokens";
import { useResponsive } from "../../design/responsive";
import type { CoachflowClient, CoachflowTask, CoachflowMessage } from "../../mocks/coachflow";
import { useAuthStore } from "../../features/auth/useAuthStore";

type AppShellMenu = "dashboard" | "clients" | "program" | "nutrition" | "messages" | "stats";
type NavRole = "coach" | "client";

export function AppShell({
  children,
  title,
  subtitle,
  profileName,
  profileAvatar,
  activeMenu,
  navRole,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  profileName: string;
  profileAvatar: string;
  activeMenu: AppShellMenu;
  navRole: NavRole;
}) {
  const { isDesktop, isMobile } = useResponsive();
  const signOut = useAuthStore((state) => state.signOut);
  const currentUser = useAuthStore((state) => state.user);
  const emailFallbackName =
    typeof currentUser?.email === "string" && currentUser.email.includes("@")
      ? currentUser.email.split("@")[0].replace(/[._-]+/g, " ").trim()
      : "";
  const resolvedProfileName =
    (typeof currentUser?.user_metadata?.full_name === "string" && currentUser.user_metadata.full_name.trim()) ||
    (emailFallbackName ? emailFallbackName.charAt(0).toUpperCase() + emailFallbackName.slice(1) : "") ||
    profileName;
  const resolvedProfileAvatar =
    (typeof currentUser?.user_metadata?.avatar_url === "string" && currentUser.user_metadata.avatar_url.trim()) ||
    (navRole === "coach" ? profileAvatar : "");

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.page}>
      <View style={[styles.frame, isDesktop ? styles.frameDesktop : styles.frameMobile]}>
        {isDesktop ? <Sidebar activeMenu={activeMenu} navRole={navRole} profileName={resolvedProfileName} profileAvatar={resolvedProfileAvatar} /> : null}
        <View style={styles.contentWrap}>
          <Topbar
            title={title}
            subtitle={subtitle}
            profileName={resolvedProfileName}
            profileAvatar={resolvedProfileAvatar}
            onLogout={handleLogout}
          />
          <View style={styles.content}>{children}</View>
        </View>
      </View>
      {isMobile ? <BottomTabBar active={activeMenu} navRole={navRole} /> : null}
    </View>
  );
}

export function Sidebar({
  activeMenu,
  navRole,
  profileName,
  profileAvatar,
}: {
  activeMenu: AppShellMenu;
  navRole: NavRole;
  profileName: string;
  profileAvatar: string;
}) {
  const coachMenu = [
    { id: "dashboard", label: "Tableau de bord", href: "/(coach)/dashboard" },
    { id: "clients", label: "Clients", href: "/(coach)/clients" },
    { id: "program", label: "Programmes", href: "/(coach)/program-builder" },
    { id: "nutrition", label: "Nutrition", href: "/(coach)/nutrition-builder" },
    { id: "messages", label: "Messages", href: "/(client)/chat" },
    { id: "stats", label: "Statistiques", href: "/(coach)/dashboard" },
  ] as const;
  const clientMenu = [
    { id: "program", label: "Programme", href: "/(client)/program" },
    { id: "messages", label: "Messages", href: "/(client)/chat" },
  ] as const;
  const menu = navRole === "coach" ? coachMenu : clientMenu;

  return (
    <View style={styles.sidebar}>
      <View style={styles.logoWrap}>
        <View style={styles.logoMark} />
        <Text style={styles.logoTextDark}>Coach</Text>
        <Text style={styles.logoTextBlue}>Flow</Text>
      </View>
      <View style={{ gap: 6 }}>
        {menu.map((item) => {
          const active = item.id === activeMenu;
          return (
            <Pressable
              key={item.id}
              onPress={() => router.replace(item.href as never)}
              style={[
                styles.sidebarItem,
                active ? { backgroundColor: colors.primary, borderColor: colors.primary } : null,
              ]}
            >
              <Text style={[styles.sidebarItemText, active ? { color: "#fff" } : null]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.sidebarProfile}>
        <Avatar source={profileAvatar} size={40} />
        <View>
          <Text style={styles.sidebarProfileName}>{profileName}</Text>
          <Text style={styles.sidebarProfileSub}>{navRole === "coach" ? "Coach" : "Client"}</Text>
        </View>
      </View>
    </View>
  );
}

export function Topbar({
  title,
  subtitle,
  profileName,
  profileAvatar,
  onLogout,
}: {
  title: string;
  subtitle?: string;
  profileName: string;
  profileAvatar: string;
  onLogout: () => void;
}) {
  return (
    <View style={styles.topbar}>
      <View>
        <Text style={styles.topbarTitle}>{title}</Text>
        {subtitle ? <Text style={styles.topbarSub}>{subtitle}</Text> : null}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={styles.topbarUser}>
          <Avatar source={profileAvatar} size={34} />
          <Text style={styles.topbarUserText}>{profileName}</Text>
        </View>
        <Pressable onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function BottomTabBar({ active, navRole }: { active: AppShellMenu; navRole: NavRole }) {
  const coachItems = [
    { id: "dashboard", label: "Home", href: "/(coach)/dashboard" },
    { id: "clients", label: "Clients", href: "/(coach)/clients" },
    { id: "program", label: "Programs", href: "/(coach)/program-builder" },
    { id: "messages", label: "Messages", href: "/(client)/chat" },
  ] as const;
  const clientItems = [
    { id: "program", label: "Program", href: "/(client)/program" },
    { id: "messages", label: "Messages", href: "/(client)/chat" },
  ] as const;
  const items = navRole === "coach" ? coachItems : clientItems;

  return (
    <View style={styles.bottomTabs}>
      {items.map((item) => {
        const current = item.id === active;
        return (
          <Pressable key={item.id} onPress={() => router.replace(item.href as never)} style={styles.bottomTabItem}>
            <Text style={[styles.bottomTabText, current ? { color: colors.primary, fontWeight: "700" } : null]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statHint}>{hint}</Text>
    </Card>
  );
}

export function ClientRowCard({ client, href }: { client: CoachflowClient; href: string }) {
  return (
    <Pressable onPress={() => router.push(href as never)}>
      <Card style={styles.clientRow}>
        <View style={styles.clientLeft}>
          <Avatar source={client.avatarUrl} size={46} />
          <View>
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientSub}>{client.subtitle}</Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end", gap: 3 }}>
          <Text style={styles.clientKg}>+ {client.progressKg.toFixed(1)} kg</Text>
          <Text style={styles.clientPct}>+{client.progressPct.toFixed(1)}%</Text>
        </View>
      </Card>
    </Pressable>
  );
}

export function ProgressChartCard({
  title,
  values,
  suffix,
}: {
  title: string;
  values: number[];
  suffix: string;
}) {
  return (
    <Card>
      <SectionHeader title={title} />
      <View style={{ marginBottom: spacing.sm }}>
        <Text style={styles.progressBig}>{values[values.length - 1]} {suffix}</Text>
      </View>
      <View style={{ height: 160 }}>
        <VictoryChart theme={VictoryTheme.material} padding={{ top: 6, left: 34, right: 12, bottom: 26 }}>
          <VictoryAxis
            style={{
              axis: { stroke: colors.border },
              tickLabels: { fill: colors.textMuted, fontSize: 10 },
              grid: { stroke: colors.border, strokeDasharray: "4,4" },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: "transparent" },
              tickLabels: { fill: colors.textMuted, fontSize: 10 },
              grid: { stroke: colors.border, strokeDasharray: "4,4" },
            }}
          />
          <VictoryArea
            interpolation="monotoneX"
            style={{
              data: { stroke: colors.primary, strokeWidth: 2.4, fill: colors.lightBlueBg },
            }}
            data={values.map((value, index) => ({ x: index + 1, y: value }))}
          />
        </VictoryChart>
      </View>
    </Card>
  );
}

export function TaskListCard({ tasks }: { tasks: CoachflowTask[] }) {
  return (
    <Card>
      <SectionHeader title="Taches du Jour" />
      <View style={{ gap: 10 }}>
        {tasks.map((task) => (
          <ListItem key={task.id} title={task.label} icon={task.icon} />
        ))}
      </View>
    </Card>
  );
}

export function WorkoutCard({
  title,
  exercises,
  videoUrl,
}: {
  title: string;
  exercises: { id: string; label: string; sets: string; done: boolean }[];
  videoUrl: string;
}) {
  return (
    <Card>
      <SectionHeader title="Seance du Jour" />
      <Text style={styles.workoutTitle}>{title}</Text>
      <View style={styles.workoutGrid}>
        <View style={{ gap: 8, flex: 1 }}>
          {exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseRow}>
              <Badge tone={exercise.done ? "success" : "warning"} label={exercise.done ? "OK" : "A faire"} />
              <Text style={styles.exerciseText}>{exercise.label} - {exercise.sets}</Text>
            </View>
          ))}
        </View>
        <VideoPreviewCard source={videoUrl} compact />
      </View>
    </Card>
  );
}

export function VideoPreviewCard({ source, compact }: { source: string; compact?: boolean }) {
  return (
    <View style={[styles.videoCard, compact ? { width: 220, minWidth: 220 } : null]}>
      <Image source={{ uri: source }} style={styles.videoImage} />
      <View style={styles.videoPlay}>
        <Text style={styles.videoPlayText}>?</Text>
      </View>
    </View>
  );
}

export function MessageBubble({
  message,
  avatar,
  isOwnMessage,
  ownLabel,
  peerLabel,
}: {
  message: CoachflowMessage;
  avatar?: string;
  isOwnMessage: boolean;
  ownLabel: string;
  peerLabel: string;
}) {
  const mine = isOwnMessage;
  return (
    <View style={[styles.messageRow, mine ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" }]}>
      {!mine && avatar ? <Avatar source={avatar} size={34} /> : null}
      <View style={[styles.messageBubble, mine ? styles.messageMine : styles.messageCoach]}>
        <Text style={styles.messageSender}>{mine ? ownLabel : peerLabel}</Text>
        <Text style={styles.messageText}>{message.text}</Text>
        {message.videoUrl ? <VideoPreviewCard source={message.videoUrl} /> : null}
        <Text style={styles.messageTime}>{message.time}</Text>
      </View>
      {mine && avatar ? <Avatar source={avatar} size={34} /> : null}
    </View>
  );
}

export function SearchInput({ value, onChangeText, placeholder }: { value: string; onChangeText: (v: string) => void; placeholder: string }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      style={styles.searchInput}
    />
  );
}

export function PrimaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.secondaryButton} onPress={onPress}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ tone, label }: { tone: "success" | "warning" | "primary"; label: string }) {
  const palette =
    tone === "success"
      ? { bg: colors.successLight, text: colors.success }
      : tone === "warning"
        ? { bg: colors.warningLight, text: colors.warning }
        : { bg: colors.lightBlueBg, text: colors.primary };

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.badgeText, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

export function Avatar({ source, size }: { source: string; size: number }) {
  if (!source) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.lightBlueBg,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
    );
  }
  return <Image source={{ uri: source }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
}

export function ListItem({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={styles.listItem}>
      <MetricPill value={icon.toUpperCase()} />
      <Text style={styles.listItemText}>{title}</Text>
    </View>
  );
}

export function MetricPill({ value }: { value: string }) {
  return (
    <View style={styles.metricPill}>
      <Text style={styles.metricPillText}>{value}</Text>
    </View>
  );
}

export function ScrollColumn({ children }: { children: React.ReactNode }) {
  return <ScrollView contentContainerStyle={{ gap: spacing.md }}>{children}</ScrollView>;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.pageBg,
  },
  frame: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
  frameDesktop: {
    maxWidth: 1400,
    flexDirection: "row",
    padding: spacing.xl,
    gap: spacing.lg,
  },
  frameMobile: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 82,
  },
  contentWrap: { flex: 1, gap: spacing.md },
  topbar: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  topbarTitle: { ...typography.h2, color: colors.textMain },
  topbarSub: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  topbarUser: { flexDirection: "row", alignItems: "center", gap: 10 },
  topbarUserText: { ...typography.small, color: colors.textMain },
  logoutButton: {
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  logoutButtonText: { ...typography.caption, color: colors.textSecondary, fontWeight: "700" },
  content: { flex: 1 },
  sidebar: {
    width: 240,
    backgroundColor: colors.sidebarBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    justifyContent: "space-between",
    gap: spacing.md,
  },
  logoWrap: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  logoTextDark: { ...typography.h3, color: colors.textMain },
  logoTextBlue: { ...typography.h3, color: colors.primary },
  sidebarItem: {
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  sidebarItemText: { ...typography.small, color: colors.textSecondary },
  sidebarProfile: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  sidebarProfileName: { ...typography.body, color: colors.textMain },
  sidebarProfileSub: { ...typography.caption, color: colors.textSecondary },
  bottomTabs: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 10,
    backgroundColor: colors.cardBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 6,
    flexDirection: "row",
    ...shadows.card,
  },
  bottomTabItem: { flex: 1, alignItems: "center", paddingVertical: 10 },
  bottomTabText: { ...typography.small, color: colors.textSecondary },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.cardTitle, color: colors.textMain },
  sectionAction: { ...typography.small, color: colors.primary, fontWeight: "700" },
  statCard: { minWidth: 160, flex: 1, gap: 4 },
  statLabel: { ...typography.small, color: colors.textSecondary },
  statValue: { ...typography.h2, color: colors.textMain },
  statHint: { ...typography.caption, color: colors.success, fontWeight: "600" },
  clientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: radius.md,
  },
  clientLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  clientName: { ...typography.cardTitle, color: colors.textMain },
  clientSub: { ...typography.caption, color: colors.textSecondary },
  clientKg: { ...typography.body, color: colors.success, fontWeight: "700" },
  clientPct: { ...typography.caption, color: colors.success },
  progressBig: { ...typography.h2, color: colors.textMain },
  workoutTitle: { ...typography.h2, color: colors.textMain, marginBottom: spacing.sm },
  workoutGrid: { flexDirection: "row", gap: spacing.md, flexWrap: "wrap" },
  exerciseRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  exerciseText: { ...typography.body, color: colors.textMain },
  videoCard: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#ECF2FA",
    position: "relative",
    width: "100%",
    minHeight: 170,
    justifyContent: "center",
  },
  videoImage: { width: "100%", height: 170 },
  videoPlay: {
    position: "absolute",
    alignSelf: "center",
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(31,42,68,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlayText: { color: "#fff", fontSize: 28, marginLeft: 2 },
  messageRow: { flexDirection: "row", gap: 10, marginBottom: spacing.sm, alignItems: "flex-end" },
  messageBubble: {
    maxWidth: "78%",
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 8,
  },
  messageCoach: { backgroundColor: colors.lightBlueBg, borderWidth: 1, borderColor: "#D9E8FD" },
  messageMine: { backgroundColor: colors.successLight, borderWidth: 1, borderColor: "#CFEFE0" },
  messageSender: { ...typography.caption, color: colors.textSecondary, fontWeight: "700" },
  messageText: { ...typography.body, color: colors.textMain },
  messageTime: { ...typography.caption, color: colors.textMuted, alignSelf: "flex-end" },
  searchInput: {
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBg,
    paddingHorizontal: 14,
    color: colors.textMain,
    ...typography.body,
  },
  primaryButton: {
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryButtonText: { color: "#fff", ...typography.body, fontWeight: "700" },
  secondaryButton: {
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.warningLight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  secondaryButtonText: { color: colors.warning, ...typography.body, fontWeight: "700" },
  badge: {
    minWidth: 62,
    height: 28,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  badgeText: { ...typography.caption, fontWeight: "700" },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radius.md,
    backgroundColor: "#F9FBFF",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  listItemText: { ...typography.body, color: colors.textMain },
  metricPill: {
    minWidth: 34,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.lightBlueBg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  metricPillText: { ...typography.caption, color: colors.primary, fontWeight: "700" },
});
