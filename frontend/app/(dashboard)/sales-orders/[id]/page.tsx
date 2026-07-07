"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { listProductsRequest } from "@/lib/api/products.api";
import {
  cancelSalesOrderRequest,
  deleteSalesOrderRequest,
  getSalesOrderRequest,
  confirmSalesOrderRequest,
  updateSalesOrderRequest,
  type SalesOrderItemPayload,
} from "@/lib/api/sales-orders.api";
import { listCustomersRequest } from "@/lib/api/customers.api";
import { useTranslations } from "@/lib/i18n/use-translations";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SalesOrderItemsForm } from "@/components/sales-orders/SalesOrderItemsForm";
import { SalesOrderStatusBadge } from "@/components/sales-orders/SalesOrderStatusBadge";
import type { Product } from "@/types/product.types";
import type { Customer } from "@/types/customer.types";
import type { SalesOrderDetail } from "@/types/sales-order.types";

export default function SalesOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, dateLocale } = useTranslations();

  const [order, setOrder] = useState<SalesOrderDetail | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState("");
  const [editItems, setEditItems] = useState<SalesOrderItemPayload[]>([]);

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  async function loadOrder() {
    setIsLoading(true);
    setError(null);
    try {
      const [customersResult, productsResult, orderResult] = await Promise.all([
        listCustomersRequest({ limit: 100 }),
        listProductsRequest({ limit: 100 }),
        getSalesOrderRequest(params.id),
      ]);
      setCustomers(customersResult.data);
      setProducts(productsResult.data);
      setOrder(orderResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("salesOrders.loadError"));
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
    setEditCustomerId(order.customerId);
    setEditItems(
      order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
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
      const updated = await updateSalesOrderRequest(params.id, {
        customerId: editCustomerId,
        items: editItems.filter((i) => i.productId),
      });
      setOrder(updated);
      setIsEditing(false);
      setMessage(t("salesOrders.updated"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("salesOrders.updateError"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancelOrder() {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await cancelSalesOrderRequest(params.id);
      setOrder(updated);
      setMessage(t("salesOrders.cancelled"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("salesOrders.cancelError"),
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
      await deleteSalesOrderRequest(params.id);
      router.push("/sales-orders");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("salesOrders.deleteError"),
      );
      setIsSaving(false);
      setIsDeleteDialogOpen(false);
    }
  }

  async function handleConfirmOrder() {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await confirmSalesOrderRequest(params.id);
      setOrder(updated);
      setMessage(t("salesOrders.confirmed"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("salesOrders.confirmError"),
      );
    } finally {
      setIsSaving(false);
      setIsConfirmDialogOpen(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("salesOrders.loading")}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl">
        <p className="text-sm text-red-600 dark:text-red-400">
          {error ?? t("salesOrders.notFound")}
        </p>
      </div>
    );
  }

  const isDraft = order.status === "DRAFT";

  return (
    <div className="max-w-4xl space-y-6">
      <p className="text-xs text-slate-400 dark:text-slate-500">
        {t("common.dashboardHome")}
        <span className="mx-1.5">/</span>
        <button
          className="hover:underline"
          onClick={() => router.push("/sales-orders")}
          type="button"
        >
          {t("salesOrders.title")}
        </button>
        <span className="mx-1.5">/</span>
        <span className="text-slate-600 dark:text-slate-300">
          {order.orderNumber}
        </span>
      </p>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
            {order.orderNumber}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("salesOrders.createdBy", {
              name: order.createdBy.name,
              date: new Date(order.createdAt).toLocaleDateString(dateLocale),
            })}
          </p>
        </div>
        <SalesOrderStatusBadge
          status={order.status}
          label={t(`salesOrders.status.${order.status}`)}
        />
      </section>

      {(message || error) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400" : "border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"}`}
        >
          {error ?? message}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h3 className="mb-3 text-base font-semibold text-slate-950 dark:text-white">
          {t("salesOrders.customer")}
        </h3>
        {isEditing ? (
          <select
            className="h-10 w-full max-w-sm rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white"
            onChange={(e) => setEditCustomerId(e.target.value)}
            value={editCustomerId}
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <p className="font-medium text-slate-950 dark:text-white">
              {order.customer.name}
            </p>
            {order.customer.email && <p>{order.customer.email}</p>}
            {order.customer.phone && <p>{order.customer.phone}</p>}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h3 className="mb-3 text-base font-semibold text-slate-950 dark:text-white">
          {t("purchaseOrders.items")}
        </h3>

        {isEditing ? (
          <SalesOrderItemsForm
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
                    {t("salesOrders.unitPrice")}
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
                      ${Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                      ${(item.quantity * Number(item.unitPrice)).toFixed(2)}
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

      {isDraft && (
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
              <button
                className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isSaving}
                onClick={() => setIsConfirmDialogOpen(true)}
                type="button"
              >
                {t("salesOrders.confirmOrder")}
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
                {t("salesOrders.cancelOrder")}
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
        open={isConfirmDialogOpen}
        title={t("salesOrders.confirmConfirmTitle")}
        message={t("salesOrders.confirmConfirmMessage")}
        confirmLabel={t("salesOrders.confirmOrder")}
        cancelLabel={t("common.cancel")}
        onConfirm={() => void handleConfirmOrder()}
        onCancel={() => setIsConfirmDialogOpen(false)}
        isConfirming={isSaving}
      />

      <ConfirmDialog
        open={isCancelDialogOpen}
        title={t("salesOrders.cancelConfirmTitle")}
        message={t("salesOrders.cancelConfirmMessage", {
          orderNumber: order.orderNumber,
        })}
        confirmLabel={t("salesOrders.cancelOrder")}
        cancelLabel={t("common.cancel")}
        onConfirm={() => void handleCancelOrder()}
        onCancel={() => setIsCancelDialogOpen(false)}
        isConfirming={isSaving}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title={t("salesOrders.deleteConfirmTitle")}
        message={t("salesOrders.deleteConfirmMessage", {
          orderNumber: order.orderNumber,
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
