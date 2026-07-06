"use client";

import { useTranslations } from "@/lib/i18n/use-translations";

export default function DashboardPage() {
  const { t } = useTranslations();

  const metrics = [
    {
      label: t("dashboard.metrics.openSalesOrders"),
      value: "24",
      trend: t("dashboard.metrics.openSalesTrend"),
    },
    {
      label: t("dashboard.metrics.pendingPurchases"),
      value: "8",
      trend: t("dashboard.metrics.pendingPurchasesTrend"),
    },
    {
      label: t("dashboard.metrics.lowStockItems"),
      value: "15",
      trend: t("dashboard.metrics.lowStockTrend"),
    },
    {
      label: t("dashboard.metrics.unpaidInvoices"),
      value: "$18.4k",
      trend: t("dashboard.metrics.unpaidInvoicesTrend"),
    },
  ];

  const modules = [
    t("dashboard.modules.customers"),
    t("dashboard.modules.suppliers"),
    t("dashboard.modules.products"),
    t("dashboard.modules.salesOrders"),
    t("dashboard.modules.purchaseOrders"),
    t("dashboard.modules.invoices"),
    t("dashboard.modules.payments"),
    t("dashboard.modules.stockMovements"),
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-emerald-700">
            {t("dashboard.overview")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            {t("dashboard.title")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {t("dashboard.description")}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {metric.value}
            </p>
            <p className="mt-2 text-xs font-medium text-emerald-700">
              {metric.trend}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              {t("dashboard.modulesTitle")}
            </h2>
            <p className="text-sm text-slate-500">
              {t("dashboard.modulesSubtitle")}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => (
            <div
              key={module}
              className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
            >
              {module}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
