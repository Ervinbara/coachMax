import { Link } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import { AppButton } from "../components/AppButton";

type AppTopBarProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
};

export const AppTopBar = ({ title, subtitle, showBack = false, backHref = "/" }: AppTopBarProps) => (
  <YStack gap="$2" mb="$2">
    <XStack jc="space-between" ai="center" gap="$2">
      <YStack>
        <Text fontSize={26} fontWeight="800" color="$color">
          {title}
        </Text>
        {subtitle ? (
          <Text color="$color" opacity={0.65} fontSize={13}>
            {subtitle}
          </Text>
        ) : null}
      </YStack>
      {showBack ? (
        <Link href={backHref as never} asChild>
          <XStack>
            <AppButton label="Retour" variant="ghost" />
          </XStack>
        </Link>
      ) : null}
    </XStack>
  </YStack>
);
