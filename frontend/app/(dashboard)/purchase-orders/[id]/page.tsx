"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { listProductsRequest } from "@/lib/api/products.api";
import {
  cancelPurchaseOrderRequest,
  deletePurchaseOrderRequest,
  getPurchaseOrderRequest,
  receivePurchaseOrderRequest,
  updatePurchaseOrderRequest,
  type PurchaseOrderItemPayload,
} from "@/lib/api/purchase-orders.api";
import { listSuppliersRequest } from "@/lib/api/suppliers.api";
import { useTranslations } from "@/lib/i18n/use-translations";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PurchaseOrderItemsForm } from "@/components/purchase-orders/PurchaseOrderItemsForm";
import { PurchaseOrderStatusBadge } from "@/components/purchase-orders/PurchaseOrderStatusBadge";
import type { Product } from "@/types/product.types";
import type { Supplier } from "@/types/supplier.types";
import type { PurchaseOrderDetail } from "@/types/purchase-order.types";

export default function PurchaseOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, dateLocale } = useTranslations();

  const [order, setOrder] = useState<PurchaseOrderDetail | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editSupplierId, setEditSupplierId] = useState("");
  const [editItems, setEditItems] = useState<PurchaseOrderItemPayload[]>([]);

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);

  async function loadOrder() {
    setIsLoading(true);
    setError(null);
    try {
      const [suppliersResult, productsResult, orderResult] = await Promise.all([
        listSuppliersRequest({ limit: 100 }),
        listProductsRequest({ limit: 100 }),
        getPurchaseOrderRequest(params.id),
      ]);
      setSuppliers(suppliersResult.data);
      setProducts(productsResult.data);
      setOrder(orderResult);
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
    void loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  function startEdit() {
    if (!order) return;
    setEditSupplierId(order.supplierId);
    setEditItems(
      order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: Number(item.unitCost),
      })),
    );
    setIsEditing(true);
    setMessage(null);
    setError(null);
  }

  async function handleSaveEdit() {
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updatePurchaseOrderRequest(params.id, {
        supplierId: editSupplierId,
        items: editItems.filter((item) => item.productId),
      });
      setOrder(updated);
      setIsEditing(false);
      setMessage(t("purchaseOrders.updated"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("purchaseOrders.updateError"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancelOrder() {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await cancelPurchaseOrderRequest(params.id);
      setOrder(updated);
      setMessage(t("purchaseOrders.cancelled"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("purchaseOrders.cancelError"),
      );
    } finally {
      setIsSaving(false);
      setIsCancelDialogOpen(false);
    }
  }

  async function handleDeleteOrder() {
    setIsSaving(true);
    setError(null);
    try {
      await deletePurchaseOrderRequest(params.id);
      router.push("/purchase-orders");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("purchaseOrders.deleteError"),
      );
      setIsSaving(false);
      setIsDeleteDialogOpen(false);
    }
  }

  async function handleReceiveOrder() {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await receivePurchaseOrderRequest(params.id);
      setOrder(updated);
      setMessage(t("purchaseOrders.received"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("purchaseOrders.receiveError"),
      );
    } finally {
      setIsSaving(false);
      setIsReceiveDialogOpen(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("purchaseOrders.loading")}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl">
        <p className="text-sm text-red-600 dark:text-red-400">
          {error ?? t("purchaseOrders.notFound")}
        </p>
      </div>
    );
  }

  const isPending = order.status === "PENDING";

  return (
    <div className="max-w-4xl space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        {t("common.dashboardHome")}
        <span className="mx-1.5">/</span>
        <button
          className="hover:underline"
          onClick={() => router.push("/purchase-orders")}
          type="button"
        >
          {t("purchaseOrders.title")}
        </button>
        <span className="mx-1.5">/</span>
        <span className="text-slate-600 dark:text-slate-300">
          {order.poNumber}
        </span>
      </p>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
            {order.poNumber}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("purchaseOrders.createdBy", {
              name: order.createdBy.name,
              date: new Date(order.createdAt).toLocaleDateString(dateLocale),
            })}
          </p>
        </div>
        <PurchaseOrderStatusBadge
          status={order.status}
          label={t(`purchaseOrders.status.${order.status}`)}
        />
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

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h3 className="mb-3 text-base font-semibold text-slate-950 dark:text-white">
          {t("purchaseOrders.supplier")}
        </h3>
        {isEditing ? (
          <select
            className="h-10 w-full max-w-sm rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white"
            onChange={(event) => setEditSupplierId(event.target.value)}
            value={editSupplierId}
          >
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <p className="font-medium text-slate-950 dark:text-white">
              {order.supplier.name}
            </p>
            {order.supplier.email && <p>{order.supplier.email}</p>}
            {order.supplier.phone && <p>{order.supplier.phone}</p>}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h3 className="mb-3 text-base font-semibold text-slate-950 dark:text-white">
          {t("purchaseOrders.items")}
        </h3>

        {isEditing ? (
          <PurchaseOrderItemsForm
            products={products}
            items={editItems}
            onChange={setEditItems}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-140 text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-semibold">
                    {t("purchaseOrders.product")}
                  </th>
                  <th className="px-4 py-2 font-semibold">
                    {t("purchaseOrders.quantity")}
                  </th>
                  <th className="px-4 py-2 font-semibold">
                    {t("purchaseOrders.unitCost")}
                  </th>
                  <th className="px-4 py-2 font-semibold">
                    {t("purchaseOrders.lineTotal")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2">
                      <p className="font-medium text-slate-950 dark:text-white">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.product.sku}
                      </p>
                    </td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                      ${Number(item.unitCost).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                      ${(item.quantity * Number(item.unitCost)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-3 text-right text-sm font-semibold text-slate-950 dark:text-white">
          {t("purchaseOrders.total")}: ${Number(order.totalAmount).toFixed(2)}
        </p>
      </section>

      {isPending && (
        <section className="flex flex-wrap gap-3">
          {isEditing ? (
            <>
              <button
                className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isSaving}
                onClick={() => void handleSaveEdit()}
                type="button"
              >
                {t("common.save")}
              </button>
              <button
                className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setIsEditing(false)}
                type="button"
              >
                {t("common.cancel")}
              </button>
            </>
          ) : (
            <>
              {/* The big "Receive Order" action — the only thing that
                  actually moves inventory, guarded by its own confirmation
                  dialog listing exactly what will be added to stock. */}
              <button
                className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isSaving}
                onClick={() => setIsReceiveDialogOpen(true)}
                type="button"
              >
                {t("purchaseOrders.receiveOrder")}
              </button>
              <button
                className="h-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={startEdit}
                type="button"
              >
                {t("common.edit")}
              </button>
              <button
                className="h-11 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                onClick={() => setIsCancelDialogOpen(true)}
                type="button"
              >
                {t("purchaseOrders.cancelOrder")}
              </button>
              <button
                className="h-11 rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                onClick={() => setIsDeleteDialogOpen(true)}
                type="button"
              >
                {t("common.delete")}
              </button>
            </>
          )}
        </section>
      )}

      <ConfirmDialog
        open={isReceiveDialogOpen}
        title={t("purchaseOrders.receiveConfirmTitle")}
        message={t("purchaseOrders.receiveConfirmMessage", {
          items: order.items
            .map((item) => `${item.quantity} ${item.product.name}`)
            .join(", "),
        })}
        confirmLabel={t("purchaseOrders.receiveOrder")}
        cancelLabel={t("common.cancel")}
        onConfirm={() => void handleReceiveOrder()}
        onCancel={() => setIsReceiveDialogOpen(false)}
        isConfirming={isSaving}
      />

      <ConfirmDialog
        open={isCancelDialogOpen}
        title={t("purchaseOrders.cancelConfirmTitle")}
        message={t("purchaseOrders.cancelConfirmMessage", {
          poNumber: order.poNumber,
        })}
        confirmLabel={t("purchaseOrders.cancelOrder")}
        cancelLabel={t("common.cancel")}
        onConfirm={() => void handleCancelOrder()}
        onCancel={() => setIsCancelDialogOpen(false)}
        isConfirming={isSaving}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title={t("purchaseOrders.deleteConfirmTitle")}
        message={t("purchaseOrders.deleteConfirmMessage", {
          poNumber: order.poNumber,
        })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onConfirm={() => void handleDeleteOrder()}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isConfirming={isSaving}
      />
    </div>
  );
}
