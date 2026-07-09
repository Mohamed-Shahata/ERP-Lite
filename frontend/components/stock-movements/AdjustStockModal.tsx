"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { Product } from "@/types/product.types";

interface AdjustStockModalProps {
  open: boolean;
  products: Product[];
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (payload: {
    productId: string;
    quantity: number;
    note?: string;
  }) => void;
  onCancel: () => void;
}

const inputClass =
  "h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

export function AdjustStockModal({
  open,
  products,
  isSubmitting = false,
  error,
  onSubmit,
  onCancel,
}: AdjustStockModalProps) {
  const { t } = useTranslations();
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Reset the form every time the modal is (re)opened.
  useEffect(() => {
    if (open) {
      setProductId(products[0]?.id ?? "");
      setQuantity("");
      setNote("");
      setFormError(null);
    }
  }, [open, products]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const selectedProduct = products.find((p) => p.id === productId);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!productId) {
      setFormError(t("stockMovements.adjustProductRequired"));
      return;
    }

    const numericQuantity = parseInt(quantity, 10);
    if (
      !quantity ||
      Number.isNaN(numericQuantity) ||
      numericQuantity === 0
    ) {
      setFormError(t("stockMovements.adjustQuantityInvalid"));
      return;
    }

    setFormError(null);
    onSubmit({
      productId,
      quantity: numericQuantity,
      note: note.trim() ? note.trim() : undefined,
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="adjust-stock-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="adjust-stock-title"
          className="text-lg font-semibold text-slate-950 dark:text-white"
        >
          {t("stockMovements.adjustTitle")}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {t("stockMovements.adjustSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="adjust-product"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t("stockMovements.product")}
            </label>
            <select
              id="adjust-product"
              className={inputClass}
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              autoFocus
            >
              <option value="" disabled>
                {t("stockMovements.allProducts")}
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
            {selectedProduct && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                {t("stockMovements.currentStock", {
                  count: selectedProduct.quantityInStock,
                })}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="adjust-quantity"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t("stockMovements.adjustQuantity")}
            </label>
            <input
              id="adjust-quantity"
              type="number"
              step="1"
              placeholder="+10 / -5"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              {t("stockMovements.adjustQuantityHint")}
            </p>
          </div>

          <div>
            <label
              htmlFor="adjust-note"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t("stockMovements.adjustNote")}
            </label>
            <input
              id="adjust-note"
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className={inputClass}
            />
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
              className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
