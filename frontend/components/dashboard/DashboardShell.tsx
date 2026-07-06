"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logoutRequest, meRequest } from "@/lib/api/auth.api";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useTranslations } from "@/lib/i18n/use-translations";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Role } from "@/types/auth.types";

const navItems: Array<{
  href: string;
  labelKey: string;
  icon: string;
  /** Roles allowed to see this item. Omit to allow every authenticated role. */
  roles?: Role[];
}> = [
  { href: "/dashboard", labelKey: "nav.overview", icon: "O" },
  { href: "/products", labelKey: "nav.products", icon: "P" },
  { href: "/categories", labelKey: "nav.categories", icon: "C" },
  // Suppliers are commercial/purchasing data — admins and managers only.
  {
    href: "/suppliers",
    labelKey: "nav.suppliers",
    icon: "S",
    roles: ["ADMIN", "MANAGER"],
  },
  { href: "/settings/security", labelKey: "nav.security", icon: "S" },
  {
    href: "/settings/users",
    labelKey: "nav.users",
    icon: "U",
    roles: ["ADMIN"],
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { t } = useTranslations();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user) return;

    meRequest()
      .then(setUser)
      .catch(() => {
        setUser(null);
      });
  }, [setUser, user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutRequest();
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      setUser(null);
      router.replace("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <aside className="fixed inset-y-0 inset-s-0 hidden w-72 border-e border-slate-200 bg-white px-5 py-6 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            EL
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              {t("shell.brand")}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("shell.workspace")}
            </p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems
            .filter(
              (item) => !item.roles || (user && item.roles.includes(user.role)),
            )
            .map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium ${
                    active
                      ? "bg-slate-950 text-white dark:bg-emerald-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-xs">
                    {item.icon}
                  </span>
                  {t(item.labelKey)}
                </Link>
              );
            })}
        </nav>

        <div className="absolute bottom-6 inset-s-5 inset-e-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
            {user?.name ?? t("common.signedInUser")}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {user?.email ?? user?.role ?? t("common.activeSession")}
          </p>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="mt-4 h-9 w-full rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("shell.logout")}
          </button>
        </div>
      </aside>

      <div className="lg:ps-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("shell.brand")}
              </p>
              <h1 className="text-lg font-semibold text-slate-950 dark:text-white">
                {t("shell.controlCenter")}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LanguageSwitcher className="hidden lg:flex" />
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 lg:hidden"
              >
                {t("shell.logout")}
              </button>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>

      <ConfirmDialog
        open={isLogoutModalOpen}
        title={t("shell.logoutConfirmTitle")}
        message={t("shell.logoutConfirmMessage")}
        confirmLabel={t("shell.logoutConfirmAction")}
        cancelLabel={t("shell.logoutCancelAction")}
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        isConfirming={isLoggingOut}
      />
    </div>
  );
}
