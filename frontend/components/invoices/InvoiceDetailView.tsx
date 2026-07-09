"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InvoiceDetail, InvoiceStatus } from "@/types/invoice.types";
import type { CompanySettings } from "@/types/company-settings.types";
import { getCompanySettingsRequest } from "@/lib/api/company-settings.api";
import {
  createPaymentRequest,
  type PaymentMethod,
} from "@/lib/api/payments.api";
import { useTranslations } from "@/lib/i18n/use-translations";
import { PrintableInvoice } from "./PrintableInvoice";
import { RecordPaymentModal } from "./RecordPaymentModal";

interface InvoiceDetailViewProps {
  invoice: InvoiceDetail;
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
      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}
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

export function InvoiceDetailView({ invoice }: InvoiceDetailViewProps) {
  const { t, dateLocale } = useTranslations();
  const queryClient = useQueryClient();
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const remainingBalance =
    parseFloat(invoice.amount) - parseFloat(invoice.amountPaid);

  const recordPayment = useMutation({
    mutationFn: (vars: { amount: number; method: PaymentMethod }) =>
      createPaymentRequest({
        invoiceId: invoice.id,
        amount: vars.amount,
        method: vars.method,
      }),
    onSuccess: () => {
      setIsPaymentModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["invoice", invoice.id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  useEffect(() => {
    getCompanySettingsRequest()
      .then(setCompany)
      .catch(() => setCompany(null));
  }, []);

  return (
    <>
      <div className="space-y-6 print:hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {t("invoices.invoiceTitle", { number: invoice.invoiceNumber })}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {t("invoices.salesOrderLabel", {
                number: invoice.salesOrder.orderNumber,
              })}
            </p>
          </div>
          <StatusBadge
            status={invoice.status}
            label={t(`invoices.status.${invoice.status}`)}
          />
        </div>

        {/* Invoice Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {t("invoices.totalAmount")}
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
              {formatCurrency(invoice.amount, dateLocale)}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {t("invoices.paidAmount")}
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {formatCurrency(invoice.amountPaid, dateLocale)}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {t("invoices.remainingBalance")}
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {formatCurrency(remainingBalance, dateLocale)}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {t("invoices.dueDate")}
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-50 mt-1">
              {new Date(invoice.dueDate).toLocaleDateString(dateLocale)}
            </div>
          </div>
        </div>

        {/* Customer & Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
              {t("invoices.customerInfo")}
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-slate-600 dark:text-slate-400">
                  {t("invoices.name")}
                </div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  {invoice.salesOrder.customer.name}
                </div>
              </div>
              {invoice.salesOrder.customer.email && (
                <div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {t("invoices.email")}
                  </div>
                  <div className="font-medium text-slate-900 dark:text-slate-50">
                    {invoice.salesOrder.customer.email}
                  </div>
                </div>
              )}
              {invoice.salesOrder.customer.phone && (
                <div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {t("invoices.phone")}
                  </div>
                  <div className="font-medium text-slate-900 dark:text-slate-50">
                    {invoice.salesOrder.customer.phone}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
              {t("invoices.invoiceDetails")}
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-slate-600 dark:text-slate-400">
                  {t("invoices.invoiceNumber")}
                </div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  {invoice.invoiceNumber}
                </div>
              </div>
              <div>
                <div className="text-slate-600 dark:text-slate-400">
                  {t("invoices.createdDate")}
                </div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  {new Date(invoice.createdAt).toLocaleDateString(dateLocale)}
                </div>
              </div>
              <div>
                <div className="text-slate-600 dark:text-slate-400">
                  {t("invoices.paymentsCount")}
                </div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  {invoice.payments.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
            {t("invoices.products")}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-start px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">
                    {t("invoices.product")}
                  </th>
                  <th className="text-start px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">
                    SKU
                  </th>
                  <th className="text-start px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">
                    {t("invoices.quantity")}
                  </th>
                  <th className="text-start px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">
                    {t("invoices.price")}
                  </th>
                  <th className="text-start px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">
                    {t("invoices.total")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {invoice.salesOrder.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-50">
                      {item.product.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {item.product.sku}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatCurrency(item.unitPrice, dateLocale)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">
                      {formatCurrency(
                        parseFloat(item.unitPrice) * item.quantity,
                        dateLocale,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments */}
        {invoice.payments.length > 0 && (
          <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
              {t("invoices.payments", { count: invoice.payments.length })}
            </h3>
            <div className="space-y-3">
              {invoice.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-50">
                      {formatCurrency(payment.amount, dateLocale)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {t("invoices.paymentMethod", { method: payment.method })}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {t("invoices.recordedBy", {
                        name: payment.recordedBy.name,
                      })}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(payment.paidAt).toLocaleDateString(dateLocale)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/invoices"
            className="px-6 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-50 font-medium transition-colors"
          >
            {t("invoices.backToInvoices")}
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            {t("invoices.printInvoice")}
          </button>
          {remainingBalance > 0 && (
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
            >
              {t("invoices.recordPayment")}
            </button>
          )}
        </div>
      </div>

      <RecordPaymentModal
        open={isPaymentModalOpen}
        invoiceNumber={invoice.invoiceNumber}
        remainingBalance={remainingBalance}
        isSubmitting={recordPayment.isPending}
        error={
          recordPayment.error instanceof Error
            ? recordPayment.error.message
            : null
        }
        onSubmit={(amount, method) => recordPayment.mutate({ amount, method })}
        onCancel={() => setIsPaymentModalOpen(false)}
      />

      <PrintableInvoice
        invoice={invoice}
        company={company}
        dateLocale={dateLocale}
      />
    </>
  );
}
