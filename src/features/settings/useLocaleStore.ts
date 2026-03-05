import { create } from "zustand";

export type Locale = "fr" | "en";

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: "fr",
  setLocale: (locale) => set({ locale }),
}));
