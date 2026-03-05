import { Button, Spinner } from "tamagui";

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  variant?: "primary" | "ghost";
  disabled?: boolean;
};

export const AppButton = ({ label, onPress, loading = false, variant = "primary", disabled = false }: AppButtonProps) => {
  const isPrimary = variant === "primary";
  return (
    <Button
      onPress={onPress}
      bg={isPrimary ? "$accentBackground" : "rgba(255, 255, 255, 0.06)"}
      color={isPrimary ? "$accentColorHover" : "$color"}
      borderColor={isPrimary ? "$accentColor" : "$borderColor"}
      borderWidth={1}
      size="$4"
      icon={loading ? <Spinner size="small" color="$color" /> : undefined}
      disabled={loading || disabled}
      animation="quick"
      hoverStyle={{ bg: isPrimary ? "$accentBackgroundHover" : "rgba(255, 255, 255, 0.12)" }}
      pressStyle={{ scale: 0.98 }}
    >
      {label}
    </Button>
  );
};
