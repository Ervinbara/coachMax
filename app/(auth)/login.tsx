import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Text, TextInput, View } from "react-native";
import { AppButton, AppCard, Screen } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";
import { useLocaleStore } from "../../src/features/settings/useLocaleStore";
import { t } from "../../src/lib/i18n";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingRole, setPendingRole] = useState<"coach" | "client">("coach");
  const loginAs = useAuthStore((state) => state.loginAs);
  const locale = useLocaleStore((state) => state.locale);

  const canSubmit = useMemo(() => email.length > 3 && password.length > 3, [email, password]);

  const handleLogin = () => {
    loginAs(pendingRole);
    if (pendingRole === "coach") {
      router.replace("/(coach)/dashboard");
      return;
    }
    router.replace("/(client)/dashboard");
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: 16, maxWidth: 520, marginHorizontal: "auto", width: "100%" }}>
        <Text style={{ fontSize: 34, fontWeight: "900", color: "#E8E9F5" }}>CoachOS</Text>
        <Text style={{ color: "#E8E9F5", opacity: 0.7 }}>{t(locale, "login.subtitle")}</Text>

        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <View style={{ flex: 1 }}>
            <AppCard>
              <Text style={{ color: "#E8E9F5", fontWeight: "700" }}>{t(locale, "login.coachSpace")}</Text>
              <Text style={{ color: "#E8E9F5", opacity: 0.65, fontSize: 12 }}>{t(locale, "login.coachDesc")}</Text>
            </AppCard>
          </View>
          <View style={{ flex: 1 }}>
            <AppCard>
              <Text style={{ color: "#E8E9F5", fontWeight: "700" }}>{t(locale, "login.clientSpace")}</Text>
              <Text style={{ color: "#E8E9F5", opacity: 0.65, fontSize: 12 }}>{t(locale, "login.clientDesc")}</Text>
            </AppCard>
          </View>
        </View>

        <AppCard>
          <View style={{ gap: 12 }}>
            <Text style={{ color: "#E8E9F5", fontSize: 20, fontWeight: "700" }}>{t(locale, "login.title")}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@coachos.app"
              autoCapitalize="none"
              style={{
                backgroundColor: "#07091a",
                borderWidth: 1,
                borderColor: "#1D2040",
                color: "#E8E9F5",
                borderRadius: 10,
                padding: 12,
                fontSize: 15,
              }}
              placeholderTextColor="#7B80A4"
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder={t(locale, "login.password")}
              style={{
                backgroundColor: "#07091a",
                borderWidth: 1,
                borderColor: "#1D2040",
                color: "#E8E9F5",
                borderRadius: 10,
                padding: 12,
                fontSize: 15,
              }}
              placeholderTextColor="#7B80A4"
            />
            <View style={{ gap: 8 }}>
              <Text style={{ color: "#E8E9F5", opacity: 0.65, fontSize: 13 }}>{t(locale, "login.role")}</Text>
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <AppButton
                  label={t(locale, "common.coach")}
                  variant={pendingRole === "coach" ? "primary" : "ghost"}
                  onPress={() => setPendingRole("coach")}
                />
                <AppButton
                  label={t(locale, "common.client")}
                  variant={pendingRole === "client" ? "primary" : "ghost"}
                  onPress={() => setPendingRole("client")}
                />
              </View>
            </View>
            <AppButton label={t(locale, "login.submit")} onPress={handleLogin} loading={false} disabled={!canSubmit} />
            {!canSubmit ? (
              <Text style={{ color: "#E8E9F5", opacity: 0.5, fontSize: 12 }}>{t(locale, "login.hint")}</Text>
            ) : null}
          </View>
        </AppCard>
      </View>
    </Screen>
  );
}
