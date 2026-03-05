import { ReactNode } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

type ScreenProps = {
  children: ReactNode;
  padded?: boolean;
};

export const Screen = ({ children, padded = true }: ScreenProps) => {
  const horizontalPadding = padded ? "$4" : "$0";
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#090d19" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <YStack f={1} bg="$background" px={horizontalPadding} py="$4" gap="$3">
          <XStack
            pointerEvents="none"
            position="absolute"
            top={-60}
            right={-80}
            width={220}
            height={220}
            br={999}
            bg="rgba(66, 211, 146, 0.18)"
          />
          {children}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
};
