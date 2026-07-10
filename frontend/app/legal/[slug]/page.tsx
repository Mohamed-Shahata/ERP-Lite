"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getContentPageRequest } from "@/lib/api/content-pages.api";
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

export default function ContentPagePublic({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t } = useTranslations();
  const apiSlug = VALID_SLUGS[slug.toLowerCase()];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["content-page", apiSlug],
    queryFn: () => getContentPageRequest(apiSlug),
    enabled: Boolean(apiSlug),
  });

  if (!apiSlug) {
    notFound();
  }

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("contentPages.loadError")}
        </p>
      </div>
    );
  }

  const hasBody = data.body && data.body.trim().length > 0;

  return (
    <article>
      <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
        {data.title}
      </h1>

      {hasBody ? (
        <div
          dir="auto"
          className="content-page-body mt-6 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-700 dark:[&_a]:text-blue-400 [&_blockquote]:my-4 [&_blockquote]:border-s-4 [&_blockquote]:border-slate-300 [&_blockquote]:ps-4 [&_blockquote]:italic [&_blockquote]:text-slate-500 dark:[&_blockquote]:border-slate-700 [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:text-base [&_h4]:font-semibold [&_hr]:my-6 [&_hr]:border-slate-200 dark:[&_hr]:border-slate-800 [&_li]:mb-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:mb-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:ps-5"
          // Body is server-side sanitized (sanitize-html, strict tag/attr
          // whitelist) before it's ever persisted — see
          // content-pages.service.ts on the backend.
          dangerouslySetInnerHTML={{ __html: data.body }}
        />
      ) : (
        <p className="mt-6 text-sm text-slate-400 dark:text-slate-500">
          {t("contentPages.empty")}
        </p>
      )}
    </article>
  );
}
