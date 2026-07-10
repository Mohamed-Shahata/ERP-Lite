"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { Role } from "@/types/auth.types";

function KeyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <circle cx="8" cy="15" r="3.5" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 12.5 17 6M15 8l2 2M18 5l2 2"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M15 21h5v-9a1 1 0 0 0-1-1h-4M8 8h.01M12 8h.01M8 12h.01M12 12h.01M8 16h.01M12 16h.01"
      />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 4h9a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4Z"
      />
      <path strokeLinecap="round" d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3.5V8h4" />
      <path strokeLinecap="round" d="M9 12.5h6M9 15.5h6M9 9.5h2" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-4 w-4 rtl:rotate-180"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
    </svg>
  );
}

/**
 * Central registry for every settings section. Adding a new settings page
 * later (billing, notifications, integrations, etc.) only requires a new
 * entry here — the grid, role-based visibility, and layout are all
 * handled generically below.
 */
interface SettingsSection {
  href: string;
  icon: () => React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  /** Roles allowed to see this section. Omit to allow every authenticated role. */
  roles?: Role[];
}

const settingsSections: SettingsSection[] = [
  {
    href: "/settings/security",
    icon: KeyIcon,
    titleKey: "settings.security.cardTitle",
    descriptionKey: "settings.security.cardDescription",
  },
  // Company name/logo/currency/invoice details — admins only.
  {
    href: "/settings/company",
    icon: BuildingIcon,
    titleKey: "settings.companyCard.cardTitle",
    descriptionKey: "settings.companyCard.cardDescription",
    roles: ["ADMIN"],
  },
  // Who did what, when — admins only.
  {
    href: "/settings/audit-logs",
    icon: ScrollIcon,
    titleKey: "auditLogs.cardTitle",
    descriptionKey: "auditLogs.cardDescription",
    roles: ["ADMIN"],
  },
  // Help/Privacy/Terms/Support/Teams content shown on the login screen and
  // dashboard footer — admins only.
  {
    href: "/settings/pages",
    icon: DocumentIcon,
    titleKey: "contentPages.cardTitle",
    descriptionKey: "contentPages.cardDescription",
    roles: ["ADMIN"],
  },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { t } = useTranslations();

  const visibleSections = settingsSections.filter(
    (section) => !section.roles || (user && section.roles.includes(user.role)),
  );

  return (
    <div className="max-w-4xl space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        {t("common.dashboardHome")}
        <span className="mx-1.5">/</span>
        <span className="text-slate-600 dark:text-slate-300">
          {t("settings.title")}
        </span>
      </p>

      {/* Header */}
      <section>
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
          {t("settings.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("settings.description")}
        </p>
      </section>

      {/* Section grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {visibleSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <Icon />
                </span>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                    {t(section.titleKey)}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t(section.descriptionKey)}
                  </p>
                </div>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                {t("settings.open")}
                <ChevronIcon />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Placeholder for future settings sections */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        {t("settings.comingSoon")}
      </p>
    </div>
  );
}
