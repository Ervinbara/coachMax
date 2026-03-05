import { Link, usePathname } from "expo-router";
import { Text, XStack } from "tamagui";
import { useLocaleStore } from "../features/settings/useLocaleStore";
import { t } from "../lib/i18n";

type RoleNavProps = {
  role: "coach" | "client";
};

type NavItem = {
  key: string;
  href: string;
};

const coachItems: NavItem[] = [
  { key: "nav.dashboard", href: "/(coach)/dashboard" },
  { key: "nav.clients", href: "/(coach)/clients" },
  { key: "nav.program", href: "/(coach)/program-builder" },
  { key: "nav.nutrition", href: "/(coach)/nutrition-builder" },
];

const clientItems: NavItem[] = [
  { key: "nav.dashboard", href: "/(client)/dashboard" },
  { key: "nav.program", href: "/(client)/program" },
  { key: "nav.nutrition", href: "/(client)/nutrition" },
  { key: "nav.progress", href: "/(client)/progress" },
  { key: "nav.chat", href: "/(client)/chat" },
];

export const RoleNav = ({ role }: RoleNavProps) => {
  const pathname = usePathname();
  const locale = useLocaleStore((state) => state.locale);
  const items = role === "coach" ? coachItems : clientItems;

  return (
    <XStack
      gap="$2"
      p="$2"
      br="$6"
      bg="#07091a"
      borderWidth={1}
      borderColor="#1D2040"
      fw="wrap"
      mb="$1"
    >
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href as never} asChild>
            <XStack
              px="$3"
              py="$2"
              br="$10"
              bg={active ? "#6266F1" : "#10142E"}
              borderWidth={1}
              borderColor={active ? "#6266F1" : "#1D2040"}
            >
              <Text color={active ? "#FFFFFF" : "#7B80A4"} fontWeight={active ? "700" : "500"} fontSize={13}>
                {t(locale, item.key)}
              </Text>
            </XStack>
          </Link>
        );
      })}
    </XStack>
  );
};
