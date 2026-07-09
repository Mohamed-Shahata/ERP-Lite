"use client";

import { useTranslations } from "@/lib/i18n/use-translations";

/** Shared in-content loader shown while a dashboard route segment loads.
 * Keeps the sidebar/header mounted — only this fills the content area. */
export function PageLoading() {
  const { t } = useTranslations();

  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="inline-block h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400 animate-spin" />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          {t("common.loading")}
        </p>
      </div>
    </div>
  );
}
