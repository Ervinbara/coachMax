import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
  children: ReactNode;
  padded?: boolean;
};

export const Screen = ({ children, padded = true }: ScreenProps) => {
  return (
    <SafeAreaView className="flex-1 bg-dark-bg">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className={`flex-row justify-center bg-dark-bg ${padded ? "px-4" : "px-0"}`}>
          <View className="flex-1 max-w-[1120px] w-full py-4 gap-3">
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: -60,
                right: -80,
                width: 220,
                height: 220,
                borderRadius: 999,
                backgroundColor: "rgba(98, 102, 241, 0.08)",
              }}
            />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                bottom: -90,
                left: -100,
                width: 260,
                height: 260,
                borderRadius: 999,
                backgroundColor: "rgba(249, 115, 22, 0.06)",
              }}
            />
            {children}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
