import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Input, Text, XStack, YStack } from "tamagui";
import { AppButton, AppCard, Screen } from "../../src/components";
import { useAuthStore } from "../../src/features/auth/useAuthStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingRole, setPendingRole] = useState<"coach" | "client">("coach");
  const loginAs = useAuthStore((state) => state.loginAs);

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
          SaaS universal pour coachs sportifs et clients.
        </Text>

        <AppCard>
          <YStack gap="$3">
            <Text color="$color" fontSize={20} fontWeight="700">
              Connexion
            </Text>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="email@coachos.app"
              autoCapitalize="none"
              bg="rgba(255,255,255,0.03)"
              borderColor="$borderColor"
            />
            <Input
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="mot de passe"
              bg="rgba(255,255,255,0.03)"
              borderColor="$borderColor"
            />
            <YStack gap="$2">
              <Text color="$color" opacity={0.65} fontSize={13}>
                Role
              </Text>
              <XStack gap="$2" $sm={{ fd: "column" }}>
                <AppButton
                  label="Coach"
                  variant={pendingRole === "coach" ? "primary" : "ghost"}
                  onPress={() => setPendingRole("coach")}
                />
                <AppButton
                  label="Client"
                  variant={pendingRole === "client" ? "primary" : "ghost"}
                  onPress={() => setPendingRole("client")}
                />
              </XStack>
            </YStack>
            <AppButton label="Se connecter" onPress={handleLogin} loading={false} disabled={!canSubmit} />
            {!canSubmit ? (
              <Text color="$color" opacity={0.5} fontSize={12}>
                Demo MVP: renseigne un email et un mot de passe pour continuer.
              </Text>
            ) : null}
          </YStack>
        </AppCard>
      </YStack>
    </Screen>
  );
}
