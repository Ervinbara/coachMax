import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Input, Text, XStack, YStack } from "tamagui";
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
      <YStack f={1} jc="center" gap="$4" maw={520} mx="auto" width="100%">
        <Text fontSize={34} fontWeight="900" color="$color">
          CoachOS
        </Text>
        <Text color="$color" opacity={0.7}>
          {t(locale, "login.subtitle")}
        </Text>

        <XStack gap="$2" $sm={{ fd: "column" }}>
          <AppCard>
            <Text color="$color" fontWeight="700">{t(locale, "login.coachSpace")}</Text>
            <Text color="$color" opacity={0.65} fontSize={12}>
              {t(locale, "login.coachDesc")}
            </Text>
          </AppCard>
          <AppCard>
            <Text color="$color" fontWeight="700">{t(locale, "login.clientSpace")}</Text>
            <Text color="$color" opacity={0.65} fontSize={12}>
              {t(locale, "login.clientDesc")}
            </Text>
          </AppCard>
        </XStack>

        <AppCard>
          <YStack gap="$3">
            <Text color="$color" fontSize={20} fontWeight="700">
              {t(locale, "login.title")}
            </Text>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="email@coachos.app"
              autoCapitalize="none"
              bg="#07091a"
              borderColor="#1D2040"
              color="#E8E9F5"
              placeholderTextColor="#7B80A4"
            />
            <Input
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder={t(locale, "login.password")}
              bg="#07091a"
              borderColor="#1D2040"
              color="#E8E9F5"
              placeholderTextColor="#7B80A4"
            />
            <YStack gap="$2">
              <Text color="$color" opacity={0.65} fontSize={13}>
                {t(locale, "login.role")}
              </Text>
              <XStack gap="$2" $sm={{ fd: "column" }}>
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
              </XStack>
            </YStack>
            <AppButton label={t(locale, "login.submit")} onPress={handleLogin} loading={false} disabled={!canSubmit} />
            {!canSubmit ? (
              <Text color="$color" opacity={0.5} fontSize={12}>
                {t(locale, "login.hint")}
              </Text>
            ) : null}
          </YStack>
        </AppCard>
      </YStack>
    </Screen>
  );
}
