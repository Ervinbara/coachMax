import { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { PrimaryButton, SecondaryButton } from "../../src/components/coachflow";
import { colors, radius, spacing, typography } from "../../src/design/tokens";
import { useAuthStore, type UserRole } from "../../src/features/auth/useAuthStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("thomas@coachflow.fr");
  const [password, setPassword] = useState("password123");
  const [fullName, setFullName] = useState("Thomas Durand");
  const [pendingRole, setPendingRole] = useState<UserRole>("coach");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const initialized = useAuthStore((state) => state.initialized);
  const loading = useAuthStore((state) => state.loading);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const error = useAuthStore((state) => state.error);
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const setRole = useAuthStore((state) => state.setRole);

  useEffect(() => {
    if (!initialized) return;
    if (role === "coach") {
      router.replace("/(coach)/dashboard");
      return;
    }
    if (role === "client") {
      router.replace("/(client)/program");
    }
  }, [initialized, role]);

  const buttonLabel = useMemo(() => {
    if (loading) return "Chargement...";
    return mode === "signin" ? "Se connecter" : "Creer un compte";
  }, [loading, mode]);

  const handleSubmit = async () => {
    if (mode === "signin") {
      await signIn(email.trim(), password);
      return;
    }

    await signUp({
      email: email.trim(),
      password,
      role: pendingRole,
      fullName: fullName.trim(),
    });
  };

  const handleSetRole = async (nextRole: UserRole) => {
    await setRole(nextRole);
  };

  if (!initialized) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const isAuthenticatedWithoutRole = Boolean(user) && !role;

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <View>
          <Text style={styles.brand}>Coach<Text style={{ color: colors.primary }}>Flow</Text></Text>
          <Text style={styles.subtitle}>Connexion a votre espace coaching</Text>
        </View>

        {isAuthenticatedWithoutRole ? (
          <View style={{ gap: spacing.sm }}>
            <Text style={styles.helper}>Votre compte existe, choisissez votre role pour activer votre espace.</Text>
            <PrimaryButton label="Activer Espace Coach" onPress={() => handleSetRole("coach")} />
            <SecondaryButton label="Activer Espace Client" onPress={() => handleSetRole("client")} />
          </View>
        ) : (
          <>
            {mode === "signup" ? (
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nom complet"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            ) : null}

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Mot de passe"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
            />

            {mode === "signup" ? (
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <PrimaryButton label={pendingRole === "coach" ? "Coach (OK)" : "Coach"} onPress={() => setPendingRole("coach")} />
                </View>
                <View style={{ flex: 1 }}>
                  <SecondaryButton label={pendingRole === "client" ? "Client (OK)" : "Client"} onPress={() => setPendingRole("client")} />
                </View>
              </View>
            ) : null}

            <PrimaryButton label={buttonLabel} onPress={handleSubmit} />
            <SecondaryButton
              label={mode === "signin" ? "Creer un compte" : "J'ai deja un compte"}
              onPress={() => setMode((current) => (current === "signin" ? "signup" : "signin"))}
            />
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = {
  centered: {
    flex: 1,
    backgroundColor: colors.pageBg,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  page: {
    flex: 1,
    backgroundColor: colors.pageBg,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: spacing.lg,
  },
  card: {
    width: "100%" as const,
    maxWidth: 460,
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  brand: {
    ...typography.h1,
    color: colors.textMain,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 6,
  },
  helper: {
    ...typography.body,
    color: colors.textSecondary,
  },
  input: {
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    color: colors.textMain,
    ...typography.body,
  },
  error: {
    ...typography.small,
    color: "#D94343",
  },
};
