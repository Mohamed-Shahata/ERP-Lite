"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listInvoicesRequest } from "@/lib/api/invoices.api";
import type { InvoiceListItem, InvoiceStatus } from "@/types/invoice.types";
import { InvoicesList } from "@/components/invoices/InvoicesList";
import { useTranslations } from "@/lib/i18n/use-translations";

function isOverdueInvoice(invoice: InvoiceListItem): boolean {
  if (invoice.status === "PAID") return false;
  return new Date(invoice.dueDate) < new Date();
}

export default function InvoicesPage() {
  const { t } = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [error, setError] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("search") || "";
  const statusFilter =
    (searchParams.get("status") as InvoiceStatus) || undefined;
  const overdueOnly = searchParams.get("overdue") === "true";

  function updateParam(key: string, value: string | null) {
    const url = new URL(window.location.href);
    if (value === null || value === "") {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
    url.searchParams.delete("page");
    router.push(url.pathname + url.search);
  }

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        if (overdueOnly) {
          // Overdue is a derived/client-side status (not stored on the
          // invoice), so fetch a large page and filter + paginate locally.
          const response = await listInvoicesRequest({
            page: 1,
            limit: 200,
            search: searchQuery || undefined,
            status: statusFilter,
          });
          const overdueInvoices = response.data.filter(isOverdueInvoice);
          const pageSize = 10;
          const start = (currentPage - 1) * pageSize;
          setInvoices(overdueInvoices.slice(start, start + pageSize));
          const totalPages = Math.max(
            1,
            Math.ceil(overdueInvoices.length / pageSize),
          );
          setMeta({
            page: currentPage,
            limit: pageSize,
            total: overdueInvoices.length,
            totalPages,
            hasNextPage: currentPage < totalPages,
            hasPreviousPage: currentPage > 1,
          });
        } else {
          const response = await listInvoicesRequest({
            page: currentPage,
            limit: 10,
            search: searchQuery || undefined,
            status: statusFilter,
          });
          setInvoices(response.data);
          setMeta(response.meta);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("invoices.loadError"));
      }
    };

    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, statusFilter, overdueOnly]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          {t("invoices.title")}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {t("invoices.description")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          onChange={(event) =>
            updateParam("status", event.target.value || null)
          }
          value={statusFilter ?? ""}
        >
          <option value="">{t("invoices.filters.allStatuses")}</option>
          <option value="UNPAID">{t("invoices.status.UNPAID")}</option>
          <option value="PARTIALLY_PAID">
            {t("invoices.status.PARTIALLY_PAID")}
          </option>
          <option value="PAID">{t("invoices.status.PAID")}</option>
        </select>

        <button
          type="button"
          onClick={() => updateParam("overdue", overdueOnly ? null : "true")}
          className={`flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
            overdueOnly
              ? "bg-amber-600 text-white hover:bg-amber-700"
              : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {t("invoices.filters.overdueOnly")}
        </button>
      </div>

      <InvoicesList
        initialInvoices={invoices}
        meta={meta}
        onPageChange={(page) => {
          const url = new URL(window.location.href);
          url.searchParams.set("page", page.toString());
          window.history.pushState({}, "", url);
        }}
      />
    </div>
  );
}
