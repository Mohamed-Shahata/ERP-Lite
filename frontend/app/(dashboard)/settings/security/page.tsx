"use client";

import Link from "next/link";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function SecuritySettingsPage() {
  const { t } = useTranslations();

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        <Link
          href="/dashboard"
          className="hover:text-blue-600 dark:hover:text-blue-400"
        >
          {t("common.dashboardHome")}
        </Link>
        <span className="mx-1.5">/</span>
        <Link
          href="/settings"
          className="hover:text-blue-600 dark:hover:text-blue-400"
        >
          {t("common.settings")}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-600 dark:text-slate-300">
          {t("security.title")}
        </span>
      </p>

      <section>
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
          {t("security.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("security.description")}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <ChangePasswordForm />
      </section>
    </div>
  );
}
