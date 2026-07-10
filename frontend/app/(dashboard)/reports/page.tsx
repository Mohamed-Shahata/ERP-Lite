"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n/use-translations";
import { getReportsSummaryRequest } from "@/lib/api/reports.api";
import { listUsersRequest } from "@/lib/api/users.api";
import { listProductsRequest } from "@/lib/api/products.api";
import { listCategoriesRequest } from "@/lib/api/categories.api";
import { listSalesOrdersRequest } from "@/lib/api/sales-orders.api";
import { listPurchaseOrdersRequest } from "@/lib/api/purchase-orders.api";
import { listStockMovementsRequest } from "@/lib/api/stock-movements.api";
import { DateRangeFilter } from "@/components/reports/DateRangeFilter";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { formatReportCurrency } from "@/components/reports/InvoiceReportTable";
import {
  exportSectionsToExcel,
  exportSectionsToPdf,
  type ExportSection,
} from "@/lib/utils/export";
import { fetchAllPages } from "@/lib/utils/fetch-all-pages";
import {
  SalesReportIcon,
  PurchaseReportIcon,
  InventoryReportIcon,
  PaymentReportIcon,
} from "@/components/reports/ReportIcons";
import type { ReportsSummary } from "@/types/report.types";
import type { SystemUser } from "@/types/auth.types";
import type { Product, Category } from "@/types/product.types";
import type { SalesOrderListItem } from "@/types/sales-order.types";
import type { PurchaseOrderListItem } from "@/types/purchase-order.types";
import type { StockMovement } from "@/types/stock-movement.types";

// Backend caps `limit` at 100 (see PaginationQueryDto), so a full export
// has to walk every page at that max size instead of asking for one huge page.

const CATEGORIES = [
  { key: "sales", href: "/reports/sales", Icon: SalesReportIcon },
  { key: "purchases", href: "/reports/purchases", Icon: PurchaseReportIcon },
  { key: "inventory", href: "/reports/inventory", Icon: InventoryReportIcon },
  { key: "payments", href: "/reports/payments", Icon: PaymentReportIcon },
] as const;

export default function ReportsPage() {
  const { t, dateLocale } = useTranslations();
  const [range, setRange] = useState({ from: "", to: "" });
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setError(null);
    getReportsSummaryRequest({
      from: range.from || undefined,
      to: range.to || undefined,
    })
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : t("reports.loadError"));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to]);

  const summaryCards = summary
    ? [
        {
          label: t("reports.summary.totalSales"),
          value: formatReportCurrency(summary.totalSales, dateLocale),
        },
        {
          label: t("reports.summary.totalPurchases"),
          value: formatReportCurrency(summary.totalPurchases, dateLocale),
        },
        {
          label: t("reports.summary.outstandingInvoices"),
          value: formatReportCurrency(summary.outstandingInvoices, dateLocale),
        },
        {
          label: t("reports.summary.lowStockProducts"),
          value: new Intl.NumberFormat(dateLocale).format(
            summary.lowStockCount,
          ),
        },
      ]
    : [];

  // Fetches every entity in the system and shapes it into one table per
  // type, so a single PDF/Excel export gives a full snapshot of the ERP.
  async function buildFullExportSections(): Promise<ExportSection<never>[]> {
    const [users, products, categories, salesOrders, purchaseOrders, stock] =
      await Promise.all([
        listUsersRequest(),
        fetchAllPages((p) => listProductsRequest(p)),
        fetchAllPages((p) => listCategoriesRequest(p)),
        fetchAllPages((p) => listSalesOrdersRequest(p)),
        fetchAllPages((p) => listPurchaseOrdersRequest(p)),
        fetchAllPages((p) => listStockMovementsRequest(p)),
      ]);

    const fmtDate = (d: string) => new Date(d).toLocaleDateString(dateLocale);

    const sections: ExportSection<never>[] = [
      {
        title: t("reports.sections.employees"),
        columns: [
          { header: t("common.name"), accessor: (r: SystemUser) => r.name },
          { header: t("common.email"), accessor: (r: SystemUser) => r.email },
          {
            header: t("users.role"),
            accessor: (r: SystemUser) => t(`roles.${r.role.toLowerCase()}`),
          },
          {
            header: t("common.status"),
            accessor: (r: SystemUser) =>
              r.isActive ? t("common.active") : t("common.inactive"),
          },
          {
            header: t("reports.columns.date"),
            accessor: (r: SystemUser) => fmtDate(r.createdAt),
          },
        ],
        rows: users,
      },
      {
        title: t("reports.sections.categories"),
        columns: [
          { header: t("common.name"), accessor: (r: Category) => r.name },
          {
            header: t("common.description"),
            accessor: (r: Category) => r.description ?? "",
          },
          {
            header: t("reports.columns.productCount"),
            accessor: (r: Category) => r._count?.products ?? 0,
          },
        ],
        rows: categories,
      },
      {
        title: t("reports.sections.products"),
        columns: [
          { header: t("reports.columns.sku"), accessor: (r: Product) => r.sku },
          {
            header: t("reports.columns.product"),
            accessor: (r: Product) => r.name,
          },
          {
            header: t("reports.columns.category"),
            accessor: (r: Product) => r.category.name,
          },
          {
            header: t("products.costPrice"),
            accessor: (r: Product) =>
              formatReportCurrency(r.costPrice, dateLocale),
          },
          {
            header: t("products.sellPrice"),
            accessor: (r: Product) =>
              formatReportCurrency(r.sellPrice, dateLocale),
          },
          {
            header: t("reports.columns.stock"),
            accessor: (r: Product) => r.quantityInStock,
          },
          {
            header: t("reports.columns.reorderLevel"),
            accessor: (r: Product) => r.reorderLevel,
          },
          {
            header: t("common.status"),
            accessor: (r: Product) =>
              r.isActive ? t("common.active") : t("common.inactive"),
          },
        ],
        rows: products,
      },
      {
        title: t("reports.sections.salesOrders"),
        columns: [
          {
            header: t("salesOrders.soNumber"),
            accessor: (r: SalesOrderListItem) => r.orderNumber,
          },
          {
            header: t("reports.columns.customer"),
            accessor: (r: SalesOrderListItem) => r.customer.name,
          },
          {
            header: t("common.status"),
            accessor: (r: SalesOrderListItem) =>
              t(`salesOrders.status.${r.status}`),
          },
          {
            header: t("reports.columns.total"),
            accessor: (r: SalesOrderListItem) =>
              formatReportCurrency(r.totalAmount, dateLocale),
          },
          {
            header: t("reports.columns.date"),
            accessor: (r: SalesOrderListItem) => fmtDate(r.createdAt),
          },
        ],
        rows: salesOrders,
      },
      {
        title: t("reports.sections.purchaseOrders"),
        columns: [
          {
            header: t("purchaseOrders.poNumber"),
            accessor: (r: PurchaseOrderListItem) => r.poNumber,
          },
          {
            header: t("reports.columns.supplier"),
            accessor: (r: PurchaseOrderListItem) => r.supplier.name,
          },
          {
            header: t("common.status"),
            accessor: (r: PurchaseOrderListItem) =>
              t(`purchaseOrders.status.${r.status}`),
          },
          {
            header: t("reports.columns.total"),
            accessor: (r: PurchaseOrderListItem) =>
              formatReportCurrency(r.totalAmount, dateLocale),
          },
          {
            header: t("reports.columns.date"),
            accessor: (r: PurchaseOrderListItem) => fmtDate(r.createdAt),
          },
        ],
        rows: purchaseOrders,
      },
      {
        title: t("reports.sections.stockMovements"),
        columns: [
          {
            header: t("reports.columns.product"),
            accessor: (r: StockMovement) => r.product.name,
          },
          {
            header: t("stockMovements.type_"),
            accessor: (r: StockMovement) => t(`stockMovements.type.${r.type}`),
          },
          {
            header: t("stockMovements.quantity"),
            accessor: (r: StockMovement) => r.quantity,
          },
          {
            header: t("stockMovements.reference_"),
            accessor: (r: StockMovement) =>
              t(`stockMovements.reference.${r.referenceType}`),
          },
          {
            header: t("reports.columns.note"),
            accessor: (r: StockMovement) => r.note ?? "",
          },
          {
            header: t("stockMovements.createdBy"),
            accessor: (r: StockMovement) => r.createdBy.name,
          },
          {
            header: t("reports.columns.date"),
            accessor: (r: StockMovement) => fmtDate(r.createdAt),
          },
        ],
        rows: stock,
      },
    ];

    return sections;
  }

  async function handleExportPdf() {
    if (!summary || isExporting) return;
    setIsExporting(true);
    try {
      const sections = await buildFullExportSections();
      exportSectionsToPdf(t("reports.fullExportTitle"), sections);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleExportExcel() {
    if (!summary || isExporting) return;
    setIsExporting(true);
    try {
      const sections = await buildFullExportSections();
      exportSectionsToExcel("erp-full-report", sections);
    } finally {
      setIsExporting(false);
    }
  }

  const query =
    range.from || range.to ? `?from=${range.from}&to=${range.to}` : "";

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
            {t("reports.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("reports.description")}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DateRangeFilter
            from={range.from}
            to={range.to}
            onChange={setRange}
          />
          <ExportButtons
            onExportPdf={handleExportPdf}
            onExportExcel={handleExportExcel}
            disabled={!summary || isExporting}
          />
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60"
              />
            ))
          : summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
                  {card.value}
                </p>
              </div>
            ))}
      </section>

      {/* Report Categories */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CATEGORIES.map(({ key, href, Icon }) => (
          <Link
            key={key}
            href={`${href}${query}`}
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Icon />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">
              {t(`reports.categories.${key}.title`)}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t(`reports.categories.${key}.description`)}
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
              {t("reports.viewReport")}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
