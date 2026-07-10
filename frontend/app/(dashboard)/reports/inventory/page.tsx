"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n/use-translations";
import { listInventoryReportRequest } from "@/lib/api/reports.api";
import { listCategoriesRequest } from "@/lib/api/categories.api";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { Pagination, paginate } from "@/components/ui/Pagination";
import { exportRowsToExcel, exportRowsToPdf } from "@/lib/utils/export";
import type { Product } from "@/types/product.types";

const selectClass =
  "h-10 rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:text-white";

export default function InventoryReportPage() {
  const { t, dateLocale } = useTranslations();

  const [categoryId, setCategoryId] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () =>
      listCategoriesRequest({ limit: 100 }).then((res) => res.data),
  });

  const {
    data: products = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["reports", "inventory", categoryId, lowStockOnly],
    queryFn: () =>
      listInventoryReportRequest({
        categoryId: categoryId || undefined,
        lowStockOnly,
      }),
  });
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : t("reports.loadError")
    : null;

  useEffect(() => {
    setPage(1);
  }, [categoryId, lowStockOnly]);

  const paginatedProducts = paginate(products, page, pageSize);

  const exportColumns = [
    {
      header: t("reports.columns.product"),
      accessor: (row: Product) => row.name,
    },
    { header: t("reports.columns.sku"), accessor: (row: Product) => row.sku },
    {
      header: t("reports.columns.category"),
      accessor: (row: Product) => row.category.name,
    },
    {
      header: t("reports.columns.stock"),
      accessor: (row: Product) => row.quantityInStock,
    },
    {
      header: t("reports.columns.reorderLevel"),
      accessor: (row: Product) => row.reorderLevel,
    },
    {
      header: t("reports.columns.stockStatus"),
      accessor: (row: Product) =>
        row.quantityInStock <= row.reorderLevel
          ? t("reports.columns.lowStock")
          : t("reports.columns.inStock"),
    },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        <Link href="/reports" className="hover:underline">
          {t("reports.title")}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-600 dark:text-slate-300">
          {t("reports.categories.inventory.title")}
        </span>
      </p>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
            {t("reports.categories.inventory.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("reports.categories.inventory.description")}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-2">
        <select
          className={selectClass}
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value="">{t("reports.allCategories")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-3 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(event) => setLowStockOnly(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
          />
          {t("reports.lowStockOnly")}
        </label>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-end border-b border-slate-200 dark:border-slate-800 px-5 py-4">
          <ExportButtons
            disabled={products.length === 0}
            onExportPdf={() =>
              exportRowsToPdf(
                t("reports.categories.inventory.title"),
                exportColumns,
                products,
              )
            }
            onExportExcel={() =>
              exportRowsToExcel("inventory-report", exportColumns, products)
            }
          />
        </div>

        {isLoading ? (
          <div className="p-5 text-sm text-slate-500 dark:text-slate-400">
            {t("reports.loading")}
          </div>
        ) : products.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("reports.empty")}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-160 text-start text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3 text-start font-semibold">
                      {t("reports.columns.product")}
                    </th>
                    <th className="px-5 py-3 text-start font-semibold">
                      {t("reports.columns.sku")}
                    </th>
                    <th className="px-5 py-3 text-start font-semibold">
                      {t("reports.columns.category")}
                    </th>
                    <th className="px-5 py-3 text-start font-semibold">
                      {t("reports.columns.stock")}
                    </th>
                    <th className="px-5 py-3 text-start font-semibold">
                      {t("reports.columns.reorderLevel")}
                    </th>
                    <th className="px-5 py-3 text-start font-semibold">
                      {t("reports.columns.stockStatus")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedProducts.map((product) => {
                    const isLow =
                      product.quantityInStock <= product.reorderLevel;
                    return (
                      <tr key={product.id}>
                        <td className="px-5 py-3 font-medium text-slate-950 dark:text-white">
                          {product.name}
                        </td>
                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                          {product.sku}
                        </td>
                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                          {product.category.name}
                        </td>
                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                          {new Intl.NumberFormat(dateLocale).format(
                            product.quantityInStock,
                          )}
                        </td>
                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                          {new Intl.NumberFormat(dateLocale).format(
                            product.reorderLevel,
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                              isLow
                                ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            }`}
                          >
                            {isLow
                              ? t("reports.columns.lowStock")
                              : t("reports.columns.inStock")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={products.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </section>
    </div>
  );
}
