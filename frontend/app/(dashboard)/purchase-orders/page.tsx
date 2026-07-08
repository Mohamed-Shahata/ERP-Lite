"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { listProductsRequest } from "@/lib/api/products.api";
import {
  createPurchaseOrderRequest,
  listPurchaseOrdersRequest,
  type PurchaseOrderItemPayload,
} from "@/lib/api/purchase-orders.api";
import { listSuppliersRequest } from "@/lib/api/suppliers.api";
import { useAuthStore } from "@/lib/auth/auth-store";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useTranslations } from "@/lib/i18n/use-translations";
import { Pagination } from "@/components/ui/Pagination";
import { PurchaseOrderItemsForm } from "@/components/purchase-orders/PurchaseOrderItemsForm";
import { PurchaseOrderStatusBadge } from "@/components/purchase-orders/PurchaseOrderStatusBadge";
import type { Product } from "@/types/product.types";
import type { Supplier } from "@/types/supplier.types";
import type {
  PurchaseOrderListItem,
  PurchaseOrderStatus,
} from "@/types/purchase-order.types";

const emptyItem: PurchaseOrderItemPayload = {
  productId: "",
  quantity: 1,
  unitCost: 0,
};

const STATUS_FILTERS: Array<PurchaseOrderStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "RECEIVED",
  "CANCELLED",
];

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-4 w-4"
    >
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function PurchaseOrdersPage() {
  const { t, dateLocale } = useTranslations();
  const { user } = useAuthStore();
  // Purchasing actions (create/edit/cancel/delete/receive) are admin/manager
  // only; employees can view the list but not act on it.
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<PurchaseOrderListItem[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | "ALL">(
    "ALL",
  );
  const [isCreating, setIsCreating] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<PurchaseOrderItemPayload[]>([emptyItem]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function loadAll() {
    setIsLoading(true);
    setError(null);
    try {
      const [suppliersResult, productsResult, ordersResult] = await Promise.all(
        [
          listSuppliersRequest({ limit: 100 }),
          listProductsRequest({ limit: 100 }),
          listPurchaseOrdersRequest({
            page,
            limit: pageSize,
            status: statusFilter === "ALL" ? undefined : statusFilter,
          }),
        ],
      );
      setSuppliers(suppliersResult.data);
      setProducts(productsResult.data);
      setOrders(ordersResult.data);
      setTotalOrders(ordersResult.meta.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("purchaseOrders.loadError"),
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, statusFilter]);

  function openCreateForm() {
    setSupplierId("");
    setItems([emptyItem]);
    setIsCreating(true);
    setMessage(null);
    setError(null);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await createPurchaseOrderRequest({
        supplierId,
        items: items.filter((item) => item.productId),
      });
      setIsCreating(false);
      setMessage(t("purchaseOrders.createdSuccess"));
      setPage(1);
      await loadAll();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("purchaseOrders.createError"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        {t("common.dashboardHome")}
        <span className="mx-1.5">/</span>
        <span className="text-slate-600 dark:text-slate-300">
          {t("purchaseOrders.title")}
        </span>
      </p>

      {/* Header */}
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              {t("purchaseOrders.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("purchaseOrders.summary", { count: totalOrders })}
            </p>
          </div>
          {canManage && (
            <button
              className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
              onClick={openCreateForm}
              type="button"
            >
              <PlusIcon />
              {t("purchaseOrders.create")}
            </button>
          )}
        </div>
      </section>

      {(message || error) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
              : "border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {error ?? message}
        </div>
      )}

      {isCreating && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">
            {t("purchaseOrders.create")}
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="max-w-sm">
              <label
                htmlFor="po-supplier"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t("purchaseOrders.supplier")}
              </label>
              <SearchableSelect
                id="po-supplier"
                required
                options={suppliers.map((supplier) => ({
                  id: supplier.id,
                  label: supplier.name,
                }))}
                value={supplierId}
                onChange={setSupplierId}
                placeholder={t("purchaseOrders.selectSupplier")}
              />
            </div>

            <PurchaseOrderItemsForm
              products={products}
              items={items}
              onChange={setItems}
            />

            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isSaving || !supplierId}
                type="submit"
              >
                {t("common.create")}
              </button>
              <button
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={() => setIsCreating(false)}
                type="button"
              >
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-950 dark:text-white">
            {t("purchaseOrders.allOrders")}
          </h3>
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800/70">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                className={`rounded-md px-3 py-1 text-xs font-medium ${
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                type="button"
              >
                {status === "ALL"
                  ? t("common.all")
                  : t(`purchaseOrders.status.${status}`)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-5 text-sm text-slate-500 dark:text-slate-400">
            {t("purchaseOrders.loading")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">
                    {t("purchaseOrders.poNumber")}
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    {t("purchaseOrders.supplier")}
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    {t("common.status")}
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    {t("purchaseOrders.total")}
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    {t("purchaseOrders.created")}
                  </th>
                  <th className="px-5 py-3 text-right font-semibold">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-4 font-medium text-slate-950 dark:text-white">
                      {order.poNumber}
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                      {order.supplier.name}
                    </td>
                    <td className="px-5 py-4">
                      <PurchaseOrderStatusBadge
                        status={order.status}
                        label={t(`purchaseOrders.status.${order.status}`)}
                      />
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                      ${Number(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString(dateLocale)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                        href={`/purchase-orders/${order.id}`}
                      >
                        {t("common.view")}
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      className="px-5 py-6 text-center text-slate-500 dark:text-slate-400"
                      colSpan={6}
                    >
                      {t("purchaseOrders.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={totalOrders}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel={t("purchaseOrders.itemLabel")}
            />
          </div>
        )}
      </section>
    </div>
  );
}
