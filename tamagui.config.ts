import { defaultConfig } from "@tamagui/config/v4";
import { createTamagui } from "tamagui";

const tamaguiConfig = createTamagui({
  ...defaultConfig,
  defaultTheme: "dark",
  themes: {
    ...defaultConfig.themes,
    dark: {
      ...defaultConfig.themes.dark,
      background: "#090d19",
      backgroundHover: "#12192b",
      backgroundPress: "#1a2237",
      backgroundFocus: "#1a2237",
      color: "#f4f7ff",
      colorHover: "#ffffff",
      colorPress: "#dce5ff",
      borderColor: "#1f2a44",
      borderColorHover: "#2d3c60",
      borderColorFocus: "#3b4e79",
      shadowColor: "#000000",
      accentColor: "#42d392",
      accentBackground: "#11271f",
      accentColorHover: "#7ef0be",
      accentBackgroundHover: "#17392d",
    },
  },
});

export type AppTamaguiConfig = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

export default tamaguiConfig;
