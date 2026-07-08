"use client";

import Link from "next/link";
import type { InvoiceListItem, InvoiceStatus } from "@/types/invoice.types";
import { useTranslations } from "@/lib/i18n/use-translations";

interface InvoicesListProps {
  initialInvoices: InvoiceListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  onPageChange?: (page: number) => void;
}

function StatusBadge({
  status,
  label,
}: {
  status: InvoiceStatus;
  label: string;
}) {
  const statusConfig: Record<InvoiceStatus, { bg: string; text: string }> = {
    PAID: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-800 dark:text-green-200",
    },
    UNPAID: {
      bg: "bg-red-100 dark:bg-red-900",
      text: "text-red-800 dark:text-red-200",
    },
    PARTIALLY_PAID: {
      bg: "bg-yellow-100 dark:bg-yellow-900",
      text: "text-yellow-800 dark:text-yellow-200",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      {label}
    </span>
  );
}

function formatCurrency(amount: string | number, dateLocale: string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(dateLocale, {
    style: "currency",
    currency: "EGP",
  }).format(num);
}

export function InvoicesList({
  initialInvoices,
  meta,
  onPageChange,
}: InvoicesListProps) {
  const { t, dateLocale } = useTranslations();

  return (
    <div className="space-y-6">
      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-50">
                {t("invoices.invoiceNumber")}
              </th>
              <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-50">
                {t("invoices.customer")}
              </th>
              <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-50">
                {t("invoices.amount")}
              </th>
              <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-50">
                {t("invoices.amountPaid")}
              </th>
              <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-50">
                {t("common.status")}
              </th>
              <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-50">
                {t("invoices.date")}
              </th>
              <th className="px-6 py-3 text-start text-sm font-semibold text-slate-900 dark:text-slate-50">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {initialInvoices.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  {t("invoices.empty")}
                </td>
              </tr>
            ) : (
              initialInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-50">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    <div>{invoice.salesOrder.customer.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      {invoice.salesOrder.orderNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {formatCurrency(invoice.amount, dateLocale)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {formatCurrency(invoice.amountPaid, dateLocale)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge
                      status={invoice.status}
                      label={t(`invoices.status.${invoice.status}`)}
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(invoice.createdAt).toLocaleDateString(dateLocale)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                    >
                      {t("invoices.viewDetails")}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange?.(meta.page - 1)}
            disabled={!meta.hasPreviousPage}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-900 text-sm font-medium transition-colors"
          >
            {t("invoices.previous")}
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => onPageChange?.(page)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    meta.page === page
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() => onPageChange?.(meta.page + 1)}
            disabled={!meta.hasNextPage}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-900 text-sm font-medium transition-colors"
          >
            {t("invoices.next")}
          </button>
        </div>
      )}
    </div>
  );
}
