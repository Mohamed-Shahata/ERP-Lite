"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "@/lib/i18n/use-translations";
import { listPurchaseReportRequest } from "@/lib/api/reports.api";
import { listSuppliersRequest } from "@/lib/api/suppliers.api";
import { DateRangeFilter } from "@/components/reports/DateRangeFilter";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { formatReportCurrency } from "@/components/reports/InvoiceReportTable";
import { PurchaseOrderStatusBadge } from "@/components/purchase-orders/PurchaseOrderStatusBadge";
import { exportRowsToExcel, exportRowsToPdf } from "@/lib/utils/export";
import type {
  PurchaseOrderListItem,
  PurchaseOrderStatus,
} from "@/types/purchase-order.types";

const STATUSES: PurchaseOrderStatus[] = ["PENDING", "RECEIVED", "CANCELLED"];

const selectClass =
  "h-10 rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white";

export default function PurchaseReportPage() {
  const { t, dateLocale } = useTranslations();
  const searchParams = useSearchParams();

  const [range, setRange] = useState({
    from: searchParams.get("from") ?? "",
    to: searchParams.get("to") ?? "",
  });
  const [supplierId, setSupplierId] = useState("");
  const [status, setStatus] = useState<PurchaseOrderStatus | "">("");

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers", "all"],
    queryFn: () => listSuppliersRequest({ limit: 100 }).then((res) => res.data),
  });

  const {
    data: orders = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: [
      "reports",
      "purchases",
      range.from,
      range.to,
      supplierId,
      status,
    ],
    queryFn: () =>
      listPurchaseReportRequest({
        range: { from: range.from || undefined, to: range.to || undefined },
        supplierId: supplierId || undefined,
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
      header: t("reports.columns.poNumber"),
      accessor: (row: PurchaseOrderListItem) => row.poNumber,
    },
    {
      header: t("reports.columns.supplier"),
      accessor: (row: PurchaseOrderListItem) => row.supplier.name,
    },
    {
      header: t("reports.columns.total"),
      accessor: (row: PurchaseOrderListItem) =>
        formatReportCurrency(row.totalAmount, dateLocale),
    },
    {
      header: t("common.status"),
      accessor: (row: PurchaseOrderListItem) =>
        t(`purchaseOrders.status.${row.status}`),
    },
    {
      header: t("reports.columns.date"),
      accessor: (row: PurchaseOrderListItem) =>
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
          {t("reports.categories.purchases.title")}
        </span>
      </p>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
            {t("reports.categories.purchases.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("reports.categories.purchases.description")}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-2">
        <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
        <select
          className={selectClass}
          value={supplierId}
          onChange={(event) => setSupplierId(event.target.value)}
        >
          <option value="">{t("reports.allSuppliers")}</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as PurchaseOrderStatus | "")
          }
        >
          <option value="">{t("reports.allStatuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`purchaseOrders.status.${s}`)}
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
            disabled={orders.length === 0}
            onExportPdf={() =>
              exportRowsToPdf(
                t("reports.categories.purchases.title"),
                exportColumns,
                orders,
              )
            }
            onExportExcel={() =>
              exportRowsToExcel("purchase-report", exportColumns, orders)
            }
          />
        </div>

        {isLoading ? (
          <div className="p-5 text-sm text-slate-500 dark:text-slate-400">
            {t("reports.loading")}
          </div>
        ) : orders.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("reports.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-start text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 text-start font-semibold">
                    {t("reports.columns.poNumber")}
                  </th>
                  <th className="px-5 py-3 text-start font-semibold">
                    {t("reports.columns.supplier")}
                  </th>
                  <th className="px-5 py-3 text-start font-semibold">
                    {t("reports.columns.total")}
                  </th>
                  <th className="px-5 py-3 text-start font-semibold">
                    {t("common.status")}
                  </th>
                  <th className="px-5 py-3 text-start font-semibold">
                    {t("reports.columns.date")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-3 font-medium text-slate-950 dark:text-white">
                      {order.poNumber}
                    </td>
                    <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                      {order.supplier.name}
                    </td>
                    <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                      {formatReportCurrency(order.totalAmount, dateLocale)}
                    </td>
                    <td className="px-5 py-3">
                      <PurchaseOrderStatusBadge
                        status={order.status}
                        label={t(`purchaseOrders.status.${order.status}`)}
                      />
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString(dateLocale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
