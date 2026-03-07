import "../global.css";
import "react-native-reanimated";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { colors } from "../src/design/tokens";
import { useAuthStore } from "../src/features/auth/useAuthStore";

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.pageBg },
        animation: "fade",
      }}
    />
  );
}
