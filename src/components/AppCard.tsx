import { ReactNode } from "react";
import { Card, YStack } from "tamagui";

type AppCardProps = {
  children: ReactNode;
};

export const AppCard = ({ children }: AppCardProps) => (
  <Card
    borderColor="#1D2040"
    borderWidth={1}
    bg="#0A0D24"
    br="$6"
    p="$4"
    animation="quick"
    shadowColor="rgba(0,0,0,0.4)"
    shadowOpacity={1}
    shadowRadius={10}
    shadowOffset={{ width: 0, height: 4 }}
    hoverStyle={{ bg: "#0F1230", y: -2, borderColor: "#303665" }}
    pressStyle={{ scale: 0.99 }}
  >
    <YStack gap="$3">{children}</YStack>
  </Card>
);
