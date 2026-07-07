"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logoutRequest, meRequest } from "@/lib/api/auth.api";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useTranslations } from "@/lib/i18n/use-translations";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Role } from "@/types/auth.types";
import Image from "next/image";

function OverviewIcon() {
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
        d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-8.5Z"
      />
    </svg>
  );
}

function ProductsIcon() {
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
        d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16V8Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 8 12 12.5 20.5 8M12 12.5V20.5"
      />
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function SuppliersIcon() {
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
        d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"
      />
      <circle cx="7.5" cy="18" r="1.5" />
      <circle cx="17.5" cy="18" r="1.5" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <circle cx="9" cy="7.5" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 19.5a5.5 5.5 0 0 1 11 0"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 8a2.75 2.75 0 1 1 0 5.5M18.5 19.5a4.75 4.75 0 0 0-3.9-4.67"
      />
    </svg>
  );
}

function PurchaseOrdersIcon() {
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
        d="M7 3.5h10a1 1 0 0 1 1 1V20l-3-2-3 2-3-2-3 2V4.5a1 1 0 0 1 1-1Z"
      />
      <path strokeLinecap="round" d="M9 8h6M9 11.5h6M9 15h3" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5"
    >
      <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""} rtl:rotate-180 ${collapsed ? "rtl:rotate-0" : ""}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.5 5 8 12l6.5 7"
      />
    </svg>
  );
}

function SettingsIcon() {
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
        d="M10.3 3.9c.2-.8.9-1.4 1.7-1.4s1.5.6 1.7 1.4l.1.6c.9.3 1.7.8 2.4 1.4l.6-.2c.8-.3 1.7 0 2.1.7l.4.7c.4.7.2 1.6-.4 2.1l-.5.4c.1.5.1.9.1 1.4s0 .9-.1 1.4l.5.4c.6.5.8 1.4.4 2.1l-.4.7c-.4.7-1.3 1-2.1.7l-.6-.2c-.7.6-1.5 1.1-2.4 1.4l-.1.6c-.2.8-.9 1.4-1.7 1.4s-1.5-.6-1.7-1.4l-.1-.6c-.9-.3-1.7-.8-2.4-1.4l-.6.2c-.8.3-1.7 0-2.1-.7l-.4-.7c-.4-.7-.2-1.6.4-2.1l.5-.4c-.1-.5-.1-.9-.1-1.4s0-.9.1-1.4l-.5-.4c-.6-.5-.8-1.4-.4-2.1l.4-.7c.4-.7 1.3-1 2.1-.7l.6.2c.7-.6 1.5-1.1 2.4-1.4l.1-.6Z"
      />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

function LogoutIcon() {
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
        d="M9 4.5H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h3M15.5 8 20 12l-4.5 4M9.5 12H20"
      />
    </svg>
  );
}

const navItems: Array<{
  href: string;
  labelKey: string;
  icon: () => ReactNode;
  /** Roles allowed to see this item. Omit to allow every authenticated role. */
  roles?: Role[];
}> = [
  { href: "/dashboard", labelKey: "nav.overview", icon: OverviewIcon },
  { href: "/products", labelKey: "nav.products", icon: ProductsIcon },
  { href: "/categories", labelKey: "nav.categories", icon: CategoriesIcon },
  { href: "/customers", labelKey: "nav.customers", icon: CustomersIcon },
  // Suppliers are commercial/purchasing data — admins and managers only.
  {
    href: "/suppliers",
    labelKey: "nav.suppliers",
    icon: SuppliersIcon,
    roles: ["ADMIN", "MANAGER"],
  },
  // Purchasing is admin/manager territory end-to-end — employees can't
  // even view this module.
  {
    href: "/purchase-orders",
    labelKey: "nav.purchaseOrders",
    icon: PurchaseOrdersIcon,
    roles: ["ADMIN", "MANAGER"],
  },
  // Sales orders are core — available to all authenticated users.
  {
    href: "/sales-orders",
    labelKey: "nav.salesOrders",
    icon: PurchaseOrdersIcon,
  },
  {
    href: "/settings",
    labelKey: "nav.settings",
    icon: SettingsIcon,
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { t } = useTranslations();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Desktop: collapses the sidebar down to icons-only.
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile: fully opens/closes the sidebar as an off-canvas drawer.
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (user) return;

    meRequest()
      .then(setUser)
      .catch(() => {
        setUser(null);
      });
  }, [setUser, user]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileOpen(false);
  }, [pathname]);

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
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 inset-s-0 z-40 flex w-72 flex-col border-e border-slate-200 bg-white px-5 py-6 transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 lg:rtl:translate-x-0 ${
          isCollapsed ? "lg:w-20 lg:px-3" : "lg:w-72"
        } ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full rtl:translate-x-full"
        }`}
      >
        <div
          className={`flex items-center gap-3 ${isCollapsed ? "lg:justify-center" : ""}`}
        >
          <Image
            src="/erp-system-logo.png"
            alt="ERP Lite Logo"
            width={40}
            height={40}
          />
          <div className={isCollapsed ? "lg:hidden" : ""}>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              {t("shell.brand")}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("shell.workspace")}
            </p>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="ms-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            type="button"
            aria-label={t("shell.closeSidebar")}
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto">
          {navItems
            .filter(
              (item) => !item.roles || (user && item.roles.includes(user.role)),
            )
            .map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? t(item.labelKey) : undefined}
                  className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                    isCollapsed ? "lg:justify-center lg:px-0" : ""
                  } ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                    <Icon />
                  </span>
                  <span className={isCollapsed ? "lg:hidden" : ""}>
                    {t(item.labelKey)}
                  </span>
                </Link>
              );
            })}
        </nav>

        {/* Desktop-only collapse toggle */}
        <button
          onClick={() => setIsCollapsed((current) => !current)}
          className={`mb-3 hidden h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 lg:flex`}
          type="button"
        >
          <CollapseIcon collapsed={isCollapsed} />
          <span className={isCollapsed ? "lg:hidden" : ""}>
            {t("shell.collapseSidebar")}
          </span>
        </button>

        <div
          className={`rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 ${
            isCollapsed ? "lg:flex lg:flex-col lg:items-center lg:p-2" : ""
          }`}
        >
          <div className={isCollapsed ? "lg:hidden" : ""}>
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
              {user?.name ?? t("common.signedInUser")}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {user?.email ?? user?.role ?? t("common.activeSession")}
            </p>
          </div>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            title={isCollapsed ? t("shell.logout") : undefined}
            className={`flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${
              isCollapsed ? "lg:mt-0 lg:w-9 lg:px-0" : "mt-4 w-full"
            }`}
          >
            <span className={isCollapsed ? "lg:hidden" : "hidden"}>
              <LogoutIcon />
            </span>
            <span className={isCollapsed ? "lg:hidden" : ""}>
              {t("shell.logout")}
            </span>
            <span className={isCollapsed ? "hidden lg:inline" : "hidden"}>
              <LogoutIcon />
            </span>
          </button>
        </div>
      </aside>

      <div
        className={`transition-all duration-200 ${isCollapsed ? "lg:ps-20" : "lg:ps-72"}`}
      >
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
                type="button"
                aria-label={t("shell.openSidebar")}
              >
                <MenuIcon />
              </button>
              <div className="hidden md:block">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t("shell.brand")}
                </p>
                <h1 className="text-lg font-semibold text-slate-950 dark:text-white">
                  {t("shell.controlCenter")}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LanguageSwitcher />
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 lg:hidden"
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
