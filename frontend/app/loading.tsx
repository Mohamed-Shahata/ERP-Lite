"use client";

import Image from "next/image";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function Loading() {
  const { t } = useTranslations();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white dark:bg-slate-950">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin dark:border-slate-800 dark:border-t-blue-400" />
        <Image
          src="/erp-system-logo.png"
          alt="ERP Lite Logo"
          width={30}
          height={30}
        />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-slate-950 dark:text-white">
          {t("common.loading")}
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {t("common.loadingSubtext")}
        </p>
      </div>

      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce dark:bg-blue-400"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
