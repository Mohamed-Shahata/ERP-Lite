"use client";

import { localeLabels, type Locale } from "@/lib/i18n/types";
import { useTranslations } from "@/lib/i18n/use-translations";

interface LanguageSwitcherProps {
  className?: string;
}

function GlobeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path
        strokeLinecap="round"
        d="M12 3.5c2.2 2.3 3.3 5 3.3 8.5s-1.1 6.2-3.3 8.5c-2.2-2.3-3.3-5-3.3-8.5S9.8 5.8 12 3.5Z"
      />
      <path strokeLinecap="round" d="M3.8 9h16.4M3.8 15h16.4" />
    </svg>
  );
}

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useTranslations();
  const locales = Object.keys(localeLabels) as Locale[];

  function toggleLocale() {
    const currentIndex = locales.indexOf(locale);
    const next = locales[(currentIndex + 1) % locales.length];
    setLocale(next);
  }

  return (
    <button
      type="button"
      onClick={toggleLocale}
      title={t("language.label")}
      className={`flex h-9 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400 ${className}`}
    >
      <span className="sr-only">{t("language.label")}</span>
      <GlobeIcon />
      <span className="uppercase">{locale}</span>
    </button>
  );
}
