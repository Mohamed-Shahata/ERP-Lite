"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";
import { getReportsSummaryRequest } from "@/lib/api/reports.api";
import { DateRangeFilter } from "@/components/reports/DateRangeFilter";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { formatReportCurrency } from "@/components/reports/InvoiceReportTable";
import { exportRowsToExcel, exportRowsToPdf } from "@/lib/utils/export";
import {
  SalesReportIcon,
  PurchaseReportIcon,
  InventoryReportIcon,
  PaymentReportIcon,
} from "@/components/reports/ReportIcons";
import type { ReportsSummary } from "@/types/report.types";

const CATEGORIES = [
  { key: "sales", href: "/reports/sales", Icon: SalesReportIcon },
  { key: "purchases", href: "/reports/purchases", Icon: PurchaseReportIcon },
  { key: "inventory", href: "/reports/inventory", Icon: InventoryReportIcon },
  { key: "payments", href: "/reports/payments", Icon: PaymentReportIcon },
] as const;

export default function ReportsPage() {
  const { t, dateLocale } = useTranslations();
  const [range, setRange] = useState({ from: "", to: "" });
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);
    getReportsSummaryRequest({
      from: range.from || undefined,
      to: range.to || undefined,
    })
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : t("reports.loadError"));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to]);

  const summaryCards = summary
    ? [
        {
          label: t("reports.summary.totalSales"),
          value: formatReportCurrency(summary.totalSales, dateLocale),
        },
        {
          label: t("reports.summary.totalPurchases"),
          value: formatReportCurrency(summary.totalPurchases, dateLocale),
        },
        {
          label: t("reports.summary.outstandingInvoices"),
          value: formatReportCurrency(summary.outstandingInvoices, dateLocale),
        },
        {
          label: t("reports.summary.lowStockProducts"),
          value: String(summary.lowStockCount),
        },
      ]
    : [];

  function handleExportPdf() {
    if (!summary) return;
    exportRowsToPdf(
      t("reports.title"),
      [
        {
          header: t("common.status"),
          accessor: (row: (typeof summaryCards)[number]) => row.label,
        },
        {
          header: t("reports.columns.total"),
          accessor: (row: (typeof summaryCards)[number]) => row.value,
        },
      ],
      summaryCards,
    );
  }

  function handleExportExcel() {
    if (!summary) return;
    exportRowsToExcel(
      "reports-summary",
      [
        {
          header: t("common.status"),
          accessor: (row: (typeof summaryCards)[number]) => row.label,
        },
        {
          header: t("reports.columns.total"),
          accessor: (row: (typeof summaryCards)[number]) => row.value,
        },
      ],
      summaryCards,
    );
  }

  const query =
    range.from || range.to ? `?from=${range.from}&to=${range.to}` : "";

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
            {t("reports.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("reports.description")}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DateRangeFilter
            from={range.from}
            to={range.to}
            onChange={setRange}
          />
          <ExportButtons
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
            disabled={!summary}
          />
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60"
              />
            ))
          : summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
                  {card.value}
                </p>
              </div>
            ))}
      </section>

      {/* Report Categories */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CATEGORIES.map(({ key, href, Icon }) => (
          <Link
            key={key}
            href={`${href}${query}`}
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Icon />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">
              {t(`reports.categories.${key}.title`)}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t(`reports.categories.${key}.description`)}
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
              {t("reports.viewReport")}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
