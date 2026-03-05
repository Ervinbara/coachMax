import { router } from "expo-router";
import { Text, View } from "react-native";
import { AppButton, AppCard, Screen, StatusPill } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useLocaleStore } from "../../src/features/settings/useLocaleStore";
import { t } from "../../src/lib/i18n";
import { AppTopBar } from "../../src/layout/AppTopBar";
import { RoleNav } from "../../src/layout/RoleNav";
import { dataService } from "../../src/services/dataService";

export default function ClientsScreen() {
  const role = useAuthStore((state) => state.role);
  const locale = useLocaleStore((state) => state.locale);
  const setSelectedClientId = useAuthStore((state) => state.setSelectedClientId);
  const clients = dataService.getClients();

  if (role !== "coach") {
    router.replace("/(auth)/login");
    return null;
  }

  return (
    <Screen>
      <AppTopBar title={t(locale, "nav.clients")} subtitle={t(locale, "clients.subtitle")} showBack backHref="/(coach)/dashboard" />
      <RoleNav role="coach" />
      <View style={{ gap: 12 }}>
        {clients.map((client) => (
          <AppCard key={client.id}>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={{ color: "#E8E9F5", fontWeight: "700", fontSize: 17 }}>{client.fullName}</Text>
                  <Text style={{ color: "#E8E9F5", opacity: 0.7, fontSize: 12 }}>
                    {client.sport} • {locale === "fr" ? "prochain check-in" : "next check-in"} {client.nextCheckIn}
                  </Text>
                </View>
                <StatusPill
                  label={client.status}
                  tone={client.status === "critical" ? "danger" : client.status === "attention" ? "warning" : "success"}
                />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: "#E8E9F5", opacity: 0.75, fontSize: 13 }}>
                  {t(locale, "clients.goal")}: {client.goal}
                </Text>
                <Text style={{ color: "#6266F1", fontWeight: "700" }}>{client.adherence}%</Text>
              </View>
              <Text style={{ color: "#E8E9F5", opacity: 0.6, fontSize: 12 }}>
                {locale === "fr"
                  ? `Poids ${client.currentWeightKg}kg vers cible ${client.targetWeightKg}kg | serie ${client.streakDays} jours`
                  : `Weight ${client.currentWeightKg}kg toward ${client.targetWeightKg}kg target | streak ${client.streakDays} days`}
              </Text>
              <AppButton
                label={t(locale, "clients.openProfile")}
                onPress={() => {
                  setSelectedClientId(client.id);
                  router.push({ pathname: "/(coach)/client-detail", params: { clientId: client.id } });
                }}
              />
            </View>
          </AppCard>
        ))}
      </View>
    </Screen>
  );
}
