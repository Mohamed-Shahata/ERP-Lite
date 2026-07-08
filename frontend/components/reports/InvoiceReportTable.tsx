"use client";

import { useTranslations } from "@/lib/i18n/use-translations";
import type { InvoiceListItem, InvoiceStatus } from "@/types/invoice.types";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  PAID: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  UNPAID: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  PARTIALLY_PAID:
    "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
};

export function formatReportCurrency(amount: string | number, locale: string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EGP",
  }).format(num);
}

export function InvoiceReportTable({
  invoices,
}: {
  invoices: InvoiceListItem[];
}) {
  const { t, dateLocale } = useTranslations();

  if (invoices.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
        {t("reports.empty")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-160 text-start text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
          <tr>
            <th className="px-5 py-3 text-start font-semibold">
              {t("reports.columns.invoice")}
            </th>
            <th className="px-5 py-3 text-start font-semibold">
              {t("reports.columns.customer")}
            </th>
            <th className="px-5 py-3 text-start font-semibold">
              {t("reports.columns.amount")}
            </th>
            <th className="px-5 py-3 text-start font-semibold">
              {t("reports.columns.paid")}
            </th>
            <th className="px-5 py-3 text-start font-semibold">
              {t("reports.columns.remaining")}
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
          {invoices.map((invoice) => {
            const remaining =
              parseFloat(invoice.amount) - parseFloat(invoice.amountPaid);
            return (
              <tr key={invoice.id}>
                <td className="px-5 py-3 font-medium text-slate-950 dark:text-white">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                  {invoice.salesOrder.customer.name}
                </td>
                <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                  {formatReportCurrency(invoice.amount, dateLocale)}
                </td>
                <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                  {formatReportCurrency(invoice.amountPaid, dateLocale)}
                </td>
                <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                  {formatReportCurrency(remaining, dateLocale)}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[invoice.status]}`}
                  >
                    {t(`invoices.status.${invoice.status}`)}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                  {new Date(invoice.createdAt).toLocaleDateString(dateLocale)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
