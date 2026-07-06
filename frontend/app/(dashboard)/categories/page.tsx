"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createCategoryRequest,
  deleteCategoryRequest,
  listCategoriesRequest,
  updateCategoryRequest,
} from "@/lib/api/categories.api";
import { Pagination, paginate } from "@/components/ui/Pagination";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { Category } from "@/types/product.types";

export default function CategoriesPage() {
  const { user } = useAuthStore();
  const { t } = useTranslations();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [categoryEditForm, setCategoryEditForm] = useState({
    name: "",
    description: "",
  });

  const [categoriesPage, setCategoriesPage] = useState(1);
  const [categoriesPageSize, setCategoriesPageSize] = useState(10);

  async function loadCategories() {
    setIsLoading(true);
    setError(null);
    try {
      setCategories(await listCategoriesRequest());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("categories.loadError"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      const created = await createCategoryRequest({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || undefined,
      });
      setCategories((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setCategoryForm({ name: "", description: "" });
      setMessage(t("categories.created"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("categories.createError"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  function startEditCategory(category: Category) {
    setEditingCategoryId(category.id);
    setCategoryEditForm({
      name: category.name,
      description: category.description ?? "",
    });
    setMessage(null);
    setError(null);
  }

  async function handleUpdateCategory(categoryId: string) {
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateCategoryRequest(categoryId, {
        name: categoryEditForm.name.trim(),
        description: categoryEditForm.description.trim() || undefined,
      });
      setCategories((current) =>
        current.map((category) =>
          category.id === categoryId ? { ...category, ...updated } : category,
        ),
      );
      setEditingCategoryId(null);
      setMessage(t("categories.updated"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("categories.updateError"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteCategory(category: Category) {
    if (
      !window.confirm(
        t("categories.confirmDelete", { name: category.name }),
      )
    ) {
      return;
    }
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await deleteCategoryRequest(category.id);
      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
      );
      setMessage(t("categories.deleted"));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("categories.deleteError"),
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
              {t("categories.title")}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {t("categories.summary", { count: categories.length })}
              {!canManage && t("common.readOnlyAccess")}
            </p>
          </div>
          <button
            onClick={() => void loadCategories()}
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
            {t("categories.allCategories")}
          </h3>
        </div>

        {canManage && (
          <form
            onSubmit={handleCreateCategory}
            className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-[1fr_2fr_auto]"
          >
            <div>
              <label
                htmlFor="category-name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {t("categories.categoryName")}
              </label>
              <input
                id="category-name"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder={t("categories.placeholders.name")}
                required
                value={categoryForm.name}
              />
            </div>

            <div>
              <label
                htmlFor="category-description"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                {t("common.description")}{" "}
                <span className="text-sm font-normal text-slate-400">
                  {t("common.optional")}
                </span>
              </label>
              <input
                id="category-description"
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder={t("categories.placeholders.description")}
                value={categoryForm.description}
              />
            </div>
            <div className="flex items-end">
              <button
                className="h-10 w-full rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isSaving}
                type="submit"
              >
                {t("categories.addCategory")}
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="p-5 text-sm text-slate-500">
            {t("categories.loading")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">{t("common.name")}</th>
                  <th className="px-5 py-3 font-semibold">
                    {t("common.description")}
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    {t("categories.products")}
                  </th>
                  {canManage && (
                    <th className="px-5 py-3 text-right font-semibold">
                      {t("common.actions")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginate(categories, categoriesPage, categoriesPageSize).map(
                  (category) => {
                  const isEditing = editingCategoryId === category.id;
                  return (
                    <tr key={category.id} className="align-top">
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <div>
                            <label
                              htmlFor={`edit-category-name-${category.id}`}
                              className="mb-1 block text-xs font-medium text-slate-600"
                            >
                              {t("common.name")}
                            </label>
                            <input
                              id={`edit-category-name-${category.id}`}
                              className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                              onChange={(event) =>
                                setCategoryEditForm((current) => ({
                                  ...current,
                                  name: event.target.value,
                                }))
                              }
                              value={categoryEditForm.name}
                            />
                          </div>
                        ) : (
                          <p className="font-medium text-slate-950">
                            {category.name}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {isEditing ? (
                          <div>
                            <label
                              htmlFor={`edit-category-desc-${category.id}`}
                              className="mb-1 block text-xs font-medium text-slate-600"
                            >
                              {t("common.description")}
                            </label>
                            <input
                              id={`edit-category-desc-${category.id}`}
                              className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                              onChange={(event) =>
                                setCategoryEditForm((current) => ({
                                  ...current,
                                  description: event.target.value,
                                }))
                              }
                              value={categoryEditForm.description}
                            />
                          </div>
                        ) : (
                          (category.description ?? "—")
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {category._count?.products ?? 0}
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
                                    void handleUpdateCategory(category.id)
                                  }
                                  type="button"
                                >
                                  {t("common.save")}
                                </button>
                                <button
                                  className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                  onClick={() => setEditingCategoryId(null)}
                                  type="button"
                                >
                                  {t("common.cancel")}
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                  onClick={() => startEditCategory(category)}
                                  type="button"
                                >
                                  {t("common.edit")}
                                </button>
                                <button
                                  className="h-9 rounded-md border border-red-200 bg-white px-3 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                                  disabled={isSaving}
                                  onClick={() =>
                                    void handleDeleteCategory(category)
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
                {categories.length === 0 && (
                  <tr>
                    <td
                      className="px-5 py-6 text-center text-slate-500"
                      colSpan={canManage ? 4 : 3}
                    >
                      {t("categories.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination
              currentPage={categoriesPage}
              pageSize={categoriesPageSize}
              totalItems={categories.length}
              onPageChange={setCategoriesPage}
              onPageSizeChange={setCategoriesPageSize}
              itemLabel={t("categories.itemLabel")}
            />
          </div>
        )}
      </section>
    </div>
  );
}
