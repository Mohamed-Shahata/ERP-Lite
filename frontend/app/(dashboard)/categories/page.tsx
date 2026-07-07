"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createCategoryRequest,
  deleteCategoryRequest,
  listCategoriesRequest,
  updateCategoryRequest,
} from "@/lib/api/categories.api";
import { Pagination } from "@/components/ui/Pagination";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { Category } from "@/types/product.types";

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

export default function CategoriesPage() {
  const { user } = useAuthStore();
  const { t } = useTranslations();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const visibleCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.trim().toLowerCase();
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(term) ||
        (category.description ?? "").toLowerCase().includes(term),
    );
  }, [categories, searchTerm]);

  async function loadCategories() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listCategoriesRequest({
        page: categoriesPage,
        limit: categoriesPageSize,
      });
      setCategories(result.data);
      setTotalCategories(result.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("categories.loadError"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesPage, categoriesPageSize]);

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await createCategoryRequest({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || undefined,
      });
      setCategoryForm({ name: "", description: "" });
      setMessage(t("categories.created"));
      await loadCategories();
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
      !window.confirm(t("categories.confirmDelete", { name: category.name }))
    ) {
      return;
    }
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await deleteCategoryRequest(category.id);
      setMessage(t("categories.deleted"));
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("categories.deleteError"),
      );
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
          {t("categories.title")}
        </span>
      </p>

      {/* Header */}
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              {t("categories.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("categories.summary", { count: totalCategories })}
              {!canManage && t("common.readOnlyAccess")}
            </p>
          </div>
          <button
            onClick={() => void loadCategories()}
            className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
            type="button"
          >
            <RefreshIcon />
            {t("common.refresh")}
          </button>
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

      <div className="space-y-6">
        {canManage && (
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                {t("categories.addCategory")}
              </h3>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="category-name"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("categories.categoryName")}
                  </label>
                  <input
                    id="category-name"
                    className={inputClass}
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
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("common.description")}{" "}
                    <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
                      {t("common.optional")}
                    </span>
                  </label>
                  <input
                    id="category-description"
                    className={inputClass}
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
              </div>

              <button
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving}
                type="submit"
              >
                <PlusIcon />
                {t("categories.addCategory")}
              </button>
            </form>
          </section>
        )}

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
              {t("categories.allCategories")}
            </h3>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 inset-s-3 flex items-center text-slate-400 dark:text-slate-500">
                <SearchIcon />
              </span>
              <input
                className="h-9 w-48 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 ps-9 pe-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("categories.searchPlaceholder")}
                value={searchTerm}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-5 text-sm text-slate-500 dark:text-slate-400">
              {t("categories.loading")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-160 text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">
                      {t("common.name")}
                    </th>
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
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {visibleCategories.map((category) => {
                    const isEditing = editingCategoryId === category.id;
                    return (
                      <tr key={category.id} className="align-top">
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <input
                              className={smallInputClass}
                              onChange={(event) =>
                                setCategoryEditForm((current) => ({
                                  ...current,
                                  name: event.target.value,
                                }))
                              }
                              placeholder={t("categories.placeholders.name")}
                              value={categoryEditForm.name}
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                {category.name.charAt(0).toUpperCase()}
                              </span>
                              <p className="font-medium text-slate-950 dark:text-white">
                                {category.name}
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                          {isEditing ? (
                            <input
                              className={smallInputClass}
                              onChange={(event) =>
                                setCategoryEditForm((current) => ({
                                  ...current,
                                  description: event.target.value,
                                }))
                              }
                              placeholder={t(
                                "categories.placeholders.description",
                              )}
                              value={categoryEditForm.description}
                            />
                          ) : (
                            (category.description ?? "—")
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {category._count?.products ?? 0}
                          </span>
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
                                      void handleUpdateCategory(category.id)
                                    }
                                    type="button"
                                  >
                                    {t("common.save")}
                                  </button>
                                  <button
                                    className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    onClick={() => setEditingCategoryId(null)}
                                    type="button"
                                  >
                                    {t("common.cancel")}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                    onClick={() => startEditCategory(category)}
                                    type="button"
                                    aria-label={t("common.edit")}
                                  >
                                    <PencilIcon />
                                  </button>
                                  <button
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={isSaving}
                                    onClick={() =>
                                      void handleDeleteCategory(category)
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
                  {visibleCategories.length === 0 && (
                    <tr>
                      <td
                        className="px-5 py-6 text-center text-slate-500 dark:text-slate-400"
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
                totalItems={totalCategories}
                onPageChange={setCategoriesPage}
                onPageSizeChange={setCategoriesPageSize}
                itemLabel={t("categories.itemLabel")}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
