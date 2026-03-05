import { router } from "expo-router";
import { Text, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { useLocaleStore } from "../features/settings/useLocaleStore";
import { t } from "../lib/i18n";
import { LocaleSwitch } from "./LocaleSwitch";

type AppTopBarProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
};

export const AppTopBar = ({ title, subtitle, showBack = false, backHref = "/" }: AppTopBarProps) => (
  <AppTopBarInner title={title} subtitle={subtitle} showBack={showBack} backHref={backHref} />
);

const AppTopBarInner = ({ title, subtitle, showBack = false, backHref = "/" }: AppTopBarProps) => {
  const locale = useLocaleStore((state) => state.locale);

  return (
    <View
      style={{
        gap: 8,
        marginBottom: 8,
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#0A0D24",
        borderWidth: 1,
        borderColor: "#1D2040",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <View>
          <Text style={{ fontSize: 30, fontWeight: "700", color: "#E8E9F5", letterSpacing: -0.6 }}>{title}</Text>
          {subtitle ? (
            <Text style={{ color: "#7B80A4", fontSize: 14 }}>{subtitle}</Text>
          ) : null}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <LocaleSwitch />
          {showBack ? (
            <AppButton label={t(locale, "common.back")} variant="secondary" onPress={() => router.push(backHref as never)} />
          ) : null}
        </View>
      </View>
    </View>
  );
};
