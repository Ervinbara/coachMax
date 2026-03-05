import "react-native-reanimated";
import { Stack } from "expo-router";
import { TamaguiProvider, Theme } from "tamagui";
import tamaguiConfig from "../tamagui.config";

export default function RootLayout() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <Theme name="dark">
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0A0C1F" },
            animation: "fade",
          }}
        />
      </Theme>
    </TamaguiProvider>
  );
}
