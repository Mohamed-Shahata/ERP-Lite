"use client";

import { useTranslations } from "@/lib/i18n/use-translations";

interface DateRangeFilterProps {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}

const inputClass =
  "h-10 rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white";

export function DateRangeFilter({ from, to, onChange }: DateRangeFilterProps) {
  const { t } = useTranslations();

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={from}
        onChange={(event) => onChange({ from: event.target.value, to })}
        className={inputClass}
        aria-label={t("reports.dateFrom")}
      />
      <span className="text-sm text-slate-400 dark:text-slate-500">
        {t("reports.dateTo")}
      </span>
      <input
        type="date"
        value={to}
        onChange={(event) => onChange({ from, to: event.target.value })}
        className={inputClass}
        aria-label={t("reports.dateTo")}
      />
    </div>
  );
}
