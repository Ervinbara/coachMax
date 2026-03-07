export const colors = {
  primary: "#2F80ED",
  primaryDeep: "#256FDB",
  lightBlueBg: "#EAF3FF",
  success: "#27C281",
  successLight: "#EAFBF3",
  warning: "#F4A340",
  warningLight: "#FFF4E8",
  textMain: "#1F2A44",
  textSecondary: "#6B7A99",
  textMuted: "#94A3B8",
  border: "#E8EEF5",
  pageBg: "#F4F7FB",
  cardBg: "#FFFFFF",
  sidebarBg: "#FFFFFF",
  shadow: "rgba(31,42,68,0.08)",
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 22,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 22,
    elevation: 4,
  },
};

export const typography = {
  h1: { fontSize: 32, lineHeight: 38, fontWeight: "700" as const },
  h2: { fontSize: 24, lineHeight: 30, fontWeight: "700" as const },
  h3: { fontSize: 20, lineHeight: 26, fontWeight: "700" as const },
  cardTitle: { fontSize: 18, lineHeight: 24, fontWeight: "600" as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: "500" as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: "500" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
};
