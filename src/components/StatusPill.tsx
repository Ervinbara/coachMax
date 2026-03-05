import { Text, View } from "react-native";

type StatusPillProps = {
  label: string;
  tone?: "success" | "warning" | "danger" | "neutral";
};

const toneMap = {
  success: { bg: "#0A2318", border: "#14532D", color: "#22C55E" },
  warning: { bg: "#2C1A0E", border: "#431A00", color: "#F97316" },
  danger: { bg: "#2C0E14", border: "#4D0A14", color: "#F43F5E" },
  neutral: { bg: "#14183A", border: "#1D2359", color: "#8B8FFF" },
};

export const StatusPill = ({ label, tone = "neutral" }: StatusPillProps) => {
  const colors = toneMap[tone];
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
      }}
    >
      <Text style={{ fontSize: 11, color: colors.color, fontWeight: "700" }}>{label}</Text>
    </View>
  );
};
