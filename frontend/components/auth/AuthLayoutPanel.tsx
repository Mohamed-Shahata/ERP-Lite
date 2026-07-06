"use client";

import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTranslations } from "@/lib/i18n/use-translations";

function HelpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.5 9.25a2.5 2.5 0 1 1 3.4 2.33c-.74.3-1.4.86-1.4 1.67v.5"
      />
      <path strokeLinecap="round" d="M12 17.25h.01" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-6 w-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 19v-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 19v-9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 10.5 10.5 6l3 3L20 4.5"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 4.5h4V8.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5 5 6v5.5c0 4.2 2.9 7.7 7 9 4.1-1.3 7-4.8 7-9V6l-7-2.5Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9.25 12 1.9 1.9 3.6-3.9"
      />
    </svg>
  );
}

export function AuthLayoutPanel({ children }: { children: React.ReactNode }) {
  const { t } = useTranslations();
  const year = new Date().getFullYear();

  const features = [
    {
      icon: <ChartIcon />,
      title: t("authLayout.featureAnalyticsTitle"),
      description: t("authLayout.featureAnalyticsDescription"),
    },
    {
      icon: <ShieldIcon />,
      title: t("authLayout.featureSecurityTitle"),
      description: t("authLayout.featureSecurityDescription"),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            EL
          </div>
          <span className="text-base font-semibold text-slate-950 dark:text-white">
            {t("shell.brand")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            title={t("authLayout.help")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <span className="sr-only">{t("authLayout.help")}</span>
            <HelpIcon />
          </button>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Form + blue feature panel */}
      <div className="grid flex-1 lg:grid-cols-2">
        <main className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">{children}</div>
        </main>

        <section className="relative hidden flex-col justify-center overflow-hidden bg-blue-700 px-12 py-12 text-white lg:flex">
          {/* Decorative shapes — solid blue tones only */}
          <div className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-blue-500/40 blur-3xl" />
          <div className="pointer-events-none absolute -start-16 bottom-0 h-64 w-64 rounded-full bg-blue-900/40 blur-3xl" />

          <div className="relative max-w-lg">
            <p className="text-sm font-medium text-blue-200">
              {t("authLayout.tagline")}
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight lg:text-4xl">
              {t("authLayout.headline")}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-blue-100">
              {t("authLayout.description")}
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl bg-white/10 p-5 backdrop-blur-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-white">
                    {feature.icon}
                  </div>
                  <p className="mt-3 text-sm font-semibold">{feature.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-blue-100">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:text-slate-400">
        <p>{t("authLayout.copyright", { year: String(year) })}</p>
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="transition-colors hover:text-slate-700 dark:hover:text-slate-200"
          >
            {t("authLayout.privacyPolicy")}
          </a>
          <a
            href="#"
            className="transition-colors hover:text-slate-700 dark:hover:text-slate-200"
          >
            {t("authLayout.termsOfUse")}
          </a>
          <a
            href="#"
            className="transition-colors hover:text-slate-700 dark:hover:text-slate-200"
          >
            {t("authLayout.support")}
          </a>
        </div>
      </footer>
    </div>
  );
}
