"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listContentPagesRequest } from "@/lib/api/content-pages.api";
import { useTranslations } from "@/lib/i18n/use-translations";
import { PageLoading } from "@/components/ui/PageLoading";
import type { PageSlug } from "@/types/content-page.types";

const PAGE_ORDER: PageSlug[] = ["HELP", "PRIVACY", "TERMS", "SUPPORT", "TEAMS"];

// System page names — shown in the admin's current UI language regardless
// of what's saved in the DB, so this list always reads in Arabic/English
// depending on the interface, independent of the editable page title.
const LABEL_KEYS: Record<PageSlug, string> = {
  HELP: "contentPages.labels.help",
  PRIVACY: "contentPages.labels.privacy",
  TERMS: "contentPages.labels.terms",
  SUPPORT: "contentPages.labels.support",
  TEAMS: "contentPages.labels.teams",
};

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

export default function ContentPagesSettingsPage() {
  const { t } = useTranslations();
  const { data, isLoading } = useQuery({
    queryKey: ["content-pages"],
    queryFn: listContentPagesRequest,
  });

  const bySlug = new Map((data ?? []).map((page) => [page.slug, page]));

  return (
    <div className="max-w-4xl space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        {t("common.dashboardHome")}
        <span className="mx-1.5">/</span>
        <Link
          href="/settings"
          className="hover:text-slate-600 dark:hover:text-slate-300"
        >
          {t("settings.title")}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-600 dark:text-slate-300">
          {t("contentPages.title")}
        </span>
      </p>

      <section>
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
          {t("contentPages.title")}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("contentPages.description")}
        </p>
      </section>

      {isLoading ? (
        <PageLoading />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {PAGE_ORDER.map((slug) => {
            const page = bySlug.get(slug);
            const title = t(LABEL_KEYS[slug]);
            const hasContent = Boolean(page?.body?.trim());
            return (
              <Link
                key={slug}
                href={`/settings/pages/${slug.toLowerCase()}`}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <DocumentIcon />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {hasContent
                        ? t("contentPages.hasContent")
                        : t("contentPages.emptyContent")}
                    </p>
                  </div>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                  {t("common.edit")}
                  <ChevronIcon />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
