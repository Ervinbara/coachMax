import { Text, XStack } from "tamagui";
import { useLocaleStore } from "../features/settings/useLocaleStore";

export const LocaleSwitch = () => {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <XStack gap="$1" p="$1" br="$10" bg="#10142E" borderWidth={1} borderColor="#1D2040">
      <XStack
        px="$2"
        py="$1"
        br="$8"
        bg={locale === "fr" ? "#6266F1" : "transparent"}
        onPress={() => setLocale("fr")}
      >
        <Text color={locale === "fr" ? "#FFFFFF" : "#7B80A4"} fontSize={12} fontWeight="700">
          FR
        </Text>
      </XStack>
      <XStack
        px="$2"
        py="$1"
        br="$8"
        bg={locale === "en" ? "#6266F1" : "transparent"}
        onPress={() => setLocale("en")}
      >
        <Text color={locale === "en" ? "#FFFFFF" : "#7B80A4"} fontSize={12} fontWeight="700">
          EN
        </Text>
      </XStack>
    </XStack>
  );
};
