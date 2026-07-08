"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";
import { listPaymentReportRequest } from "@/lib/api/reports.api";
import { DateRangeFilter } from "@/components/reports/DateRangeFilter";
import { ExportButtons } from "@/components/reports/ExportButtons";
import {
  InvoiceReportTable,
  formatReportCurrency,
} from "@/components/reports/InvoiceReportTable";
import { exportRowsToExcel, exportRowsToPdf } from "@/lib/utils/export";
import type { InvoiceListItem, InvoiceStatus } from "@/types/invoice.types";

const STATUSES: InvoiceStatus[] = ["UNPAID", "PARTIALLY_PAID", "PAID"];

const selectClass =
  "h-10 rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white";

export default function PaymentReportPage() {
  const { t, dateLocale } = useTranslations();
  const searchParams = useSearchParams();

  const [range, setRange] = useState({
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
  });
  const [status, setStatus] = useState<InvoiceStatus | "">("");

  const {
    data: invoices = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["reports", "payments", range.from, range.to, status],
    queryFn: () =>
      listPaymentReportRequest({
        range: { from: range.from || undefined, to: range.to || undefined },
        status: status || undefined,
      }),
  });
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : t("reports.loadError")
    : null;

  const exportColumns = [
    {
      header: t("reports.columns.invoice"),
      accessor: (row: InvoiceListItem) => row.invoiceNumber,
    },
    {
      header: t("reports.columns.customer"),
      accessor: (row: InvoiceListItem) => row.salesOrder.customer.name,
    },
    {
      header: t("reports.columns.amount"),
      accessor: (row: InvoiceListItem) =>
        formatReportCurrency(row.amount, dateLocale),
    },
    {
      header: t("reports.columns.paid"),
      accessor: (row: InvoiceListItem) =>
        formatReportCurrency(row.amountPaid, dateLocale),
    },
    {
      header: t("reports.columns.remaining"),
      accessor: (row: InvoiceListItem) =>
        formatReportCurrency(
          parseFloat(row.amount) - parseFloat(row.amountPaid),
          dateLocale,
        ),
    },
    {
      header: t("common.status"),
      accessor: (row: InvoiceListItem) => t(`invoices.status.${row.status}`),
    },
    {
      header: t("reports.columns.date"),
      accessor: (row: InvoiceListItem) =>
        new Date(row.createdAt).toLocaleDateString(dateLocale),
    },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        <Link href="/reports" className="hover:underline">
          {t("reports.title")}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-600 dark:text-slate-300">
          {t("reports.categories.payments.title")}
        </span>
      </p>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
            {t("reports.categories.payments.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("reports.categories.payments.description")}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-2">
        <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
        <select
          className={selectClass}
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as InvoiceStatus | "")
          }
        >
          <option value="">{t("reports.allStatuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`invoices.status.${s}`)}
            </option>
          ))}
        </select>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-end border-b border-slate-200 dark:border-slate-800 px-5 py-4">
          <ExportButtons
            disabled={invoices.length === 0}
            onExportPdf={() =>
              exportRowsToPdf(
                t("reports.categories.payments.title"),
                exportColumns,
                invoices,
              )
            }
            onExportExcel={() =>
              exportRowsToExcel("payment-report", exportColumns, invoices)
            }
          />
        </div>

        {isLoading ? (
          <div className="p-5 text-sm text-slate-500 dark:text-slate-400">
            {t("reports.loading")}
          </div>
        ) : (
          <InvoiceReportTable invoices={invoices} />
        )}
      </section>
    </div>
  );
}
