import { Link, router } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, useWindowDimensions, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useLocaleStore } from "../../src/features/settings/useLocaleStore";
import { dataService } from "../../src/services/dataService";

const NAV_ITEMS = [
  { icon: "[]", labelFr: "Dashboard", labelEn: "Dashboard", href: "/(coach)/dashboard" },
  { icon: "CL", labelFr: "Clients", labelEn: "Clients", href: "/(coach)/clients" },
  { icon: "PR", labelFr: "Programmes", labelEn: "Programs", href: "/(coach)/program-builder" },
  { icon: "NU", labelFr: "Nutrition", labelEn: "Nutrition", href: "/(coach)/nutrition-builder" },
];

export default function CoachDashboardScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const role = useAuthStore((state) => state.role);
  const locale = useLocaleStore((state) => state.locale);
  const clients = dataService.getClients();
  const activity = dataService.getLatestActivity();
  const tasks = dataService.getCoachTasks();

  if (role !== "coach") {
    router.replace("/(auth)/login");
    return null;
  }

  const clientCards = clients
    .slice()
    .sort((a, b) => b.adherence - a.adherence)
    .slice(0, 3)
    .map((client, index) => ({
      ...client,
      slot: index === 0 ? "Mon 09:00" : index === 1 ? "Tue 18:00" : "Wed 07:30",
    }));

  const titleSize = isDesktop ? 50 : 34;
  const subtitleSize = isDesktop ? 26 : 18;
  const cardValueSize = isDesktop ? 56 : 40;
  const cardLabelSize = isDesktop ? 24 : 16;
  const cardSubSize = isDesktop ? 22 : 14;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#050612" }}>
      <XStack flex={1}>
        {isDesktop ? (
          <YStack width={252} borderRightWidth={1} borderRightColor="#171a2b" bg="#07091a" px="$3" py="$4" gap="$3">
            <XStack ai="center" gap="$2" px="$2" py="$2">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "#5B5CE9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text color="#fff" fontWeight="700">
                  CF
                </Text>
              </View>
              <Text color="#FFFFFF" fontSize={33} fontWeight="800" letterSpacing={-0.4}>
                CoachFlow
              </Text>
            </XStack>

            <YStack gap="$2" mt="$3">
              {NAV_ITEMS.map((item, index) => {
                const active = index === 0;
                return (
                  <Link key={item.href} href={item.href as never} asChild>
                    <Pressable>
                      <XStack ai="center" gap="$2" px="$3" py="$3" br="$5" bg={active ? "#6266F1" : "transparent"}>
                        <Text color={active ? "#fff" : "#6F7393"}>{item.icon}</Text>
                        <Text color={active ? "#fff" : "#6F7393"} fontWeight={active ? "700" : "500"} fontSize={25}>
                          {locale === "fr" ? item.labelFr : item.labelEn}
                        </Text>
                      </XStack>
                    </Pressable>
                  </Link>
                );
              })}
            </YStack>

            <YStack mt="auto" pt="$3" borderTopWidth={1} borderTopColor="#171a2b">
              <Text color="#53587A" fontSize={22}>
                v1.0 MVP
              </Text>
            </YStack>
          </YStack>
        ) : null}

        <YStack flex={1}>
          <XStack ai="center" jc="space-between" px="$5" py="$3" borderBottomWidth={1} borderBottomColor="#171a2b" bg="#0A0C1F">
            <YStack>
              <Text color="#FFFFFF" fontSize={titleSize} fontWeight="800">
                {locale === "fr" ? "Bonjour, Thomas" : "Hello, Thomas"}
              </Text>
              <Text color="#7B80A4" fontSize={subtitleSize}>
                {locale === "fr" ? "Lundi 3 mars 2026" : "Monday, March 3, 2026"}
              </Text>
            </YStack>
            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: "#6266F1",
              }}
            >
              <Text color="#fff" fontWeight="700" fontSize={isDesktop ? 22 : 16}>
                {locale === "fr" ? "+ Nouveau client" : "+ New client"}
              </Text>
            </View>
          </XStack>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, gap: 20 }}>
            <XStack gap="$3" $sm={{ fd: "column" }}>
              {[
                {
                  icon: "CL",
                  value: String(clients.length),
                  label: locale === "fr" ? "Clients actifs" : "Active clients",
                  sub: locale === "fr" ? `+${Math.max(1, clients.length - 3)} ce mois` : `+${Math.max(1, clients.length - 3)} this month`,
                },
                {
                  icon: "PR",
                  value: String(clients.reduce((s, c) => s + c.sessionsCompleted, 0)),
                  label: locale === "fr" ? "Seances / sem." : "Sessions / week",
                  sub: locale === "fr" ? "Objectif: 30" : "Goal: 30",
                },
                {
                  icon: "OK",
                  value: `${Math.round(clients.reduce((s, c) => s + c.adherence, 0) / clients.length)}%`,
                  label: locale === "fr" ? "Taux de reussite" : "Completion rate",
                  sub: locale === "fr" ? "Objectifs atteints" : "Goals reached",
                },
                {
                  icon: "MS",
                  value: String(activity.filter((a) => a.type === "message").length),
                  label: locale === "fr" ? "Messages" : "Messages",
                  sub: locale === "fr" ? `${tasks.filter((t) => !t.done).length} urgents` : `${tasks.filter((t) => !t.done).length} urgent`,
                },
              ].map((stat) => (
                <YStack key={stat.label} f={1} minHeight={170} br="$6" borderWidth={1} borderColor="#1D2040" bg="#0A0D24" p="$4" jc="space-between">
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      backgroundColor: "#14183A",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text color="#fff">{stat.icon}</Text>
                  </View>
                  <YStack gap="$1">
                    <Text color="#fff" fontSize={cardValueSize} fontWeight="800">
                      {stat.value}
                    </Text>
                    <Text color="#7E83A8" fontSize={cardLabelSize}>
                      {stat.label}
                    </Text>
                    <Text color="#5D6285" fontSize={cardSubSize}>
                      {stat.sub}
                    </Text>
                  </YStack>
                </YStack>
              ))}
            </XStack>

            <YStack gap="$3" mt="$2">
              <XStack jc="space-between" ai="center">
                <Text color="#fff" fontSize={isDesktop ? 42 : 28} fontWeight="800">
                  {locale === "fr" ? "Mes clients" : "My clients"}
                </Text>
                <View
                  style={{
                    backgroundColor: "#10142E",
                    borderWidth: 1,
                    borderColor: "#1D2040",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                  }}
                >
                  <Text color="#626889" fontSize={isDesktop ? 22 : 14}>
                    {locale === "fr" ? "Search..." : "Search..."}
                  </Text>
                </View>
              </XStack>

              {clientCards.map((client, idx) => (
                <Link key={client.id} href={{ pathname: "/(coach)/client-detail", params: { clientId: client.id } }} asChild>
                  <Pressable>
                    <YStack bg="#0A0D24" borderWidth={1} borderColor="#1D2040" br="$6" p="$4" gap="$3">
                      <XStack jc="space-between" ai="center">
                        <XStack ai="center" gap="$3">
                          <View
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: 26,
                              borderWidth: 1,
                              borderColor: "#303665",
                              backgroundColor: "#121742",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text color="#8A8FFF" fontWeight="700">
                              {client.avatar}
                            </Text>
                          </View>
                          <YStack>
                            <XStack ai="center" gap="$2">
                              <Text color="#fff" fontWeight="700" fontSize={isDesktop ? 31 : 20}>
                                {client.fullName}
                              </Text>
                              <View
                                style={{
                                  paddingHorizontal: 10,
                                  paddingVertical: 4,
                                  borderRadius: 999,
                                  backgroundColor: idx === 0 ? "#3C2D11" : idx === 1 ? "#2D2236" : "#0F2C28",
                                }}
                              >
                                <Text color={idx === 0 ? "#F2B94B" : idx === 1 ? "#C4A2FF" : "#22C55E"} fontSize={isDesktop ? 18 : 12} fontWeight="700">
                                  {idx === 0 ? (locale === "fr" ? "Priorite" : "Priority") : idx === 1 ? (locale === "fr" ? "Attention" : "Warning") : "Top"}
                                </Text>
                              </View>
                            </XStack>
                            <Text color="#69709B" fontSize={isDesktop ? 25 : 15}>
                              {client.goal} • {client.currentWeightKg} kg
                            </Text>
                          </YStack>
                        </XStack>

                        <YStack ai="flex-end">
                          <Text color="#6F7393" fontSize={isDesktop ? 22 : 13}>
                            {client.slot}
                          </Text>
                          <Text color="#fff" fontSize={isDesktop ? 42 : 26} fontWeight="800">
                            {client.adherence}%
                          </Text>
                        </YStack>
                      </XStack>

                      <View style={{ height: 6, borderRadius: 3, backgroundColor: "#191D3A", overflow: "hidden" }}>
                        <View
                          style={{
                            width: `${client.adherence}%`,
                            height: "100%",
                            borderRadius: 3,
                            backgroundColor: "#7B61FF",
                          }}
                        />
                      </View>
                    </YStack>
                  </Pressable>
                </Link>
              ))}
            </YStack>
          </ScrollView>
        </YStack>
      </XStack>
    </SafeAreaView>
  );
}
