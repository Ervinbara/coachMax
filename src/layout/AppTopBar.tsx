import { Link } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
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
    <YStack gap="$2" mb="$2" p="$4" br="$6" bg="#0A0D24" borderWidth={1} borderColor="#1D2040">
      <XStack jc="space-between" ai="center" gap="$2">
        <YStack>
          <Text fontSize={30} fontWeight="700" color="#E8E9F5" letterSpacing={-0.6}>
            {title}
          </Text>
          {subtitle ? (
            <Text color="#7B80A4" opacity={0.95} fontSize={14}>
              {subtitle}
            </Text>
          ) : null}
        </YStack>
        <XStack ai="center" gap="$2">
          <LocaleSwitch />
          {showBack ? (
            <Link href={backHref as never} asChild>
              <XStack>
                <AppButton label={t(locale, "common.back")} variant="secondary" />
              </XStack>
            </Link>
          ) : null}
        </XStack>
      </XStack>
    </YStack>
  );
};
