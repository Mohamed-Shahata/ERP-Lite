"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listCustomersRequest } from "@/lib/api/customers.api";
import { listInvoicesRequest } from "@/lib/api/invoices.api";
import { listProductsRequest } from "@/lib/api/products.api";
import { listPurchaseOrdersRequest } from "@/lib/api/purchase-orders.api";
import { listSalesOrdersRequest } from "@/lib/api/sales-orders.api";
import { listStockMovementsRequest } from "@/lib/api/stock-movements.api";
import { DashboardAlertBanners } from "@/components/dashboard/DashboardAlertBanners";
import { DashboardRecentTables } from "@/components/dashboard/DashboardRecentTables";
import { DashboardStockMovements } from "@/components/dashboard/DashboardStockMovements";
import { DashboardStatCards } from "@/components/dashboard/DashboardStatCards";
import { formatDashboardCurrency } from "@/components/dashboard/format-dashboard";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { InvoiceListItem } from "@/types/invoice.types";

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

function isOverdueInvoice(invoice: InvoiceListItem): boolean {
  if (invoice.status === "PAID") return false;
  return new Date(invoice.dueDate) < new Date();
}

export default function DashboardPage() {
  const { t, dateLocale } = useTranslations();
  const user = useAuthStore((state) => state.user);

  const canViewStockMovements =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", canViewStockMovements],
    queryFn: async () => {
      const [
        salesResult,
        purchaseResult,
        productsResult,
        customersResult,
        invoicesResult,
        allSalesResult,
        allPurchaseResult,
        movementsResult,
      ] = await Promise.all([
        listSalesOrdersRequest({ page: 1, limit: 4 }),
        listPurchaseOrdersRequest({ page: 1, limit: 4 }),
        listProductsRequest({ page: 1, limit: 100 }),
        listCustomersRequest({ page: 1, limit: 1 }),
        listInvoicesRequest({ page: 1, limit: 100 }),
        listSalesOrdersRequest({ page: 1, limit: 100 }),
        listPurchaseOrdersRequest({ page: 1, limit: 100 }),
        canViewStockMovements
          ? listStockMovementsRequest({ page: 1, limit: 5 })
          : Promise.resolve(null),
      ]);

      return {
        salesOrders: salesResult.data,
        purchaseOrders: purchaseResult.data,
        totalProducts: productsResult.meta.total,
        totalCustomers: customersResult.meta.total,
        overdueInvoices: invoicesResult.data.filter(isOverdueInvoice),
        totalSales: allSalesResult.data
          .filter((order) => order.status === "CONFIRMED")
          .reduce((sum, order) => sum + Number(order.totalAmount), 0),
        totalPurchases: allPurchaseResult.data
          .filter((order) => order.status === "RECEIVED")
          .reduce((sum, order) => sum + Number(order.totalAmount), 0),
        lowStockProducts: productsResult.data.filter(
          (product) =>
            product.isActive && product.quantityInStock <= product.reorderLevel,
        ),
        recentStockMovements: movementsResult?.data ?? [],
      };
    },
  });

  const salesOrders = data?.salesOrders ?? [];
  const purchaseOrders = data?.purchaseOrders ?? [];
  const totalProducts = data?.totalProducts ?? 0;
  const totalCustomers = data?.totalCustomers ?? 0;
  const totalSales = data?.totalSales ?? 0;
  const totalPurchases = data?.totalPurchases ?? 0;
  const lowStockProducts = data?.lowStockProducts ?? [];
  const overdueInvoices = data?.overdueInvoices ?? [];
  const recentStockMovements = data?.recentStockMovements ?? [];

  const overdueAmount = useMemo(
    () =>
      overdueInvoices.reduce(
        (sum, invoice) =>
          sum + (Number(invoice.amount) - Number(invoice.amountPaid)),
        0,
      ),
    [overdueInvoices],
  );

  const displayName = user?.name ?? t("common.signedInUser");

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            {t("dashboard.greeting", { name: displayName })}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <Link
          href="/sales-orders"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <PlusIcon />
          {t("dashboard.addNewOrder")}
        </Link>
      </section>

      <DashboardStatCards
        totalSales={totalSales}
        totalProducts={totalProducts}
        totalCustomers={totalCustomers}
        totalPurchases={totalPurchases}
        locale={dateLocale}
        labels={{
          totalSales: t("dashboard.stats.totalSales"),
          totalProducts: t("dashboard.stats.totalProducts"),
          totalCustomers: t("dashboard.stats.totalCustomers"),
          totalPurchases: t("dashboard.stats.totalPurchases"),
          thisMonth: t("dashboard.stats.thisMonth"),
          trends: {
            sales: t("dashboard.stats.trends.sales"),
            products: t("dashboard.stats.trends.products"),
            customers: t("dashboard.stats.trends.customers"),
            purchases: t("dashboard.stats.trends.purchases"),
          },
        }}
      />

      <DashboardAlertBanners
        lowStockCount={lowStockProducts.length}
        overdueCount={overdueInvoices.length}
        labels={{
          stockTitle: t("dashboard.alerts.stockTitle", {
            count: lowStockProducts.length,
          }),
          stockDescription: t("dashboard.alerts.stockDescription"),
          overdueTitle: t("dashboard.alerts.overdueTitle", {
            count: overdueInvoices.length,
          }),
          overdueDescription: t("dashboard.alerts.overdueDescription", {
            amount: formatDashboardCurrency(overdueAmount, dateLocale),
          }),
        }}
      />

      <DashboardRecentTables
        salesOrders={salesOrders}
        purchaseOrders={purchaseOrders}
        locale={dateLocale}
        isLoading={isLoading}
        labels={{
          recentSales: t("dashboard.tables.recentSales"),
          recentPurchases: t("dashboard.tables.recentPurchases"),
          viewDetails: t("dashboard.tables.viewDetails"),
          reference: t("dashboard.tables.reference"),
          customer: t("dashboard.tables.customer"),
          supplier: t("dashboard.tables.supplier"),
          value: t("dashboard.tables.value"),
          cost: t("dashboard.tables.cost"),
          status: t("dashboard.tables.status"),
          emptySales: t("dashboard.tables.emptySales"),
          emptyPurchases: t("dashboard.tables.emptyPurchases"),
        }}
        salesStatusLabels={{
          DRAFT: t("dashboard.salesDisplayStatus.DRAFT"),
          CONFIRMED: t("dashboard.salesDisplayStatus.CONFIRMED"),
          CANCELLED: t("dashboard.salesDisplayStatus.CANCELLED"),
        }}
        purchaseStatusLabels={{
          PENDING: t("dashboard.purchaseDisplayStatus.PENDING"),
          RECEIVED: t("dashboard.purchaseDisplayStatus.RECEIVED"),
          CANCELLED: t("dashboard.purchaseDisplayStatus.CANCELLED"),
        }}
      />

      {canViewStockMovements && (
        <DashboardStockMovements
          movements={recentStockMovements}
          locale={dateLocale}
          isLoading={isLoading}
          labels={{
            title: t("dashboard.stockMovements.title"),
            viewAll: t("dashboard.stockMovements.viewAll"),
            product: t("dashboard.stockMovements.product"),
            type: t("dashboard.stockMovements.type"),
            quantity: t("dashboard.stockMovements.quantity"),
            date: t("dashboard.stockMovements.date"),
            empty: t("dashboard.stockMovements.empty"),
          }}
          typeLabels={{
            IN: t("stockMovements.type.IN"),
            OUT: t("stockMovements.type.OUT"),
            ADJUSTMENT: t("stockMovements.type.ADJUSTMENT"),
          }}
        />
      )}
    </div>
  );
}
