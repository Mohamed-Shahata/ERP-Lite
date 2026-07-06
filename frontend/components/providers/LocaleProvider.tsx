"use client";

import { useEffect } from "react";
import { getLocaleDirection, useLocaleStore } from "@/lib/i18n/locale-store";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = getLocaleDirection(locale);
  }, [locale]);

  return children;
}
