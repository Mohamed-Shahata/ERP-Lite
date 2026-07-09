"use client";

import { useEffect, useState } from "react";
import { listProductsRequest } from "@/lib/api/products.api";
import {
  createStockAdjustmentRequest,
  listStockMovementsRequest,
  type StockMovementListParams,
} from "@/lib/api/stock-movements.api";
import { AdjustStockModal } from "@/components/stock-movements/AdjustStockModal";
import { Pagination } from "@/components/ui/Pagination";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { Product } from "@/types/product.types";
import type {
  MovementType,
  ReferenceType,
  StockMovement,
} from "@/types/stock-movement.types";

const TYPE_OPTIONS: Array<MovementType | "ALL"> = [
  "ALL",
  "IN",
  "OUT",
  "ADJUSTMENT",
];
const REFERENCE_OPTIONS: Array<ReferenceType | "ALL"> = [
  "ALL",
  "PURCHASE_ORDER",
  "SALES_ORDER",
  "MANUAL",
];

const TYPE_STYLES: Record<MovementType, string> = {
  IN: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  OUT: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  ADJUSTMENT:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
};

const selectClass =
  "h-10 rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white";

export default function StockMovementsPage() {
  const { t, dateLocale } = useTranslations();

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<MovementType | "ALL">("ALL");
  const [referenceType, setReferenceType] = useState<ReferenceType | "ALL">(
    "ALL",
  );
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isSubmittingAdjustment, setIsSubmittingAdjustment] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  function reloadProducts() {
    listProductsRequest({ page: 1, limit: 100 })
      .then((result) => setProducts(result.data))
      .catch(() => setProducts([]));
  }

  useEffect(() => {
    reloadProducts();
  }, []);

  async function handleCreateAdjustment(payload: {
    productId: string;
    quantity: number;
    note?: string;
  }) {
    setIsSubmittingAdjustment(true);
    setAdjustError(null);
    try {
      await createStockAdjustmentRequest(payload);
      setIsAdjustModalOpen(false);
      setReloadKey((key) => key + 1);
      reloadProducts();
    } catch (err) {
      setAdjustError(
        err instanceof Error ? err.message : t("stockMovements.adjustError"),
      );
    } finally {
      setIsSubmittingAdjustment(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const params: StockMovementListParams = { page, limit };
        if (productId) params.productId = productId;
        if (type !== "ALL") params.type = type;
        if (referenceType !== "ALL") params.referenceType = referenceType;
        if (from) params.from = from;
        if (to) params.to = to;

        const result = await listStockMovementsRequest(params);
        if (cancelled) return;
        setMovements(result.data);
        setTotal(result.meta.total);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : t("stockMovements.loadError"),
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    // t() from useTranslations() is a new reference every render; including
    // it here would re-trigger this effect on every render (infinite loop).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      cancelled = true;
    };
  }, [page, limit, productId, type, referenceType, from, to, reloadKey]);

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            {t("stockMovements.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("stockMovements.summary", { count: total })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAdjustError(null);
            setIsAdjustModalOpen(true);
          }}
          className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {t("stockMovements.adjustTitle")}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <select
          className={selectClass}
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value);
            resetPage();
          }}
        >
          <option value="">{t("stockMovements.allProducts")}</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={type}
          onChange={(e) => {
            setType(e.target.value as MovementType | "ALL");
            resetPage();
          }}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "ALL"
                ? t("stockMovements.allTypes")
                : t(`stockMovements.type.${opt}`)}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={referenceType}
          onChange={(e) => {
            setReferenceType(e.target.value as ReferenceType | "ALL");
            resetPage();
          }}
        >
          {REFERENCE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "ALL"
                ? t("stockMovements.allReferences")
                : t(`stockMovements.reference.${opt}`)}
            </option>
          ))}
        </select>

        <input
          type="date"
          className={selectClass}
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            resetPage();
          }}
        />
        <input
          type="date"
          className={selectClass}
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            resetPage();
          }}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="px-5 py-3 text-start font-medium">
                  {t("stockMovements.product")}
                </th>
                <th className="px-5 py-3 text-start font-medium">
                  {t("stockMovements.type_")}
                </th>
                <th className="px-5 py-3 text-start font-medium">
                  {t("stockMovements.quantity")}
                </th>
                <th className="px-5 py-3 text-start font-medium">
                  {t("stockMovements.reference_")}
                </th>
                <th className="px-5 py-3 text-start font-medium">
                  {t("stockMovements.createdBy")}
                </th>
                <th className="px-5 py-3 text-start font-medium">
                  {t("stockMovements.date")}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    {t("stockMovements.loading")}
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    {t("stockMovements.empty")}
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-slate-50 last:border-0 dark:border-slate-800/60"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {m.product.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {m.product.sku}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${TYPE_STYLES[m.type]}`}
                      >
                        {t(`stockMovements.type.${m.type}`)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {m.type === "OUT" ? "-" : "+"}
                      {m.quantity}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {t(`stockMovements.reference.${m.referenceType}`)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {m.createdBy.name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {new Date(m.createdAt).toLocaleString(dateLocale)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          pageSize={limit}
          totalItems={total}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
        />
      </div>

      <AdjustStockModal
        open={isAdjustModalOpen}
        products={products}
        isSubmitting={isSubmittingAdjustment}
        error={adjustError}
        onSubmit={handleCreateAdjustment}
        onCancel={() => setIsAdjustModalOpen(false)}
      />
    </div>
  );
}
