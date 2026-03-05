import { Text, View } from "react-native";
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
      <View style={{ backgroundColor: colors.bg, padding: 12, borderRadius: 12, gap: 8 }}>
        <Text style={{ color: "#7B80A4", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{label}</Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <Text style={{ color: colors.value, fontWeight: "700", fontSize: 34, fontFamily: "monospace" }}>{value}</Text>
        </View>
        {hint ? <Text style={{ color: "#7B80A4", fontSize: 12 }}>{hint}</Text> : null}
      </View>
    </AppCard>
  );
};
