"use client";

import { useAuthStore } from "@/lib/auth/auth-store";
import { useTranslations } from "@/lib/i18n/use-translations";

interface ExportButtonsProps {
  onExportPdf: () => void;
  onExportExcel: () => void;
  disabled?: boolean;
}

export function ExportButtons({
  onExportPdf,
  onExportExcel,
  disabled,
}: ExportButtonsProps) {
  const { t } = useTranslations();
  const { user } = useAuthStore();

  // Employees can view every report but never print or export one —
  // only ADMIN and MANAGER get these buttons.
  if (user?.role === "EMPLOYEE") {
    return null;
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onExportPdf}
        className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("reports.exportPdf")}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onExportExcel}
        className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("reports.exportExcel")}
      </button>
    </div>
  );
}
