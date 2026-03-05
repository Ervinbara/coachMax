import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
};

export const AppButton = ({ label, onPress, loading = false, variant = "primary", disabled = false }: AppButtonProps) => {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";

  const containerClass = isPrimary
    ? "rounded-xl px-4 py-3 items-center justify-center"
    : isSecondary
    ? "bg-dark-nav border border-dark-border rounded-xl px-4 py-3 items-center justify-center"
    : "rounded-xl px-4 py-3 items-center justify-center";

  const textColor = isPrimary ? "#FFFFFF" : isSecondary ? "#E8E9F5" : "#7B80A4";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      className={containerClass}
      style={
        isPrimary
          ? ({ backgroundImage: "linear-gradient(135deg, #6266F1 0%, #8B8FFF 50%, #F97316 100%)", backgroundColor: "#6266F1" } as any)
          : undefined
      }
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={{ color: textColor, fontWeight: "700", fontSize: 15 }}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};
