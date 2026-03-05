import { ReactNode } from "react";
import { Card, YStack } from "tamagui";

type AppCardProps = {
  children: ReactNode;
};

export const AppCard = ({ children }: AppCardProps) => (
  <Card
    elevate
    bordered
    borderColor="$borderColor"
    bg="rgba(15, 22, 40, 0.88)"
    br="$6"
    p="$4"
    animation="quick"
    hoverStyle={{ bg: "rgba(21, 31, 56, 0.95)", y: -2 }}
    pressStyle={{ scale: 0.99 }}
  >
    <YStack gap="$3">{children}</YStack>
  </Card>
);
