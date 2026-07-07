"use client";

import Link from "next/link";
import type { InvoiceListItem, InvoiceStatus } from "@/types/invoice.types";
import { useTranslations } from "@/lib/i18n/use-translations";
import { Pagination } from "@/components/ui/Pagination";

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

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useTranslations();

  const statusConfig: Record<
    InvoiceStatus,
    { bg: string; text: string; labelKey: string }
  > = {
    PAID: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-800 dark:text-green-200",
      labelKey: "invoices.statusPaid",
    },
    UNPAID: {
      bg: "bg-red-100 dark:bg-red-900",
      text: "text-red-800 dark:text-red-200",
      labelKey: "invoices.statusUnpaid",
    },
    PARTIALLY_PAID: {
      bg: "bg-yellow-100 dark:bg-yellow-900",
      text: "text-yellow-800 dark:text-yellow-200",
      labelKey: "invoices.statusPartiallyPaid",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      {t(config.labelKey)}
    </span>
  );
}

// Numbers are always formatted with Western (Latin) digits, regardless of
// language, by pinning the Unicode numbering-system extension ("-u-nu-latn").
// Without it, the "ar-EG" locale renders amounts using Arabic-Indic digits
// (٠١٢٣...), which is not what this app's design calls for.
function formatCurrency(amount: string | number, locale: string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const numericLocale = locale === "ar" ? "ar-EG-u-nu-latn" : "en-US";
  return new Intl.NumberFormat(numericLocale, {
    style: "currency",
    currency: "EGP",
  }).format(num);
}

function formatDate(value: string, locale: string) {
  const numericLocale = locale === "ar" ? "ar-EG-u-nu-latn" : "en-US";
  return new Date(value).toLocaleDateString(numericLocale);
}

export function InvoicesList({
  initialInvoices,
  meta,
  onPageChange,
}: InvoicesListProps) {
  const { t, locale } = useTranslations();

  return (
    <div className="space-y-6">
      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-50">
                {t("invoices.invoiceNumber")}
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-50">
                {t("invoices.customer")}
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-50">
                {t("invoices.amount")}
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-50">
                {t("invoices.amountPaid")}
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-50">
                {t("invoices.status")}
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-50">
                {t("invoices.createdAt")}
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-50">
                {t("invoices.actions")}
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
                  {t("invoices.noInvoices")}
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
                    {formatCurrency(invoice.amount, locale)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {formatCurrency(invoice.amountPaid, locale)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(invoice.createdAt, locale)}
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
      {onPageChange && (
        <Pagination
          currentPage={meta.page}
          pageSize={meta.limit}
          totalItems={meta.total}
          onPageChange={onPageChange}
          itemLabel={t("invoices.itemLabel")}
        />
      )}
    </div>
  );
}
