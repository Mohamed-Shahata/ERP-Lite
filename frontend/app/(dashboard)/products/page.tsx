"use client";

import { FormEvent, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listCategoriesRequest } from "@/lib/api/categories.api";
import {
  createProductRequest,
  deleteProductRequest,
  listProductsRequest,
  updateProductRequest,
  type CreateProductPayload,
} from "@/lib/api/products.api";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { Product } from "@/types/product.types";
import { Pagination } from "@/components/ui/Pagination";

const emptyProductForm: CreateProductPayload = {
  sku: "",
  name: "",
  description: "",
  categoryId: "",
  costPrice: 0,
  sellPrice: 0,
  quantityInStock: 0,
  reorderLevel: 10,
  isActive: true,
};

function formatCurrency(amount: string | number, dateLocale: string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(dateLocale, {
    style: "currency",
    currency: "EGP",
  }).format(num);
}

function RefreshIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 12a8.5 8.5 0 0 1 14.5-6M20.5 12a8.5 8.5 0 0 1-14.5 6"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 3v4h-4M6 21v-4h4"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-4 w-4"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path strokeLinecap="round" d="m20 20-3.5-3.5" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5h16M7 12h10M10 19h4"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.5 4.5 3 3L7 20H4v-3L16.5 4.5Z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m1 0-.7 12.1a2 2 0 0 1-2 1.9H9.7a2 2 0 0 1-2-1.9L7 7"
      />
    </svg>
  );
}

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

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {label}
    </span>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
        checked
          ? "justify-end bg-blue-600"
          : "justify-start bg-slate-300 dark:bg-slate-700"
      }`}
    >
      <span className="sr-only">{label}</span>
      <span className="h-[18px] w-[18px] rounded-full bg-white shadow" />
    </button>
  );
}

export default function ProductsPage() {
  const { user } = useAuthStore();
  const { t, dateLocale } = useTranslations();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [productForm, setProductForm] =
    useState<CreateProductPayload>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productEditForm, setProductEditForm] =
    useState<CreateProductPayload>(emptyProductForm);

  const [productsPage, setProductsPage] = useState(1);
  const [productsPageSize, setProductsPageSize] = useState(10);

  const queryClient = useQueryClient();

  const { data: categoriesResult } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => listCategoriesRequest({ limit: 100 }),
  });
  const categories = categoriesResult?.data ?? [];

  const {
    data: productsResult,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ["products", productsPage, productsPageSize],
    queryFn: () =>
      listProductsRequest({ page: productsPage, limit: productsPageSize }),
  });
  const products = productsResult?.data ?? [];
  const totalProducts = productsResult?.meta.total ?? 0;
  const displayError = error ?? (loadError ? t("products.loadError") : null);

  function invalidateProducts() {
    return queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories]);

  const visibleProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.trim().toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term),
    );
  }, [products, searchTerm]);

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await createProductRequest({
        ...productForm,
        sku: productForm.sku.trim(),
        name: productForm.name.trim(),
        description: productForm.description?.trim() || undefined,
        costPrice: Number(productForm.costPrice),
        sellPrice: Number(productForm.sellPrice),
        reorderLevel: Number(productForm.reorderLevel ?? 10),
      });
      setProductForm(emptyProductForm);
      setMessage(t("products.created"));
      await invalidateProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("products.createError"));
    } finally {
      setIsSaving(false);
    }
  }

  function startEditProduct(product: Product) {
    setEditingProductId(product.id);
    setProductEditForm({
      sku: product.sku,
      name: product.name,
      description: product.description ?? "",
      categoryId: product.categoryId,
      costPrice: Number(product.costPrice),
      sellPrice: Number(product.sellPrice),
      quantityInStock: product.quantityInStock,
      reorderLevel: product.reorderLevel,
      isActive: product.isActive,
    });
    setMessage(null);
    setError(null);
  }

  async function handleUpdateProduct(productId: string) {
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateProductRequest(productId, {
        ...productEditForm,
        sku: productEditForm.sku.trim(),
        name: productEditForm.name.trim(),
        description: productEditForm.description?.trim() || undefined,
        costPrice: Number(productEditForm.costPrice),
        sellPrice: Number(productEditForm.sellPrice),
        reorderLevel: Number(productEditForm.reorderLevel ?? 10),
      });
      await invalidateProducts();
      setEditingProductId(null);
      setMessage(t("products.updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("products.updateError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    if (!window.confirm(t("products.confirmDelete", { name: product.name }))) {
      return;
    }
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await deleteProductRequest(product.id);
      setMessage(t("products.deleted"));
      await invalidateProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("products.deleteError"));
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass =
    "h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white";
  const smallInputClass =
    "h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white";

  return (
    <div className="max-w-6xl space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        {t("common.dashboardHome")}
        <span className="mx-1.5">/</span>
        <span className="text-slate-600 dark:text-slate-300">
          {t("products.addNewProduct")}
        </span>
      </p>

      {/* Header */}
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              {t("products.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("products.summary", {
                count: totalProducts,
                categories: categories.length,
              })}
              {!canManage && t("common.readOnlyAccess")}
            </p>
          </div>
          <button
            onClick={() => void invalidateProducts()}
            className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
            type="button"
          >
            <RefreshIcon />
            {t("common.refresh")}
          </button>
        </div>
      </section>

      {(message || displayError) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            displayError
              ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
              : "border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {displayError ?? message}
        </div>
      )}

      <div className="space-y-6">
        {canManage && (
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                {t("products.addNewProduct")}
              </h3>
              <ToggleSwitch
                checked={productForm.isActive ?? true}
                onChange={(value) =>
                  setProductForm((current) => ({
                    ...current,
                    isActive: value,
                  }))
                }
                label={t("common.status")}
              />
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="product-sku"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("products.sku")}
                  </label>
                  <input
                    id="product-sku"
                    className={inputClass}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        sku: event.target.value,
                      }))
                    }
                    placeholder={t("products.placeholders.sku")}
                    required
                    value={productForm.sku}
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-name"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("products.productName")}
                  </label>
                  <input
                    id="product-name"
                    className={inputClass}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder={t("products.placeholders.name")}
                    required
                    value={productForm.name}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="product-category"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t("products.category")}
                </label>
                <select
                  id="product-category"
                  className={inputClass}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      categoryId: event.target.value,
                    }))
                  }
                  required
                  value={productForm.categoryId}
                >
                  <option value="" disabled>
                    {t("products.selectCategory")}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="product-description"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t("common.description")}{" "}
                  <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
                    {t("common.optional")}
                  </span>
                </label>
                <textarea
                  id="product-description"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white"
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder={t("products.placeholders.description")}
                  value={productForm.description ?? ""}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="product-reorder"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("products.reorderLevel")}
                  </label>
                  <input
                    id="product-reorder"
                    className={inputClass}
                    min={0}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        reorderLevel: Number(event.target.value),
                      }))
                    }
                    placeholder="10"
                    type="number"
                    value={productForm.reorderLevel}
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-sell-price"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("products.sellPrice")}
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-xs font-medium text-slate-400 dark:text-slate-500">
                      EGP
                    </span>
                    <input
                      id="product-sell-price"
                      className={`${inputClass} ps-12`}
                      min={0}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          sellPrice: Number(event.target.value),
                        }))
                      }
                      placeholder="0.00"
                      required
                      step="0.01"
                      type="number"
                      value={productForm.sellPrice}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="product-cost-price"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("products.costPrice")}
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-xs font-medium text-slate-400 dark:text-slate-500">
                      EGP
                    </span>
                    <input
                      id="product-cost-price"
                      className={`${inputClass} ps-12`}
                      min={0}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          costPrice: Number(event.target.value),
                        }))
                      }
                      placeholder="0.00"
                      required
                      step="0.01"
                      type="number"
                      value={productForm.costPrice}
                    />
                  </div>
                </div>
              </div>

              <button
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving}
                type="submit"
              >
                <PlusIcon />
                {t("products.addToInventory")}
              </button>
            </form>
          </section>
        )}

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
              {t("products.allProducts")}
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-slate-400 dark:text-slate-500">
                  <SearchIcon />
                </span>
                <input
                  className="h-9 w-48 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 ps-9 pe-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t("products.searchPlaceholder")}
                  value={searchTerm}
                />
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={t("common.actions")}
              >
                <FilterIcon />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-5 text-sm text-slate-500 dark:text-slate-400">
              {t("products.loading")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-260 text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">
                      {t("products.product")}
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      {t("products.category")}
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      {t("products.cost")}
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      {t("products.sell")}
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      {t("common.status")}
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      {t("products.stock")}
                    </th>
                    {canManage && (
                      <th className="px-5 py-3 text-right font-semibold">
                        {t("common.actions")}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {visibleProducts.map((product) => {
                    const isEditing = editingProductId === product.id;
                    return (
                      <tr key={product.id} className="align-top">
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <div className="grid gap-2">
                              <input
                                className={smallInputClass}
                                onChange={(event) =>
                                  setProductEditForm((current) => ({
                                    ...current,
                                    sku: event.target.value,
                                  }))
                                }
                                placeholder={t("products.placeholders.sku")}
                                value={productEditForm.sku}
                              />
                              <input
                                className={smallInputClass}
                                onChange={(event) =>
                                  setProductEditForm((current) => ({
                                    ...current,
                                    name: event.target.value,
                                  }))
                                }
                                placeholder={t("products.placeholders.name")}
                                value={productEditForm.name}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                {product.name.charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <p className="font-medium text-slate-950 dark:text-white">
                                  {product.name}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400">
                                  {product.sku}
                                </p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <select
                              className={smallInputClass}
                              onChange={(event) =>
                                setProductEditForm((current) => ({
                                  ...current,
                                  categoryId: event.target.value,
                                }))
                              }
                              value={productEditForm.categoryId}
                            >
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                              {categoryNameById.get(product.categoryId) ??
                                product.category?.name}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <input
                              className={`${smallInputClass} w-24`}
                              min={0}
                              onChange={(event) =>
                                setProductEditForm((current) => ({
                                  ...current,
                                  costPrice: Number(event.target.value),
                                }))
                              }
                              step="0.01"
                              type="number"
                              value={productEditForm.costPrice}
                            />
                          ) : (
                            formatCurrency(product.costPrice, dateLocale)
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <input
                              className={`${smallInputClass} w-24`}
                              min={0}
                              onChange={(event) =>
                                setProductEditForm((current) => ({
                                  ...current,
                                  sellPrice: Number(event.target.value),
                                }))
                              }
                              step="0.01"
                              type="number"
                              value={productEditForm.sellPrice}
                            />
                          ) : (
                            formatCurrency(product.sellPrice, dateLocale)
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <select
                              className={smallInputClass}
                              onChange={(event) =>
                                setProductEditForm((current) => ({
                                  ...current,
                                  isActive: event.target.value === "active",
                                }))
                              }
                              value={
                                productEditForm.isActive ? "active" : "inactive"
                              }
                            >
                              <option value="active">
                                {t("common.active")}
                              </option>
                              <option value="inactive">
                                {t("common.inactive")}
                              </option>
                            </select>
                          ) : (
                            <StatusPill
                              active={product.isActive}
                              label={
                                product.isActive
                                  ? t("common.active")
                                  : t("common.inactive")
                              }
                            />
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <input
                              className={`${smallInputClass} w-20 bg-slate-100 dark:bg-slate-800`}
                              type="number"
                              value={productEditForm.quantityInStock}
                              readOnly
                            />
                          ) : (
                            <span
                              className={`text-sm font-medium ${
                                product.quantityInStock <= product.reorderLevel
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {product.quantityInStock}
                            </span>
                          )}
                        </td>
                        {canManage && (
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 disabled:bg-slate-400"
                                    disabled={isSaving}
                                    onClick={() =>
                                      void handleUpdateProduct(product.id)
                                    }
                                    type="button"
                                  >
                                    {t("common.save")}
                                  </button>
                                  <button
                                    className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    onClick={() => setEditingProductId(null)}
                                    type="button"
                                  >
                                    {t("common.cancel")}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                    onClick={() => startEditProduct(product)}
                                    type="button"
                                    aria-label={t("common.edit")}
                                  >
                                    <PencilIcon />
                                  </button>
                                  <button
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={isSaving}
                                    onClick={() =>
                                      void handleDeleteProduct(product)
                                    }
                                    type="button"
                                    aria-label={t("common.delete")}
                                  >
                                    <TrashIcon />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {visibleProducts.length === 0 && (
                    <tr>
                      <td
                        className="px-5 py-6 text-center text-slate-500 dark:text-slate-400"
                        colSpan={canManage ? 7 : 6}
                      >
                        {t("products.empty")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={productsPage}
                pageSize={productsPageSize}
                totalItems={totalProducts}
                onPageChange={setProductsPage}
                onPageSizeChange={setProductsPageSize}
                itemLabel={t("products.itemLabel")}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
