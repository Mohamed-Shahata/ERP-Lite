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
import { AdminDashboardCharts } from "@/components/dashboard/charts/AdminDashboardCharts";
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

function monthLabel(date: Date, locale: string) {
  return date.toLocaleDateString(locale, { month: "short" });
}

export default function DashboardPage() {
  const { t, dateLocale } = useTranslations();
  const user = useAuthStore((state) => state.user);

  const canViewStockMovements =
    user?.role === "ADMIN" || user?.role === "MANAGER";
  const isAdmin = user?.role === "ADMIN";

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", canViewStockMovements, isAdmin, dateLocale],
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
        soldMovementsResult,
        allCustomersResult,
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
        // Real "units sold" data for the Top Products / Revenue by Category
        // charts: every OUT stock movement created by a sales order.
        isAdmin
          ? listStockMovementsRequest({
              page: 1,
              limit: 100,
              type: "OUT",
              referenceType: "SALES_ORDER",
            })
          : Promise.resolve(null),
        isAdmin
          ? listCustomersRequest({ page: 1, limit: 100 })
          : Promise.resolve(null),
      ]);

      // --- Sales Trend: real sales orders from the last 7 days ---
      const salesTrend = (() => {
        const now = new Date();
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now);
          d.setDate(d.getDate() - (6 - i));
          d.setHours(0, 0, 0, 0);
          return d;
        });
        const totals = days.map(() => 0);
        for (const order of allSalesResult.data) {
          if (order.status !== "CONFIRMED") continue;
          const created = new Date(order.createdAt);
          created.setHours(0, 0, 0, 0);
          const idx = days.findIndex((d) => d.getTime() === created.getTime());
          if (idx !== -1) totals[idx] += Number(order.totalAmount);
        }
        return days.map((d, i) => ({
          label: d.toLocaleDateString(dateLocale, { weekday: "short" }),
          value: totals[i],
        }));
      })();

      // --- Purchases vs Sales: real orders, last 4 months ---
      const purchasesVsSales = (() => {
        const now = new Date();
        const months = Array.from({ length: 4 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (3 - i), 1);
          return d;
        });
        const sales = months.map(() => 0);
        const purchases = months.map(() => 0);
        for (const order of allSalesResult.data) {
          if (order.status !== "CONFIRMED") continue;
          const created = new Date(order.createdAt);
          const idx = months.findIndex(
            (m) =>
              m.getFullYear() === created.getFullYear() &&
              m.getMonth() === created.getMonth(),
          );
          if (idx !== -1) sales[idx] += Number(order.totalAmount);
        }
        for (const order of allPurchaseResult.data) {
          if (order.status !== "RECEIVED") continue;
          const created = new Date(order.createdAt);
          const idx = months.findIndex(
            (m) =>
              m.getFullYear() === created.getFullYear() &&
              m.getMonth() === created.getMonth(),
          );
          if (idx !== -1) purchases[idx] += Number(order.totalAmount);
        }
        return months.map((m, i) => ({
          month: monthLabel(m, dateLocale),
          sales: sales[i],
          purchases: purchases[i],
        }));
      })();

      // --- Top Products & Revenue by Category: real units sold (from
      // stock movements) valued at each product's current sell price ---
      const productById = new Map(productsResult.data.map((p) => [p.id, p]));
      const soldMovements = soldMovementsResult?.data ?? [];

      const quantityByProduct = new Map<string, number>();
      const revenueByCategoryMap = new Map<string, number>();
      for (const movement of soldMovements) {
        quantityByProduct.set(
          movement.product.name,
          (quantityByProduct.get(movement.product.name) ?? 0) +
            movement.quantity,
        );
        const product = productById.get(movement.productId);
        if (product) {
          const revenue = movement.quantity * Number(product.sellPrice);
          const categoryName = product.category.name;
          revenueByCategoryMap.set(
            categoryName,
            (revenueByCategoryMap.get(categoryName) ?? 0) + revenue,
          );
        }
      }
      const topProducts = Array.from(quantityByProduct.entries())
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
      const revenueByCategory = Array.from(revenueByCategoryMap.entries()).map(
        ([name, value]) => ({ name, value: Math.round(value * 100) / 100 }),
      );

      // --- Customer Growth: real signups by month, last 4 months ---
      const customerGrowth = (() => {
        const now = new Date();
        const months = Array.from({ length: 4 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (3 - i), 1);
          return d;
        });
        const counts = months.map(() => 0);
        for (const customer of allCustomersResult?.data ?? []) {
          const created = new Date(customer.createdAt);
          const idx = months.findIndex(
            (m) =>
              m.getFullYear() === created.getFullYear() &&
              m.getMonth() === created.getMonth(),
          );
          if (idx !== -1) counts[idx] += 1;
        }
        return months.map((m, i) => ({
          month: monthLabel(m, dateLocale),
          customers: counts[i],
        }));
      })();

      return {
        salesOrders: salesResult.data,
        purchaseOrders: purchaseResult.data,
        totalProducts: productsResult.meta.total,
        totalCustomers: customersResult.meta.total,
        overdueInvoices: invoicesResult.data.filter(isOverdueInvoice),
        invoices: invoicesResult.data,
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
        salesTrend,
        purchasesVsSales,
        topProducts,
        revenueByCategory,
        customerGrowth,
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
  const invoices = data?.invoices ?? [];
  const recentStockMovements = data?.recentStockMovements ?? [];
  const salesTrend = data?.salesTrend ?? [];
  const purchasesVsSales = data?.purchasesVsSales ?? [];
  const topProducts = data?.topProducts ?? [];
  const revenueByCategory = data?.revenueByCategory ?? [];
  const customerGrowth = data?.customerGrowth ?? [];

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

      {/* 1. Cards first */}
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

      {/* 2. Charts (admin only) — all computed from real API data */}
      {isAdmin && (
        <AdminDashboardCharts
          invoices={invoices}
          salesTrend={salesTrend}
          purchasesVsSales={purchasesVsSales}
          topProducts={topProducts}
          revenueByCategory={revenueByCategory}
          customerGrowth={customerGrowth}
        />
      )}

      {/* 3. Tables */}
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
