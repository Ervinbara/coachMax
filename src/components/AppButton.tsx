import { Button, Spinner } from "tamagui";

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
  return (
    <Button
      onPress={onPress}
      bg={isPrimary ? "#6266F1" : isSecondary ? "#10142E" : "transparent"}
      color={isPrimary ? "#FFFFFF" : isSecondary ? "#E8E9F5" : "#7B80A4"}
      borderColor={isPrimary ? "#6266F1" : isSecondary ? "#1D2040" : "transparent"}
      borderWidth={isSecondary ? 1.5 : 1}
      size="$4"
      icon={loading ? <Spinner size="small" color="$color" /> : undefined}
      disabled={loading || disabled}
      animation="quick"
      hoverStyle={{
        bg: isPrimary ? "#4F52CC" : isSecondary ? "#141936" : "#0F1230",
        borderColor: isSecondary ? "#6266F1" : undefined,
        color: isSecondary ? "#FFFFFF" : undefined,
      }}
      style={isPrimary ? ({ backgroundImage: "linear-gradient(135deg, #6266F1 0%, #8B8FFF 50%, #F97316 100%)" } as any) : undefined}
      pressStyle={{ scale: 0.98 }}
    >
      {label}
    </Button>
  );
};
