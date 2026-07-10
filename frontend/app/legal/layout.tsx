"use client";

import Link from "next/link";
import Image from "next/image";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTranslations } from "@/lib/i18n/use-translations";

function BackIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-4 w-4 rtl:rotate-180"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 6 9 12l6 6" />
    </svg>
  );
}

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslations();
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/erp-system-logo.png"
            alt="ERP Lite Logo"
            width={40}
            height={40}
          />
          <span className="text-base font-semibold text-slate-950 dark:text-white">
            {t("shell.brand")}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/login"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <BackIcon />
            {t("contentPages.backToLogin")}
          </Link>
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        {t("authLayout.copyright", { year: String(year) })}
      </footer>
    </div>
  );
}
