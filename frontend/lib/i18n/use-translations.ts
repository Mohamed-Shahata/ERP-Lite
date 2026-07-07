"use client";

import { useMemo } from "react";
import { getMessages } from "./index";
import {
  getDateLocale,
  getLocaleDirection,
  useLocaleStore,
} from "./locale-store";
import type { Messages } from "./types";

type Params = Record<string, string | number>;

function getNestedValue(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

function formatMessage(template: string, params?: Params): string {
  if (!params) return template;
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function useTranslations() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const messages = useMemo(() => getMessages(locale), [locale]);

  function t(path: string, params?: Params): string {
    const value = getNestedValue(messages, path);
    if (typeof value !== "string") {
      return path;
    }
    return formatMessage(value, params);
  }

  return {
    t,
    locale,
    setLocale,
    messages,
    dir: getLocaleDirection(locale),
    dateLocale: getDateLocale(locale),
  };
}

export type TranslateFn = ReturnType<typeof useTranslations>["t"];

export function createTranslator(messages: Messages) {
  return (path: string, params?: Params): string => {
    const value = getNestedValue(messages, path);
    if (typeof value !== "string") {
      return path;
    }
    return formatMessage(value, params);
  };
}
