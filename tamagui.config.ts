import { defaultConfig } from "@tamagui/config/v4";
import { createTamagui } from "tamagui";

const tamaguiConfig = createTamagui({
  ...defaultConfig,
  defaultTheme: "dark",
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      background: "#FAFAF8",
      backgroundHover: "#EEECEA",
      backgroundPress: "#E7E4DE",
      backgroundFocus: "#F4F3EF",
      color: "#1A1916",
      colorHover: "#1A1916",
      colorPress: "#1A1916",
      borderColor: "#E5E3DE",
      borderColorHover: "#D0CEC8",
      borderColorFocus: "#D0CEC8",
      shadowColor: "rgba(0,0,0,0.12)",
      accentColor: "#7C3AED",
      accentBackground: "#EDE9FE",
      accentColorHover: "#5B21B6",
      accentBackgroundHover: "#DDD6FE",
    },
    dark: {
      ...defaultConfig.themes.dark,
      background: "#0A0C1F",
      backgroundHover: "#0F1327",
      backgroundPress: "#141936",
      backgroundFocus: "#0D1026",
      color: "#E8E9F5",
      colorHover: "#FFFFFF",
      colorPress: "#E8E9F5",
      borderColor: "#1D2040",
      borderColorHover: "#303665",
      borderColorFocus: "#6266F1",
      shadowColor: "rgba(0,0,0,0.5)",
      accentColor: "#6266F1",
      accentBackground: "#14183A",
      accentColorHover: "#8B8FFF",
      accentBackgroundHover: "#1D2359",
    },
  },
});

export type AppTamaguiConfig = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

export default tamaguiConfig;
