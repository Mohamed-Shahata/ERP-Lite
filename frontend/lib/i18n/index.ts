import { ar } from "./messages/ar";
import { en } from "./messages/en";
import type { Locale, Messages } from "./types";

const messages: Record<Locale, Messages> = {
  en,
  ar,
};

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? en;
}

export { ar, en };
