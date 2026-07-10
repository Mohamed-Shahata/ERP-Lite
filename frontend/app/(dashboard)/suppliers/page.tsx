"use client";

import { FormEvent, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSupplierRequest,
  deleteSupplierRequest,
  listSuppliersRequest,
  updateSupplierRequest,
} from "@/lib/api/suppliers.api";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { Supplier } from "@/types/supplier.types";

const emptySupplierForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

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

export default function SuppliersPage() {
  const { user } = useAuthStore();
  const { t, dateLocale } = useTranslations();
  // Managers and admins can view and manage suppliers; only an admin may
  // delete one (a manager can create/edit, but never remove a supplier).
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const canDelete = user?.role === "ADMIN";

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [supplierForm, setSupplierForm] = useState(emptySupplierForm);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(
    null,
  );
  const [supplierEditForm, setSupplierEditForm] = useState(emptySupplierForm);

  const [suppliersPage, setSuppliersPage] = useState(1);
  const [suppliersPageSize, setSuppliersPageSize] = useState(10);

  const queryClient = useQueryClient();
  const {
    data: suppliersResult,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ["suppliers", suppliersPage, suppliersPageSize],
    queryFn: () =>
      listSuppliersRequest({ page: suppliersPage, limit: suppliersPageSize }),
  });
  const suppliers = suppliersResult?.data ?? [];
  const totalSuppliers = suppliersResult?.meta.total ?? 0;
  const displayError = error ?? (loadError ? t("suppliers.loadError") : null);

  function invalidateSuppliers() {
    return queryClient.invalidateQueries({ queryKey: ["suppliers"] });
  }

  const visibleSuppliers = useMemo(() => {
    if (!searchTerm.trim()) return suppliers;
    const term = searchTerm.trim().toLowerCase();
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(term) ||
        (supplier.email ?? "").toLowerCase().includes(term) ||
        (supplier.phone ?? "").toLowerCase().includes(term),
    );
  }, [suppliers, searchTerm]);

  async function handleCreateSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await createSupplierRequest({
        name: supplierForm.name.trim(),
        email: supplierForm.email.trim() || undefined,
        phone: supplierForm.phone.trim() || undefined,
        address: supplierForm.address.trim() || undefined,
      });
      setSupplierForm(emptySupplierForm);
      setMessage(t("suppliers.created"));
      setIsCreateModalOpen(false);
      await invalidateSuppliers();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("suppliers.createError"));
    } finally {
      setIsSaving(false);
    }
  }

  function startEditSupplier(supplier: Supplier) {
    setEditingSupplierId(supplier.id);
    setSupplierEditForm({
      name: supplier.name,
      email: supplier.email ?? "",
      phone: supplier.phone ?? "",
      address: supplier.address ?? "",
    });
    setMessage(null);
    setError(null);
  }

  async function handleUpdateSupplier(supplierId: string) {
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateSupplierRequest(supplierId, {
        name: supplierEditForm.name.trim(),
        email: supplierEditForm.email.trim() || undefined,
        phone: supplierEditForm.phone.trim() || undefined,
        address: supplierEditForm.address.trim() || undefined,
      });
      await invalidateSuppliers();
      setEditingSupplierId(null);
      setMessage(t("suppliers.updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("suppliers.updateError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteSupplier(supplier: Supplier) {
    if (
      !window.confirm(t("suppliers.confirmDelete", { name: supplier.name }))
    ) {
      return;
    }
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await deleteSupplierRequest(supplier.id);
      setMessage(t("suppliers.deleted"));
      await invalidateSuppliers();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("suppliers.deleteError"));
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
          {t("suppliers.title")}
        </span>
      </p>

      {/* Header */}
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              {t("suppliers.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("suppliers.summary", {
                count: new Intl.NumberFormat(dateLocale).format(totalSuppliers),
              })}
              {!canManage && t("common.readOnlyAccess")}
            </p>
          </div>
          <button
            onClick={() => void invalidateSuppliers()}
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
          <Modal
            open={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title={t("suppliers.addSupplier")}
          >
            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="supplier-name"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("common.name")}
                  </label>
                  <input
                    id="supplier-name"
                    className={inputClass}
                    onChange={(event) =>
                      setSupplierForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder={t("suppliers.placeholders.name")}
                    required
                    value={supplierForm.name}
                  />
                </div>

                <div>
                  <label
                    htmlFor="supplier-email"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("common.email")}{" "}
                    <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
                      {t("common.optional")}
                    </span>
                  </label>
                  <input
                    id="supplier-email"
                    type="email"
                    className={inputClass}
                    onChange={(event) =>
                      setSupplierForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder={t("suppliers.placeholders.email")}
                    value={supplierForm.email}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="supplier-phone"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("suppliers.phone")}{" "}
                    <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
                      {t("common.optional")}
                    </span>
                  </label>
                  <input
                    id="supplier-phone"
                    className={inputClass}
                    dir="ltr"
                    type="tel"
                    onChange={(event) =>
                      setSupplierForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder={t("suppliers.placeholders.phone")}
                    value={supplierForm.phone}
                  />
                </div>

                <div>
                  <label
                    htmlFor="supplier-address"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("suppliers.address")}{" "}
                    <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
                      {t("common.optional")}
                    </span>
                  </label>
                  <input
                    id="supplier-address"
                    className={inputClass}
                    onChange={(event) =>
                      setSupplierForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    placeholder={t("suppliers.placeholders.address")}
                    value={supplierForm.address}
                  />
                </div>
              </div>

              <button
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving}
                type="submit"
              >
                <PlusIcon />
                {t("suppliers.addSupplier")}
              </button>
            </form>
          </Modal>
        )}

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
              {t("suppliers.allSuppliers")}
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-slate-400 dark:text-slate-500">
                  <SearchIcon />
                </span>
                <input
                  className="h-9 w-48 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 ps-9 pe-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t("suppliers.searchPlaceholder")}
                  value={searchTerm}
                />
              </div>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <PlusIcon />
                  {t("suppliers.addSupplier")}
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="p-5 text-sm text-slate-500 dark:text-slate-400">
              {t("suppliers.loading")}
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
                      {t("common.email")}
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      {t("suppliers.phone")}
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      {t("suppliers.address")}
                    </th>
                    {canManage && (
                      <th className="px-5 py-3 text-right font-semibold">
                        {t("common.actions")}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {visibleSuppliers.map((supplier) => {
                    const isEditing = editingSupplierId === supplier.id;
                    return (
                      <tr key={supplier.id} className="align-top">
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <input
                              className={smallInputClass}
                              onChange={(event) =>
                                setSupplierEditForm((current) => ({
                                  ...current,
                                  name: event.target.value,
                                }))
                              }
                              placeholder={t("suppliers.placeholders.name")}
                              value={supplierEditForm.name}
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                {supplier.name.charAt(0).toUpperCase()}
                              </span>
                              <p className="font-medium text-slate-950 dark:text-white">
                                {supplier.name}
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                          {isEditing ? (
                            <input
                              className={smallInputClass}
                              onChange={(event) =>
                                setSupplierEditForm((current) => ({
                                  ...current,
                                  email: event.target.value,
                                }))
                              }
                              placeholder={t("suppliers.placeholders.email")}
                              type="email"
                              value={supplierEditForm.email}
                            />
                          ) : (
                            (supplier.email ?? "—")
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                          {isEditing ? (
                            <input
                              className={smallInputClass}
                              dir="ltr"
                              type="tel"
                              onChange={(event) =>
                                setSupplierEditForm((current) => ({
                                  ...current,
                                  phone: event.target.value,
                                }))
                              }
                              placeholder={t("suppliers.placeholders.phone")}
                              value={supplierEditForm.phone}
                            />
                          ) : (
                            <span dir="ltr">{supplier.phone ?? "—"}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                          {isEditing ? (
                            <input
                              className={smallInputClass}
                              onChange={(event) =>
                                setSupplierEditForm((current) => ({
                                  ...current,
                                  address: event.target.value,
                                }))
                              }
                              placeholder={t("suppliers.placeholders.address")}
                              value={supplierEditForm.address}
                            />
                          ) : (
                            (supplier.address ?? "—")
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
                                      void handleUpdateSupplier(supplier.id)
                                    }
                                    type="button"
                                  >
                                    {t("common.save")}
                                  </button>
                                  <button
                                    className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    onClick={() => setEditingSupplierId(null)}
                                    type="button"
                                  >
                                    {t("common.cancel")}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                    onClick={() => startEditSupplier(supplier)}
                                    type="button"
                                    aria-label={t("common.edit")}
                                  >
                                    <PencilIcon />
                                  </button>
                                  {/* Only an admin can delete a supplier — a
                                      manager can create/edit but never
                                      remove one. */}
                                  {canDelete && (
                                    <button
                                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                                      disabled={isSaving}
                                      onClick={() =>
                                        void handleDeleteSupplier(supplier)
                                      }
                                      type="button"
                                      aria-label={t("common.delete")}
                                    >
                                      <TrashIcon />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {visibleSuppliers.length === 0 && (
                    <tr>
                      <td
                        className="px-5 py-6 text-center text-slate-500 dark:text-slate-400"
                        colSpan={canManage ? 5 : 4}
                      >
                        {t("suppliers.empty")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={suppliersPage}
                pageSize={suppliersPageSize}
                totalItems={totalSuppliers}
                onPageChange={setSuppliersPage}
                onPageSizeChange={setSuppliersPageSize}
                itemLabel={t("suppliers.itemLabel")}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
