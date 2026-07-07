"use client";

import { useState } from "react";
import Link from "next/link";
import type { InvoiceDetail, InvoiceStatus } from "@/types/invoice.types";
import { useTranslations } from "@/lib/i18n/use-translations";
import { getInvoiceRequest } from "@/lib/api/invoices.api";
import {
  createPaymentRequest,
  type PaymentMethod,
} from "@/lib/api/payments.api";
import { RecordPaymentModal } from "./RecordPaymentModal";

interface InvoiceDetailViewProps {
  invoice: InvoiceDetail;
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
      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}
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

// "BANK_TRANSFER" -> "BankTransfer", so it maps to the
// "invoices.methodBankTransfer" translation key.
function methodKeySuffix(method: string): string {
  return method
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function InvoiceDetailView({
  invoice: initialInvoice,
}: InvoiceDetailViewProps) {
  const { t, locale } = useTranslations();
  const [invoice, setInvoice] = useState(initialInvoice);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const remainingBalance =
    parseFloat(invoice.amount) - parseFloat(invoice.amountPaid);

  async function handleRecordPayment(amount: number, method: PaymentMethod) {
    setIsSubmittingPayment(true);
    setPaymentError(null);
    try {
      await createPaymentRequest({ invoiceId: invoice.id, amount, method });
      const updated = await getInvoiceRequest(invoice.id);
      setInvoice(updated);
      setIsPaymentModalOpen(false);
      setSuccessMessage(t("invoices.paymentSuccess"));
    } catch (err) {
      setPaymentError(
        err instanceof Error ? err.message : t("invoices.paymentError"),
      );
    } finally {
      setIsSubmittingPayment(false);
    }
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            {t("invoices.title")} #{invoice.invoiceNumber}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t("invoices.salesOrder")}: {invoice.salesOrder.orderNumber}
          </p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      {/* Invoice Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {t("invoices.totalAmount")}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
            {formatCurrency(invoice.amount, locale)}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {t("invoices.amountPaid")}
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {formatCurrency(invoice.amountPaid, locale)}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {t("invoices.remainingBalance")}
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
            {formatCurrency(remainingBalance, locale)}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {t("invoices.dueDate")}
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-50 mt-1">
            {formatDate(invoice.dueDate, locale)}
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
                {t("common.name")}
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-50">
                {invoice.salesOrder.customer.name}
              </div>
            </div>
            {invoice.salesOrder.customer.email && (
              <div>
                <div className="text-slate-600 dark:text-slate-400">
                  {t("common.email")}
                </div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  {invoice.salesOrder.customer.email}
                </div>
              </div>
            )}
            {invoice.salesOrder.customer.phone && (
              <div>
                <div className="text-slate-600 dark:text-slate-400">
                  {t("common.phone")}
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
                {t("invoices.createdAt")}
              </div>
              <div className="font-medium text-slate-900 dark:text-slate-50">
                {formatDate(invoice.createdAt, locale)}
              </div>
            </div>
            <div>
              <div className="text-slate-600 dark:text-slate-400">
                {t("invoices.payments")}
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
                <th className="text-right px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">
                  {t("invoices.products")}
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">
                  {t("products.sku")}
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">
                  {t("salesOrders.quantity")}
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">
                  {t("salesOrders.unitPrice")}
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">
                  {t("salesOrders.lineTotal")}
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
                    {formatCurrency(item.unitPrice, locale)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">
                    {formatCurrency(
                      parseFloat(item.unitPrice) * item.quantity,
                      locale,
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
            {t("invoices.payments")} ({invoice.payments.length})
          </h3>
          <div className="space-y-3">
            {invoice.payments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-50">
                    {formatCurrency(payment.amount, locale)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {t("invoices.paymentMethod")}:{" "}
                    {t(`invoices.method${methodKeySuffix(payment.method)}`)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {t("invoices.recordedBy")}: {payment.recordedBy.name}
                  </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(payment.paidAt, locale)}
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
          {t("invoices.backToList")}
        </Link>

        {invoice.status !== "PAID" && (
          <button
            type="button"
            onClick={() => {
              setPaymentError(null);
              setIsPaymentModalOpen(true);
            }}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            {t("invoices.recordPayment")}
          </button>
        )}
      </div>

      <RecordPaymentModal
        open={isPaymentModalOpen}
        invoiceNumber={invoice.invoiceNumber}
        remainingBalance={remainingBalance}
        isSubmitting={isSubmittingPayment}
        error={paymentError}
        onSubmit={(amount, method) => void handleRecordPayment(amount, method)}
        onCancel={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
}
