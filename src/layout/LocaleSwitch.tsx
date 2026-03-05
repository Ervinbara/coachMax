import { Text, TouchableOpacity, View } from "react-native";
import { useLocaleStore } from "../features/settings/useLocaleStore";

export const LocaleSwitch = () => {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 4,
        padding: 4,
        borderRadius: 999,
        backgroundColor: "#10142E",
        borderWidth: 1,
        borderColor: "#1D2040",
      }}
    >
      <TouchableOpacity
        onPress={() => setLocale("fr")}
        style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 999,
          backgroundColor: locale === "fr" ? "#6266F1" : "transparent",
        }}
        activeOpacity={0.8}
      >
        <Text style={{ color: locale === "fr" ? "#FFFFFF" : "#7B80A4", fontSize: 12, fontWeight: "700" }}>FR</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setLocale("en")}
        style={{
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 999,
          backgroundColor: locale === "en" ? "#6266F1" : "transparent",
        }}
        activeOpacity={0.8}
      >
        <Text style={{ color: locale === "en" ? "#FFFFFF" : "#7B80A4", fontSize: 12, fontWeight: "700" }}>EN</Text>
      </TouchableOpacity>
    </View>
  );
};
