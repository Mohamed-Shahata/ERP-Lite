"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "@/lib/i18n/use-translations";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function LostBoxIllustration() {
  return (
    <svg
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-44 w-auto sm:h-52"
    >
      {/* Ground shadow */}
      <ellipse
        cx="110"
        cy="152"
        rx="70"
        ry="8"
        className="fill-slate-200 dark:fill-slate-800"
      />

      {/* Tipped-over crate with scattered items */}
      <g
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-600 dark:text-blue-400"
      >
        <path
          d="M40 118 88 100l40 15-48 18-40-15Z"
          className="fill-blue-50 dark:fill-blue-950/40"
        />
        <path
          d="M40 118v14l40 15v-14"
          className="fill-blue-100 dark:fill-blue-900/40"
        />
        <path
          d="M128 115v14l-40 18v-14"
          className="fill-blue-100/70 dark:fill-blue-900/30"
        />
        <path d="M40 118 88 100l40 15" />
      </g>

      {/* Scattered product squares */}
      <g
        className="text-slate-400 dark:text-slate-600"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect
          x="128"
          y="70"
          width="20"
          height="20"
          rx="3"
          transform="rotate(12 138 80)"
          className="fill-white dark:fill-slate-900"
        />
        <rect
          x="150"
          y="100"
          width="16"
          height="16"
          rx="3"
          transform="rotate(-10 158 108)"
          className="fill-white dark:fill-slate-900"
        />
        <circle
          cx="60"
          cy="80"
          r="9"
          className="fill-white dark:fill-slate-900"
        />
      </g>

      {/* Magnifying glass with a question mark, floating above the mess */}
      <g
        className="text-blue-600 dark:text-blue-400"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle
          cx="110"
          cy="46"
          r="24"
          className="fill-white dark:fill-slate-900"
        />
        <path d="M127 63 141 77" />
        <path
          d="M101 40a9 9 0 1 1 12.2 8.4c-2.6 1-4.2 2.6-4.2 5v1.4"
          fill="none"
        />
        <circle cx="109" cy="60.5" r="1.4" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export default function NotFound() {
  const { t } = useTranslations();

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      {/* Top bar — mirrors the auth/dashboard chrome */}
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Image
            src="/erp-system-logo.png"
            alt="ERP Lite Logo"
            width={36}
            height={36}
          />
          <span className="text-base font-semibold text-slate-950 dark:text-white">
            {t("shell.brand")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
        <div className="pointer-events-none absolute -top-24 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/10" />

        <div className="relative w-full max-w-md text-center">
          <div className="flex justify-center text-slate-900 dark:text-white">
            <LostBoxIllustration />
          </div>

          <p className="mt-6 text-sm font-medium text-blue-600 dark:text-blue-400">
            {t("notFound.errorCode")}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {t("notFound.title")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t("notFound.description")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {t("notFound.backToDashboard")}
            </Link>
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t("notFound.browseProducts")}
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
        {t("notFound.helpText")}
      </footer>
    </div>
  );
}
