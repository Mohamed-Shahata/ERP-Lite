"use client";

import { FormEvent, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomerRequest,
  deleteCustomerRequest,
  listCustomersRequest,
  updateCustomerRequest,
} from "@/lib/api/customers.api";
import { Pagination } from "@/components/ui/Pagination";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { Customer } from "@/types/customer.types";

const emptyCustomerForm = {
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

export default function CustomersPage() {
  const { t } = useTranslations();
  // Customers: ADMIN, MANAGER, and EMPLOYEE all get full CRUD.
  const canManage = true;
  const canDelete = true;

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(
    null,
  );
  const [customerEditForm, setCustomerEditForm] = useState(emptyCustomerForm);

  const [customersPage, setCustomersPage] = useState(1);
  const [customersPageSize, setCustomersPageSize] = useState(10);

  const queryClient = useQueryClient();
  const {
    data: customersResult,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ["customers", customersPage, customersPageSize],
    queryFn: () =>
      listCustomersRequest({ page: customersPage, limit: customersPageSize }),
  });
  const customers = customersResult?.data ?? [];
  const totalCustomers = customersResult?.meta.total ?? 0;
  const displayError = error ?? (loadError ? t("customers.loadError") : null);

  function invalidateCustomers() {
    return queryClient.invalidateQueries({ queryKey: ["customers"] });
  }

  const visibleCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const term = searchTerm.trim().toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        (customer.email ?? "").toLowerCase().includes(term) ||
        (customer.phone ?? "").toLowerCase().includes(term),
    );
  }, [customers, searchTerm]);

  async function handleCreateCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await createCustomerRequest({
        name: customerForm.name.trim(),
        email: customerForm.email.trim() || undefined,
        phone: customerForm.phone.trim() || undefined,
        address: customerForm.address.trim() || undefined,
      });
      setCustomerForm(emptyCustomerForm);
      setMessage(t("customers.created"));
      await invalidateCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("customers.createError"));
    } finally {
      setIsSaving(false);
    }
  }

  function startEditCustomer(customer: Customer) {
    setEditingCustomerId(customer.id);
    setCustomerEditForm({
      name: customer.name,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      address: customer.address ?? "",
    });
    setMessage(null);
    setError(null);
  }

  async function handleUpdateCustomer(customerId: string) {
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateCustomerRequest(customerId, {
        name: customerEditForm.name.trim(),
        email: customerEditForm.email.trim() || undefined,
        phone: customerEditForm.phone.trim() || undefined,
        address: customerEditForm.address.trim() || undefined,
      });
      await invalidateCustomers();
      setEditingCustomerId(null);
      setMessage(t("customers.updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("customers.updateError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteCustomer(customer: Customer) {
    if (
      !window.confirm(t("customers.confirmDelete", { name: customer.name }))
    ) {
      return;
    }
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      await deleteCustomerRequest(customer.id);
      setMessage(t("customers.deleted"));
      await invalidateCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("customers.deleteError"));
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
          {t("customers.title")}
        </span>
      </p>

      {/* Header */}
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              {t("customers.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("customers.summary", { count: totalCustomers })}
              {!canManage && t("common.readOnlyAccess")}
            </p>
          </div>
          <button
            onClick={() => void invalidateCustomers()}
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
                {t("customers.addCustomer")}
              </h3>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="customer-name"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("common.name")}
                  </label>
                  <input
                    id="customer-name"
                    className={inputClass}
                    onChange={(event) =>
                      setCustomerForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder={t("customers.placeholders.name")}
                    required
                    value={customerForm.name}
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-email"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("common.email")}{" "}
                    <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
                      {t("common.optional")}
                    </span>
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    className={inputClass}
                    onChange={(event) =>
                      setCustomerForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder={t("customers.placeholders.email")}
                    value={customerForm.email}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="customer-phone"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("customers.phone")}{" "}
                    <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
                      {t("common.optional")}
                    </span>
                  </label>
                  <input
                    id="customer-phone"
                    className={inputClass}
                    dir="ltr"
                    onChange={(event) =>
                      setCustomerForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder={t("customers.placeholders.phone")}
                    type="tel"
                    value={customerForm.phone}
                  />
                </div>

                <div>
                  <label
                    htmlFor="customer-address"
                    className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {t("customers.address")}{" "}
                    <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
                      {t("common.optional")}
                    </span>
                  </label>
                  <input
                    id="customer-address"
                    className={inputClass}
                    onChange={(event) =>
                      setCustomerForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    placeholder={t("customers.placeholders.address")}
                    value={customerForm.address}
                  />
                </div>
              </div>

              <button
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving}
                type="submit"
              >
                <PlusIcon />
                {t("customers.addCustomer")}
              </button>
            </form>
          </section>
        )}

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
              {t("customers.allCustomers")}
            </h3>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-slate-400 dark:text-slate-500">
                <SearchIcon />
              </span>
              <input
                className="h-9 w-48 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 ps-9 pe-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:text-white"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("customers.searchPlaceholder")}
                value={searchTerm}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-5 text-sm text-slate-500 dark:text-slate-400">
              {t("customers.loading")}
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
                      {t("customers.phone")}
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      {t("customers.address")}
                    </th>
                    {canManage && (
                      <th className="px-5 py-3 text-right font-semibold">
                        {t("common.actions")}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {visibleCustomers.map((customer) => {
                    const isEditing = editingCustomerId === customer.id;
                    return (
                      <tr key={customer.id} className="align-top">
                        <td className="px-5 py-4">
                          {isEditing ? (
                            <input
                              className={smallInputClass}
                              onChange={(event) =>
                                setCustomerEditForm((current) => ({
                                  ...current,
                                  name: event.target.value,
                                }))
                              }
                              placeholder={t("customers.placeholders.name")}
                              value={customerEditForm.name}
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                              <p className="font-medium text-slate-950 dark:text-white">
                                {customer.name}
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                          {isEditing ? (
                            <input
                              className={smallInputClass}
                              onChange={(event) =>
                                setCustomerEditForm((current) => ({
                                  ...current,
                                  email: event.target.value,
                                }))
                              }
                              placeholder={t("customers.placeholders.email")}
                              type="email"
                              value={customerEditForm.email}
                            />
                          ) : (
                            (customer.email ?? "—")
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                          {isEditing ? (
                            <input
                              className={smallInputClass}
                              dir="ltr"
                              onChange={(event) =>
                                setCustomerEditForm((current) => ({
                                  ...current,
                                  phone: event.target.value,
                                }))
                              }
                              placeholder={t("customers.placeholders.phone")}
                              type="tel"
                              value={customerEditForm.phone}
                            />
                          ) : (
                            <span dir="ltr">{customer.phone ?? "—"}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                          {isEditing ? (
                            <input
                              className={smallInputClass}
                              onChange={(event) =>
                                setCustomerEditForm((current) => ({
                                  ...current,
                                  address: event.target.value,
                                }))
                              }
                              placeholder={t("customers.placeholders.address")}
                              value={customerEditForm.address}
                            />
                          ) : (
                            (customer.address ?? "—")
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
                                      void handleUpdateCustomer(customer.id)
                                    }
                                    type="button"
                                  >
                                    {t("common.save")}
                                  </button>
                                  <button
                                    className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    onClick={() => setEditingCustomerId(null)}
                                    type="button"
                                  >
                                    {t("common.cancel")}
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                    onClick={() => startEditCustomer(customer)}
                                    type="button"
                                    aria-label={t("common.edit")}
                                  >
                                    <PencilIcon />
                                  </button>
                                  {/* Only an admin can delete a customer — a
                                      manager can create/edit but never
                                      remove one. */}
                                  {canDelete && (
                                    <button
                                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                                      disabled={isSaving}
                                      onClick={() =>
                                        void handleDeleteCustomer(customer)
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
                  {visibleCustomers.length === 0 && (
                    <tr>
                      <td
                        className="px-5 py-6 text-center text-slate-500 dark:text-slate-400"
                        colSpan={canManage ? 5 : 4}
                      >
                        {t("customers.empty")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={customersPage}
                pageSize={customersPageSize}
                totalItems={totalCustomers}
                onPageChange={setCustomersPage}
                onPageSizeChange={setCustomersPageSize}
                itemLabel={t("customers.itemLabel")}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
