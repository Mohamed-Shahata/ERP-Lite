"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createSupplierRequest,
  deleteSupplierRequest,
  listSuppliersRequest,
  updateSupplierRequest,
} from "@/lib/api/suppliers.api";
import { Pagination } from "@/components/ui/Pagination";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { Supplier } from "@/types/supplier.types";

const emptySupplierForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export default function SuppliersPage() {
  const { user } = useAuthStore();
  const { t } = useTranslations();
  // Managers and admins can view and manage suppliers; only an admin may
  // delete one (a manager can create/edit, but never remove a supplier).
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const canDelete = user?.role === "ADMIN";

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [supplierForm, setSupplierForm] = useState(emptySupplierForm);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(
    null,
  );
  const [supplierEditForm, setSupplierEditForm] = useState(emptySupplierForm);

  const [suppliersPage, setSuppliersPage] = useState(1);
  const [suppliersPageSize, setSuppliersPageSize] = useState(10);

  async function loadSuppliers() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listSuppliersRequest({
        page: suppliersPage,
        limit: suppliersPageSize,
      });
      setSuppliers(result.data);
      setTotalSuppliers(result.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("suppliers.loadError"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suppliersPage, suppliersPageSize]);

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
      await loadSuppliers();
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
      const updated = await updateSupplierRequest(supplierId, {
        name: supplierEditForm.name.trim(),
        email: supplierEditForm.email.trim() || undefined,
        phone: supplierEditForm.phone.trim() || undefined,
        address: supplierEditForm.address.trim() || undefined,
      });
      setSuppliers((current) =>
        current.map((supplier) =>
          supplier.id === supplierId ? { ...supplier, ...updated } : supplier,
        ),
      );
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
      await loadSuppliers();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("suppliers.deleteError"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <section>
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          {t("common.inventory")}
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
              {t("suppliers.title")}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t("suppliers.summary", { count: totalSuppliers })}
              {!canManage && t("common.readOnlyAccess")}
            </p>
          </div>
          <button
            onClick={() => void loadSuppliers()}
            className="h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="border-b border-slate-200 dark:border-slate-800 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-950 dark:text-white">
            {t("suppliers.allSuppliers")}
          </h3>
        </div>

        {canManage && (
          <form
            onSubmit={handleCreateSupplier}
            className="grid grid-cols-1 gap-4 border-b border-slate-200 dark:border-slate-800 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div>
              <label
                htmlFor="supplier-name"
                className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t("common.name")}
              </label>
              <input
                id="supplier-name"
                required
                className="h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm focus:border-slate-500 dark:focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-600 dark:bg-slate-900 dark:text-white"
                onChange={(event) =>
                  setSupplierForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder={t("suppliers.placeholders.name")}
                value={supplierForm.name}
              />
            </div>
            <div>
              <label
                htmlFor="supplier-email"
                className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t("common.email")}{" "}
                <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
                  {t("common.optional")}
                </span>
              </label>
              <input
                id="supplier-email"
                type="email"
                className="h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm focus:border-slate-500 dark:focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-600 dark:bg-slate-900 dark:text-white"
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
            <div>
              <label
                htmlFor="supplier-phone"
                className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t("suppliers.phone")}{" "}
                <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
                  {t("common.optional")}
                </span>
              </label>
              <input
                id="supplier-phone"
                className="h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm focus:border-slate-500 dark:focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-600 dark:bg-slate-900 dark:text-white"
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
                className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t("suppliers.address")}{" "}
                <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
                  {t("common.optional")}
                </span>
              </label>
              <input
                id="supplier-address"
                className="h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm focus:border-slate-500 dark:focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-600 dark:bg-slate-900 dark:text-white"
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
            <div className="lg:col-span-4">
              <button
                className="h-10 rounded-md bg-slate-950 dark:bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
                disabled={isSaving}
                type="submit"
              >
                {t("suppliers.addSupplier")}
              </button>
            </div>
          </form>
        )}

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
                {suppliers.map((supplier) => {
                  const isEditing = editingSupplierId === supplier.id;
                  return (
                    <tr key={supplier.id} className="align-top">
                      <td className="px-5 py-4">
                        {isEditing ? (
                          <div>
                            <label
                              htmlFor={`edit-supplier-name-${supplier.id}`}
                              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
                            >
                              {t("common.name")}
                            </label>
                            <input
                              id={`edit-supplier-name-${supplier.id}`}
                              className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm focus:border-slate-500 dark:focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-600 dark:bg-slate-900 dark:text-white"
                              onChange={(event) =>
                                setSupplierEditForm((current) => ({
                                  ...current,
                                  name: event.target.value,
                                }))
                              }
                              value={supplierEditForm.name}
                            />
                          </div>
                        ) : (
                          <p className="font-medium text-slate-950 dark:text-white">
                            {supplier.name}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                        {isEditing ? (
                          <div>
                            <label
                              htmlFor={`edit-supplier-email-${supplier.id}`}
                              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
                            >
                              {t("common.email")}
                            </label>
                            <input
                              id={`edit-supplier-email-${supplier.id}`}
                              type="email"
                              className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm focus:border-slate-500 dark:focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-600 dark:bg-slate-900 dark:text-white"
                              onChange={(event) =>
                                setSupplierEditForm((current) => ({
                                  ...current,
                                  email: event.target.value,
                                }))
                              }
                              value={supplierEditForm.email}
                            />
                          </div>
                        ) : (
                          (supplier.email ?? "—")
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                        {isEditing ? (
                          <div>
                            <label
                              htmlFor={`edit-supplier-phone-${supplier.id}`}
                              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
                            >
                              {t("suppliers.phone")}
                            </label>
                            <input
                              id={`edit-supplier-phone-${supplier.id}`}
                              className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm focus:border-slate-500 dark:focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-600 dark:bg-slate-900 dark:text-white"
                              onChange={(event) =>
                                setSupplierEditForm((current) => ({
                                  ...current,
                                  phone: event.target.value,
                                }))
                              }
                              value={supplierEditForm.phone}
                            />
                          </div>
                        ) : (
                          (supplier.phone ?? "—")
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                        {isEditing ? (
                          <div>
                            <label
                              htmlFor={`edit-supplier-address-${supplier.id}`}
                              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
                            >
                              {t("suppliers.address")}
                            </label>
                            <input
                              id={`edit-supplier-address-${supplier.id}`}
                              className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 text-sm focus:border-slate-500 dark:focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:focus:ring-slate-600 dark:bg-slate-900 dark:text-white"
                              onChange={(event) =>
                                setSupplierEditForm((current) => ({
                                  ...current,
                                  address: event.target.value,
                                }))
                              }
                              value={supplierEditForm.address}
                            />
                          </div>
                        ) : (
                          (supplier.address ?? "—")
                        )}
                      </td>
                      {canManage && (
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {isEditing ? (
                              <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                                  {t("common.actions")}
                                </label>

                                <div className="flex gap-2">
                                  <button
                                    className="h-9 rounded-md bg-slate-950 dark:bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-emerald-700 disabled:bg-slate-400 dark:disabled:bg-slate-700"
                                    disabled={isSaving}
                                    onClick={() =>
                                      void handleUpdateSupplier(supplier.id)
                                    }
                                    type="button"
                                  >
                                    {t("common.save")}
                                  </button>

                                  <button
                                    className="h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    onClick={() => setEditingSupplierId(null)}
                                    type="button"
                                  >
                                    {t("common.cancel")}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button
                                  className="h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  onClick={() => startEditSupplier(supplier)}
                                  type="button"
                                >
                                  {t("common.edit")}
                                </button>
                                {/* Only an admin can delete a supplier — a manager
                                    can create/edit but never remove one. */}
                                {canDelete && (
                                  <button
                                    className="h-9 rounded-md border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800"
                                    disabled={isSaving}
                                    onClick={() =>
                                      void handleDeleteSupplier(supplier)
                                    }
                                    type="button"
                                  >
                                    {t("common.delete")}
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
                {suppliers.length === 0 && (
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
  );
}
