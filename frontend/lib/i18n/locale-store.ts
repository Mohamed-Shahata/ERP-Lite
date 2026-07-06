"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "./types";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "erp-lite-locale" },
  ),
);

export function getLocaleDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getDateLocale(locale: Locale): string {
  return locale === "ar" ? "ar-EG" : "en-US";
}
