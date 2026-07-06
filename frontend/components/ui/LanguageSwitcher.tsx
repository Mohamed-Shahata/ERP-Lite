"use client";

import { localeLabels, type Locale } from "@/lib/i18n/types";
import { useTranslations } from "@/lib/i18n/use-translations";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useTranslations();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="sr-only">{t("language.label")}</span>
      {(Object.keys(localeLabels) as Locale[]).map((value) => {
        const active = locale === value;
        return (
          <button
            key={value}
            aria-current={active ? "true" : undefined}
            className={`h-9 rounded-md border px-3 text-sm font-medium transition-colors ${
              active
                ? "border-slate-950 bg-slate-950 text-white dark:border-emerald-600 dark:bg-emerald-600"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
            onClick={() => setLocale(value)}
            type="button"
          >
            {localeLabels[value]}
          </button>
        );
      })}
    </div>
  );
}
