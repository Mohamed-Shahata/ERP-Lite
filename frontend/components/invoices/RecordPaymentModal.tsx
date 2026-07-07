"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { PaymentMethod } from "@/lib/api/payments.api";

interface RecordPaymentModalProps {
  open: boolean;
  invoiceNumber: string;
  remainingBalance: number;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (amount: number, method: PaymentMethod) => void;
  onCancel: () => void;
}

const METHOD_OPTIONS: { value: PaymentMethod; labelKey: string }[] = [
  { value: "CASH", labelKey: "invoices.methodCash" },
  { value: "CARD", labelKey: "invoices.methodCard" },
  { value: "BANK_TRANSFER", labelKey: "invoices.methodBankTransfer" },
  { value: "OTHER", labelKey: "invoices.methodOther" },
];

export function RecordPaymentModal({
  open,
  invoiceNumber,
  remainingBalance,
  isSubmitting = false,
  error,
  onSubmit,
  onCancel,
}: RecordPaymentModalProps) {
  const { t } = useTranslations();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [formError, setFormError] = useState<string | null>(null);

  // Reset the form every time the modal is (re)opened.
  useEffect(() => {
    if (open) {
      setAmount(remainingBalance > 0 ? remainingBalance.toFixed(2) : "");
      setMethod("CASH");
      setFormError(null);
    }
  }, [open, remainingBalance]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const numericAmount = parseFloat(amount);

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setFormError(t("invoices.paymentAmountInvalid"));
      return;
    }

    if (numericAmount > remainingBalance) {
      setFormError(t("invoices.paymentExceedsBalance"));
      return;
    }

    setFormError(null);
    onSubmit(numericAmount, method);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-payment-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="record-payment-title"
          className="text-lg font-semibold text-slate-950 dark:text-white"
        >
          {t("invoices.recordPayment")}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {invoiceNumber}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="payment-amount"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t("invoices.amount")}
            </label>
            <input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0.01"
              max={remainingBalance || undefined}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              autoFocus
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              {t("invoices.remainingBalance")}: {remainingBalance.toFixed(2)}
            </p>
          </div>

          <div>
            <label
              htmlFor="payment-method"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t("invoices.paymentMethod")}
            </label>
            <select
              id="payment-method"
              value={method}
              onChange={(event) =>
                setMethod(event.target.value as PaymentMethod)
              }
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </div>

          {(formError || error) && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {formError ?? error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
