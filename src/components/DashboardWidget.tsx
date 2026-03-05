import { Text, XStack, YStack } from "tamagui";
import { AppCard } from "./AppCard";

type DashboardWidgetProps = {
  label: string;
  value: string;
  hint?: string;
};

export const DashboardWidget = ({ label, value, hint }: DashboardWidgetProps) => (
  <AppCard>
    <YStack gap="$1">
      <Text color="$color" opacity={0.7} fontSize={13}>
        {label}
      </Text>
      <XStack ai="baseline" gap="$2">
        <Text color="$color" fontWeight="700" fontSize={28}>
          {value}
        </Text>
      </XStack>
      {hint ? (
        <Text color="$accentColor" fontSize={12}>
          {hint}
        </Text>
      ) : null}
    </YStack>
  </AppCard>
);
