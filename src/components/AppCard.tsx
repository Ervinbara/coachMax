import { ReactNode } from "react";
import { View } from "react-native";

type AppCardProps = {
  children: ReactNode;
};

export const AppCard = ({ children }: AppCardProps) => (
  <View
    className="bg-dark-card border border-dark-border rounded-2xl p-4 gap-3"
    style={{
      shadowColor: "rgba(0,0,0,0.4)",
      shadowOpacity: 1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    }}
  >
    {children}
  </View>
);
