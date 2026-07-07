"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { listCustomersRequest } from "@/lib/api/customers.api";
import { listInvoicesRequest } from "@/lib/api/invoices.api";
import { listProductsRequest } from "@/lib/api/products.api";
import { listPurchaseOrdersRequest } from "@/lib/api/purchase-orders.api";
import { listSalesOrdersRequest } from "@/lib/api/sales-orders.api";
import { DashboardAlertBanners } from "@/components/dashboard/DashboardAlertBanners";
import { DashboardRecentTables } from "@/components/dashboard/DashboardRecentTables";
import { DashboardStatCards } from "@/components/dashboard/DashboardStatCards";
import { formatDashboardCurrency } from "@/components/dashboard/format-dashboard";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { InvoiceListItem } from "@/types/invoice.types";
import type { Product } from "@/types/product.types";
import type { PurchaseOrderListItem } from "@/types/purchase-order.types";
import type { SalesOrderListItem } from "@/types/sales-order.types";

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

  const [isLoading, setIsLoading] = useState(true);
  const [salesOrders, setSalesOrders] = useState<SalesOrderListItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderListItem[]>(
    [],
  );
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [overdueInvoices, setOverdueInvoices] = useState<InvoiceListItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [
          salesResult,
          purchaseResult,
          productsResult,
          customersResult,
          invoicesResult,
          allSalesResult,
          allPurchaseResult,
        ] = await Promise.all([
          listSalesOrdersRequest({ page: 1, limit: 4 }),
          listPurchaseOrdersRequest({ page: 1, limit: 4 }),
          listProductsRequest({ page: 1, limit: 100 }),
          listCustomersRequest({ page: 1, limit: 1 }),
          listInvoicesRequest({ page: 1, limit: 100 }),
          listSalesOrdersRequest({ page: 1, limit: 100 }),
          listPurchaseOrdersRequest({ page: 1, limit: 100 }),
        ]);

        if (cancelled) return;

        setSalesOrders(salesResult.data);
        setPurchaseOrders(purchaseResult.data);
        setTotalProducts(productsResult.meta.total);
        setTotalCustomers(customersResult.meta.total);
        setOverdueInvoices(invoicesResult.data.filter(isOverdueInvoice));
        setTotalSales(
          allSalesResult.data
            .filter((order) => order.status === "CONFIRMED")
            .reduce((sum, order) => sum + Number(order.totalAmount), 0),
        );
        setTotalPurchases(
          allPurchaseResult.data
            .filter((order) => order.status === "RECEIVED")
            .reduce((sum, order) => sum + Number(order.totalAmount), 0),
        );
        setLowStockProducts(
          productsResult.data.filter(
            (product) =>
              product.isActive &&
              product.quantityInStock <= product.reorderLevel,
          ),
        );
      } catch {
        if (!cancelled) {
          setSalesOrders([]);
          setPurchaseOrders([]);
          setTotalProducts(0);
          setTotalCustomers(0);
          setOverdueInvoices([]);
          setTotalSales(0);
          setTotalPurchases(0);
          setLowStockProducts([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();
    // console.log(listSalesOrdersRequest({ page: 1, limit: 4 }));

    return () => {
      cancelled = true;
    };
  }, []);

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
    </div>
  );
}
