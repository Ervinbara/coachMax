import { Text, XStack, YStack } from "tamagui";
import { AppCard } from "./AppCard";

type DashboardWidgetProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: "accent" | "orange" | "success" | "sky";
};

const toneMap = {
  accent: { bg: "#14183A", value: "#8B8FFF" },
  orange: { bg: "#2C1A0E", value: "#F97316" },
  success: { bg: "#0A2318", value: "#22C55E" },
  sky: { bg: "#0A1E2C", value: "#38BDF8" },
};

export const DashboardWidget = ({ label, value, hint, tone = "accent" }: DashboardWidgetProps) => {
  const colors = toneMap[tone];
  return (
    <AppCard>
      <YStack gap="$2" bg={colors.bg} p="$3" br="$5">
        <Text color="#7B80A4" fontSize={12} textTransform="uppercase" letterSpacing={1}>
          {label}
        </Text>
        <XStack ai="baseline" gap="$2">
          <Text color={colors.value} fontWeight="700" fontSize={34} fontFamily="monospace">
            {value}
          </Text>
        </XStack>
        {hint ? (
          <Text color="#7B80A4" fontSize={12}>
            {hint}
          </Text>
        ) : null}
      </YStack>
    </AppCard>
  );
};
