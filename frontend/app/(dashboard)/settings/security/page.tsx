"use client";

import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function SecuritySettingsPage() {
  const { t } = useTranslations();

  return (
    <div className="max-w-3xl space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-700">
          {t("common.settings")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          {t("security.title")}
        </h2>
        <p className="mt-2 text-sm text-slate-500">{t("security.description")}</p>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <ChangePasswordForm />
      </section>
    </div>
  );
}
