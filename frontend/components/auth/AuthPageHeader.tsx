"use client";

import { useTranslations } from "@/lib/i18n/use-translations";

interface AuthPageHeaderProps {
  eyebrowKey?: string;
  titleKey: string;
  subtitleKey: string;
}

export function AuthPageHeader({
  eyebrowKey,
  titleKey,
  subtitleKey,
}: AuthPageHeaderProps) {
  const { t } = useTranslations();

  return (
    <>
      {eyebrowKey ? (
        <p className="text-sm font-medium text-emerald-700">{t(eyebrowKey)}</p>
      ) : null}
      <h1
        className={`text-2xl font-semibold text-slate-950 ${eyebrowKey ? "mt-2" : ""}`}
      >
        {t(titleKey)}
      </h1>
      <p className="mb-6 mt-2 text-sm text-slate-500">{t(subtitleKey)}</p>
    </>
  );
}
