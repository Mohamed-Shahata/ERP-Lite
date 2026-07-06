import type { en } from "./messages/en";

export type Locale = "en" | "ar";

export type Messages = typeof en;

export const locales: Locale[] = ["en", "ar"];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export type MessageKey = keyof Messages;
