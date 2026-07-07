"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { listInvoicesRequest } from "@/lib/api/invoices.api";
import type { InvoiceListItem, InvoiceStatus } from "@/types/invoice.types";
import { InvoicesList } from "@/components/invoices/InvoicesList";
import { useTranslations } from "@/lib/i18n/use-translations";

export default function InvoicesPage() {
  const { t } = useTranslations();
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("search") || "";
  const statusFilter =
    (searchParams.get("status") as InvoiceStatus) || undefined;

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        const response = await listInvoicesRequest({
          page: currentPage,
          limit: 10,
          search: searchQuery || undefined,
          status: statusFilter,
        });
        setInvoices(response.data);
        setMeta(response.meta);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("invoices.loadError"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [currentPage, searchQuery, statusFilter]);

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
          {t("invoices.allInvoices")}
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block">
              <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400 animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              {t("common.loading")}
            </p>
          </div>
        </div>
      ) : (
        <InvoicesList
          initialInvoices={invoices}
          meta={meta}
          onPageChange={(page) => {
            const url = new URL(window.location.href);
            url.searchParams.set("page", page.toString());
            window.history.pushState({}, "", url);
          }}
        />
      )}
    </div>
  );
}
