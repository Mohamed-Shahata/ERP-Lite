import type { en } from "./messages/en";

export type Locale = "en" | "ar";

/**
 * `en` is declared with `as const` so its keys stay literal (good — that's
 * what makes `t("some.key")` type-checked). But that also makes every leaf
 * *value* a string literal, which would force every other locale to use the
 * exact same English text. This widens leaf values back to `string` while
 * preserving the nested key structure.
 */
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

export type Messages = WidenStrings<typeof en>;

export const locales: Locale[] = ["en", "ar"];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export type MessageKey = keyof Messages;
