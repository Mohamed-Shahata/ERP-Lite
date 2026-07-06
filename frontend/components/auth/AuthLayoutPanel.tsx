"use client";

import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTranslations } from "@/lib/i18n/use-translations";

export function AuthLayoutPanel({ children }: { children: React.ReactNode }) {
  const { t } = useTranslations();

  const features = [
    t("authLayout.roleGated"),
    t("authLayout.httpOnlyCookies"),
    t("authLayout.auditReady"),
  ];

  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden flex-col justify-between border-e border-white/10 bg-slate-900 px-10 py-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-slate-950">
            EL
          </div>
          <div>
            <p className="text-sm font-semibold">{t("shell.brand")}</p>
            <p className="text-xs text-slate-400">{t("authLayout.secureHub")}</p>
          </div>
        </div>
        <div className="max-w-xl">
          <p className="text-sm font-medium text-emerald-300">
            {t("authLayout.tagline")}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">
            {t("authLayout.headline")}
          </h1>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {features.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500">{t("authLayout.footer")}</p>
      </section>
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="mb-4 lg:hidden">
          <LanguageSwitcher />
        </div>
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/20">
          {children}
        </div>
      </main>
    </div>
  );
}
