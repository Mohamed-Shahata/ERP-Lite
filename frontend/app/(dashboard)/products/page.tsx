"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
import type { Category, Product } from "@/types/product.types";
import { Pagination, paginate } from "@/components/ui/Pagination";

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

export default function ProductsPage() {
  const { user } = useAuthStore();
  const { t } = useTranslations();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [productForm, setProductForm] =
    useState<CreateProductPayload>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productEditForm, setProductEditForm] =
    useState<CreateProductPayload>(emptyProductForm);

  const [productsPage, setProductsPage] = useState(1);
  const [productsPageSize, setProductsPageSize] = useState(10);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories]);

  async function loadAll() {
    setIsLoading(true);
    setError(null);
    try {
      const [categoriesData, productsData] = await Promise.all([
        listCategoriesRequest(),
        listProductsRequest(),
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("products.loadError"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      const created = await createProductRequest({
        ...productForm,
        sku: productForm.sku.trim(),
        name: productForm.name.trim(),
        description: productForm.description?.trim() || undefined,
        costPrice: Number(productForm.costPrice),
        sellPrice: Number(productForm.sellPrice),
        quantityInStock: Number(productForm.quantityInStock ?? 0),
        reorderLevel: Number(productForm.reorderLevel ?? 10),
      });
      setProducts((current) => [created, ...current]);
      setProductForm(emptyProductForm);
      setMessage(t("products.created"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("products.createError"),
      );
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
      const updated = await updateProductRequest(productId, {
        ...productEditForm,
        sku: productEditForm.sku.trim(),
        name: productEditForm.name.trim(),
        description: productEditForm.description?.trim() || undefined,
        costPrice: Number(productEditForm.costPrice),
        sellPrice: Number(productEditForm.sellPrice),
        quantityInStock: Number(productEditForm.quantityInStock ?? 0),
        reorderLevel: Number(productEditForm.reorderLevel ?? 10),
      });
      setProducts((current) =>
        current.map((product) =>
          product.id === productId ? updated : product,
        ),
      );
      setEditingProductId(null);
      setMessage(t("products.updated"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("products.updateError"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangeProductStatus(
    product: Product,
    isActive: boolean,
  ) {
    if (product.isActive === isActive) return;

    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateProductRequest(product.id, { isActive });
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? updated : item)),
      );
      setMessage(
        t("products.statusUpdated", {
          status: updated.isActive ? t("common.active") : t("common.inactive"),
        }),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("products.statusError"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    if (
      !window.confirm(t("products.confirmDelete", { name: product.name }))
    ) {
      return;
    }
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await deleteProductRequest(product.id);
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
      setMessage(t("products.deleted"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("products.deleteError"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-700">
          {t("common.inventory")}
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">
              {t("products.title")}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {t("products.summary", {
                count: products.length,
                categories: categories.length,
              })}
              {!canManage && t("common.readOnlyAccess")}
            </p>
          </div>
          <button
            onClick={() => void loadAll()}
            className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
            type="button"
          >
            {t("common.refresh")}
          </button>
        </div>
      </section>

      {(message || error) && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-950">
            {t("products.allProducts")}
          </h3>
        </div>

        {canManage && (
          <form
            onSubmit={handleCreateProduct}
            className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-2 lg:grid-cols-4"
          >
            <div>
              <label
                htmlFor="product-sku"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {t("products.sku")}
              </label>
              <input
                id="product-sku"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {t("products.productName")}
              </label>
              <input
                id="product-name"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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

            <div>
              <label
                htmlFor="product-category"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {t("products.category")}
              </label>
              <select
                id="product-category"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {t("common.description")}{" "}
                <span className="text-sm font-normal text-slate-400">
                  {t("common.optional")}
                </span>
              </label>
              <input
                id="product-description"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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

            <div>
              <label
                htmlFor="product-cost-price"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {t("products.costPrice")}{" "}
                <span className="text-sm font-normal text-slate-400">($)</span>
              </label>
              <input
                id="product-cost-price"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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

            <div>
              <label
                htmlFor="product-sell-price"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {t("products.sellPrice")}{" "}
                <span className="text-sm font-normal text-slate-400">($)</span>
              </label>
              <input
                id="product-sell-price"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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

            <div>
              <label
                htmlFor="product-quantity"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {t("products.quantityInStock")}
              </label>
              <input
                id="product-quantity"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                min={0}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    quantityInStock: Number(event.target.value),
                  }))
                }
                placeholder="0"
                type="number"
                value={productForm.quantityInStock}
              />
            </div>

            <div>
              <label
                htmlFor="product-reorder"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {t("products.reorderLevel")}
              </label>
              <input
                id="product-reorder"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                min={0}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    reorderLevel: Number(event.target.value),
                  }))
                }
                placeholder="0"
                type="number"
                value={productForm.reorderLevel}
              />
            </div>

            <div>
              <label
                htmlFor="product-status"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {t("common.status")}
              </label>
              <select
                id="product-status"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    isActive: event.target.value === "active",
                  }))
                }
                value={productForm.isActive ? "active" : "inactive"}
              >
                <option value="active">{t("common.active")}</option>
                <option value="inactive">{t("common.inactive")}</option>
              </select>
            </div>

            <button
              className="h-10 rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 lg:col-span-4"
              disabled={isSaving}
              type="submit"
            >
              {t("products.addProduct")}
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="p-5 text-sm text-slate-500">{t("products.loading")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-260 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">{t("products.product")}</th>
                  <th className="px-5 py-3 font-semibold">{t("products.category")}</th>
                  <th className="px-5 py-3 font-semibold">{t("products.cost")}</th>
                  <th className="px-5 py-3 font-semibold">{t("products.sell")}</th>
                  <th className="px-5 py-3 font-semibold">{t("products.stock")}</th>
                  <th className="px-5 py-3 font-semibold">{t("common.status")}</th>
                  {canManage && (
                    <th className="px-5 py-3 text-right font-semibold">
                      {t("common.actions")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginate(products, productsPage, productsPageSize).map(
                  (product) => {
                    const isEditing = editingProductId === product.id;
                    return (
                      <tr key={product.id} className="align-top">
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <div className="grid gap-2">
                              <div>
                                <label
                                  htmlFor={`edit-product-sku-${product.id}`}
                                  className="mb-1 block text-xs font-medium text-slate-600"
                                >
                                  {t("products.sku")}
                                </label>
                                <input
                                  id={`edit-product-sku-${product.id}`}
                                  className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                                  onChange={(event) =>
                                    setProductEditForm((current) => ({
                                      ...current,
                                      sku: event.target.value,
                                    }))
                                  }
                                  placeholder={t("products.placeholders.sku")}
                                  value={productEditForm.sku}
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor={`edit-product-name-${product.id}`}
                                  className="mb-1 block text-xs font-medium text-slate-600"
                                >
                                  {t("common.name")}
                                </label>
                                <input
                                  id={`edit-product-name-${product.id}`}
                                  className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium text-slate-950">
                                {product.name}
                              </p>
                              <p className="mt-1 text-slate-500">
                                {product.sku}
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <div>
                              <label
                                htmlFor={`edit-product-category-${product.id}`}
                                className="mb-1 block text-xs font-medium text-slate-600"
                              >
                                {t("products.category")}
                              </label>
                              <select
                                id={`edit-product-category-${product.id}`}
                                className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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
                            </div>
                          ) : (
                            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                              {categoryNameById.get(product.categoryId) ??
                                product.category?.name}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <div>
                              <label
                                htmlFor={`edit-product-cost-${product.id}`}
                                className="mb-1 block text-xs font-medium text-slate-600"
                              >
                                {t("products.cost")}
                              </label>
                              <input
                                id={`edit-product-cost-${product.id}`}
                                className="h-9 w-24 rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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
                            </div>
                          ) : (
                            `$${Number(product.costPrice).toFixed(2)}`
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <div>
                              <label
                                htmlFor={`edit-product-sell-${product.id}`}
                                className="mb-1 block text-xs font-medium text-slate-600"
                              >
                                {t("products.sell")}
                              </label>
                              <input
                                id={`edit-product-sell-${product.id}`}
                                className="h-9 w-24 rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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
                            </div>
                          ) : (
                            `$${Number(product.sellPrice).toFixed(2)}`
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <div>
                              <label
                                htmlFor={`edit-product-stock-${product.id}`}
                                className="mb-1 block text-xs font-medium text-slate-600"
                              >
                                {t("products.stock")}
                              </label>
                              <input
                                id={`edit-product-stock-${product.id}`}
                                className="h-9 w-20 rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                                min={0}
                                onChange={(event) =>
                                  setProductEditForm((current) => ({
                                    ...current,
                                    quantityInStock: Number(event.target.value),
                                  }))
                                }
                                type="number"
                                value={productEditForm.quantityInStock}
                              />
                            </div>
                          ) : (
                            <span
                              className={
                                product.quantityInStock <= product.reorderLevel
                                  ? "font-medium text-amber-600"
                                  : ""
                              }
                            >
                              {product.quantityInStock}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <div>
                              <label
                                htmlFor={`edit-product-status-${product.id}`}
                                className="mb-1 block text-xs font-medium text-slate-600"
                              >
                                {t("common.status")}
                              </label>
                              <select
                                id={`edit-product-status-${product.id}`}
                                className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
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
                                <option value="active">{t("common.active")}</option>
                                <option value="inactive">{t("common.inactive")}</option>
                              </select>
                            </div>
                          ) : (
                            <select
                              className={`h-9 rounded-md border px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 ${
                                product.isActive
                                  ? "border-emerald-200 bg-emerald-50 font-medium text-emerald-700"
                                  : "border-slate-300 bg-slate-50 font-medium text-slate-500"
                              } ${!canManage ? "cursor-default opacity-80" : ""}`}
                              disabled={!canManage || isSaving}
                              onChange={(event) =>
                                void handleChangeProductStatus(
                                  product,
                                  event.target.value === "active",
                                )
                              }
                              value={product.isActive ? "active" : "inactive"}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          )}
                        </td>
                        {canManage && (
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    className="h-9 rounded-md bg-slate-950 px-3 text-xs font-medium text-white hover:bg-slate-800 disabled:bg-slate-400"
                                    disabled={isSaving}
                                    onClick={() =>
                                      void handleUpdateProduct(product.id)
                                    }
                                    type="button"
                                  >
                                    {t("common.save")}
                                  </button>
                                  <button
                                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                    onClick={() => setEditingProductId(null)}
                                    type="button"
                                  >
                                    {t("common.cancel")}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                    onClick={() => startEditProduct(product)}
                                    type="button"
                                  >
                                    {t("common.edit")}
                                  </button>
                                  <button
                                    className="h-9 rounded-md border border-red-200 bg-white px-3 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                                    disabled={isSaving}
                                    onClick={() =>
                                      void handleDeleteProduct(product)
                                    }
                                    type="button"
                                  >
                                    {t("common.delete")}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  },
                )}
                {products.length === 0 && (
                  <tr>
                    <td
                      className="px-5 py-6 text-center text-slate-500"
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
              totalItems={products.length}
              onPageChange={setProductsPage}
              onPageSizeChange={setProductsPageSize}
              itemLabel={t("products.itemLabel")}
            />
          </div>
        )}
      </section>
    </div>
  );
}
