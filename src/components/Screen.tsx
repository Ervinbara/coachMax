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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0C1F" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <XStack jc="center" bg="$background" px={horizontalPadding}>
          <YStack f={1} maw={1120} width="100%" py="$4" gap="$3">
            <XStack
              pointerEvents="none"
              position="absolute"
              top={-60}
              right={-80}
              width={220}
              height={220}
              br={999}
              bg="rgba(98, 102, 241, 0.08)"
            />
            <XStack
              pointerEvents="none"
              position="absolute"
              bottom={-90}
              left={-100}
              width={260}
              height={260}
              br={999}
              bg="rgba(249, 115, 22, 0.06)"
            />
            {children}
          </YStack>
        </XStack>
      </ScrollView>
    </SafeAreaView>
  );
};
