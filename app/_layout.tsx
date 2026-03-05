import "../global.css";
import "react-native-reanimated";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0A0C1F" },
        animation: "fade",
      }}
    />
  );
}
