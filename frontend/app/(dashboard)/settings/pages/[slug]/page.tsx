"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getContentPageRequest,
  updateContentPageRequest,
} from "@/lib/api/content-pages.api";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { PageLoading } from "@/components/ui/PageLoading";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { PageSlug } from "@/types/content-page.types";

const VALID_SLUGS: Record<string, PageSlug> = {
  help: "HELP",
  privacy: "PRIVACY",
  terms: "TERMS",
  support: "SUPPORT",
  teams: "TEAMS",
};

function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 4.5h5.5V10M19 5l-8.5 8.5M8 6H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3"
      />
    </svg>
  );
}

export default function ContentPageEditor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const apiSlug = VALID_SLUGS[slug.toLowerCase()];
  const { t } = useTranslations();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, error: loadError } = useQuery({
    queryKey: ["content-page", apiSlug],
    queryFn: () => getContentPageRequest(apiSlug),
    enabled: Boolean(apiSlug),
  });

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(data.title);
      setBody(data.body);
    }
  }, [data]);

  if (!apiSlug) {
    notFound();
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateContentPageRequest(apiSlug, { title, body });
      await queryClient.invalidateQueries({ queryKey: ["content-page", apiSlug] });
      await queryClient.invalidateQueries({ queryKey: ["content-pages"] });
      setMessage(t("contentPages.saveSuccess"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("contentPages.saveError"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        {t("common.dashboardHome")}
        <span className="mx-1.5">/</span>
        <Link href="/settings" className="hover:text-slate-600 dark:hover:text-slate-300">
          {t("settings.title")}
        </Link>
        <span className="mx-1.5">/</span>
        <Link
          href="/settings/pages"
          className="hover:text-slate-600 dark:hover:text-slate-300"
        >
          {t("contentPages.title")}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-600 dark:text-slate-300">
          {title || slug}
        </span>
      </p>

      <section className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
            {title || t("contentPages.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("contentPages.editorDescription")}
          </p>
        </div>
        <a
          href={`/legal/${slug.toLowerCase()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ExternalLinkIcon />
          {t("contentPages.preview")}
        </a>
      </section>

      {isLoading || !data ? (
        <PageLoading />
      ) : (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
              {message}
            </p>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("contentPages.pageTitle")}
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("contentPages.pageBody")}
            </label>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder={t("contentPages.editor.placeholder")}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={isSaving || !title.trim()}
              onClick={handleSave}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? t("common.loading") : t("common.save")}
            </button>
          </div>
        </div>
      )}

      {loadError && !isLoading && (
        <p className="text-sm text-red-500">{t("contentPages.loadError")}</p>
      )}
    </div>
  );
}
