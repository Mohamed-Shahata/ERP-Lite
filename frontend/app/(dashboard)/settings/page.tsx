"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/i18n/use-translations";

const settingsSections = [
  {
    href: "/settings/security",
    titleKey: "security.title",
    descriptionKey: "security.description",
  },
  {
    href: "/settings/users",
    titleKey: "nav.users",
    description: "Manage system users and access roles.",
  },
];

export default function SettingsPage() {
  const { t } = useTranslations();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          {t("common.settings")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
          {t("common.settings")}
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Manage your account security and related settings from one place.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
              {section.titleKey ? t(section.titleKey) : section.titleKey}
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {section.descriptionKey
                ? t(section.descriptionKey)
                : section.description}
            </p>
            <span className="mt-4 inline-flex text-sm font-medium text-blue-600 dark:text-blue-400">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
