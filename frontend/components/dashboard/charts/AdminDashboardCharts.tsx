"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { InvoiceListItem } from "@/types/invoice.types";
import type { SalesOrderListItem } from "@/types/sales-order.types";
import type { PurchaseOrderListItem } from "@/types/purchase-order.types";
import type { StockMovement } from "@/types/stock-movement.types";
import type { Product } from "@/types/product.types";
import type { Customer } from "@/types/customer.types";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

type Period = "week" | "month" | "year";

interface Bucket {
  label: string;
  start: number;
  end: number;
}

/** Builds the time buckets used to aggregate raw records for a given
 * period: week -> last 7 days, month -> last 4 weeks, year -> last 12
 * months. Buckets are ordered oldest -> newest. */
function buildBuckets(period: Period, locale: string): Bucket[] {
  const now = new Date();

  if (period === "week") {
    return Array.from({ length: 7 }, (_, i) => {
      const start = new Date(now);
      start.setDate(start.getDate() - (6 - i));
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return {
        label: start.toLocaleDateString(locale, { weekday: "short" }),
        start: start.getTime(),
        end: end.getTime(),
      };
    });
  }

  if (period === "month") {
    return Array.from({ length: 4 }, (_, i) => {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (3 - i) * 7 - 6);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return {
        label: start.toLocaleDateString(locale, {
          day: "numeric",
          month: "short",
        }),
        start: start.getTime(),
        end: end.getTime(),
      };
    });
  }

  // year -> last 12 months
  return Array.from({ length: 12 }, (_, i) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const end = new Date(now.getFullYear(), now.getMonth() - (11 - i) + 1, 1);
    return {
      label: start.toLocaleDateString(locale, { month: "short" }),
      start: start.getTime(),
      end: end.getTime(),
    };
  });
}

function bucketIndex(buckets: Bucket[], iso: string): number {
  const time = new Date(iso).getTime();
  return buckets.findIndex((b) => time >= b.start && time < b.end);
}

/** Formats a number using the current locale's digits (e.g. Arabic-Indic
 * numerals for "ar"). Used for every axis / tooltip value so switching
 * language also switches the digit script. */
function localeNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

function PeriodSelect({
  value,
  onChange,
  labels,
}: {
  value: Period;
  onChange: (p: Period) => void;
  labels: Record<Period, string>;
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
      {(["week", "month", "year"] as Period[]).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            value === p
              ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          {labels[p]}
        </button>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  hasData,
  noDataLabel,
  period,
  onPeriodChange,
  periodLabels,
  children,
}: {
  title: string;
  hasData: boolean;
  noDataLabel: string;
  period: Period;
  onPeriodChange: (p: Period) => void;
  periodLabels: Record<Period, string>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
          {title}
        </h3>
        <PeriodSelect
          value={period}
          onChange={onPeriodChange}
          labels={periodLabels}
        />
      </div>
      {/* Forcing LTR here keeps recharts' axis/tick text from overlapping
       * when the page direction is RTL (a bidi rendering issue that shows
       * up specifically with localized/Arabic-Indic digits). The chart
       * title and controls above stay in the page's natural direction. */}
      <div className="h-64 w-full" dir="ltr">
        {hasData ? (
          children
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400 dark:text-slate-500">
            {noDataLabel}
          </div>
        )}
      </div>
    </div>
  );
}

interface AdminDashboardChartsProps {
  invoices: InvoiceListItem[];
  locale: string;
  rawSalesOrders: SalesOrderListItem[];
  rawPurchaseOrders: PurchaseOrderListItem[];
  rawSoldMovements: StockMovement[];
  rawProductsById: Map<string, Product>;
  rawCustomers: Customer[];
  // Kept for backwards compatibility / initial (week) render.
  salesTrend: { label: string; value: number }[];
  purchasesVsSales: { month: string; sales: number; purchases: number }[];
  topProducts: { name: string; quantity: number }[];
  revenueByCategory: { name: string; value: number }[];
  customerGrowth: { month: string; customers: number }[];
}

export function AdminDashboardCharts({
  invoices,
  locale,
  rawSalesOrders,
  rawPurchaseOrders,
  rawSoldMovements,
  rawProductsById,
  rawCustomers,
}: AdminDashboardChartsProps) {
  const { t } = useTranslations();

  const [salesTrendPeriod, setSalesTrendPeriod] = useState<Period>("week");
  const [purchasesVsSalesPeriod, setPurchasesVsSalesPeriod] =
    useState<Period>("month");
  const [topProductsPeriod, setTopProductsPeriod] = useState<Period>("month");
  const [invoiceStatusPeriod, setInvoiceStatusPeriod] =
    useState<Period>("month");
  const [revenueByCategoryPeriod, setRevenueByCategoryPeriod] =
    useState<Period>("month");
  const [customerGrowthPeriod, setCustomerGrowthPeriod] =
    useState<Period>("year");

  const periodLabels: Record<Period, string> = {
    week: t("dashboard.charts.period.week"),
    month: t("dashboard.charts.period.month"),
    year: t("dashboard.charts.period.year"),
  };

  const salesTrend = useMemo(() => {
    const buckets = buildBuckets(salesTrendPeriod, locale);
    const totals = buckets.map(() => 0);
    for (const order of rawSalesOrders) {
      if (order.status !== "CONFIRMED") continue;
      const idx = bucketIndex(buckets, order.createdAt);
      if (idx !== -1) totals[idx] += Number(order.totalAmount);
    }
    return buckets.map((b, i) => ({ label: b.label, value: totals[i] }));
  }, [rawSalesOrders, salesTrendPeriod, locale]);

  const purchasesVsSales = useMemo(() => {
    const buckets = buildBuckets(purchasesVsSalesPeriod, locale);
    const sales = buckets.map(() => 0);
    const purchases = buckets.map(() => 0);
    for (const order of rawSalesOrders) {
      if (order.status !== "CONFIRMED") continue;
      const idx = bucketIndex(buckets, order.createdAt);
      if (idx !== -1) sales[idx] += Number(order.totalAmount);
    }
    for (const order of rawPurchaseOrders) {
      if (order.status !== "RECEIVED") continue;
      const idx = bucketIndex(buckets, order.createdAt);
      if (idx !== -1) purchases[idx] += Number(order.totalAmount);
    }
    return buckets.map((b, i) => ({
      month: b.label,
      sales: sales[i],
      purchases: purchases[i],
    }));
  }, [rawSalesOrders, rawPurchaseOrders, purchasesVsSalesPeriod, locale]);

  const customerGrowth = useMemo(() => {
    const buckets = buildBuckets(customerGrowthPeriod, locale);
    const counts = buckets.map(() => 0);
    for (const customer of rawCustomers) {
      const idx = bucketIndex(buckets, customer.createdAt);
      if (idx !== -1) counts[idx] += 1;
    }
    return buckets.map((b, i) => ({ month: b.label, customers: counts[i] }));
  }, [rawCustomers, customerGrowthPeriod, locale]);

  const soldInRange = (period: Period) => {
    const buckets = buildBuckets(period, locale);
    const rangeStart = buckets[0].start;
    const rangeEnd = buckets[buckets.length - 1].end;
    return rawSoldMovements.filter((m) => {
      const time = new Date(m.createdAt).getTime();
      return time >= rangeStart && time < rangeEnd;
    });
  };

  const topProducts = useMemo(() => {
    const quantityByProduct = new Map<string, number>();
    for (const movement of soldInRange(topProductsPeriod)) {
      quantityByProduct.set(
        movement.product.name,
        (quantityByProduct.get(movement.product.name) ?? 0) + movement.quantity,
      );
    }
    return Array.from(quantityByProduct.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawSoldMovements, topProductsPeriod, locale]);

  const revenueByCategory = useMemo(() => {
    const revenueMap = new Map<string, number>();
    for (const movement of soldInRange(revenueByCategoryPeriod)) {
      const product = rawProductsById.get(movement.productId);
      if (!product) continue;
      const revenue = movement.quantity * Number(product.sellPrice);
      revenueMap.set(
        product.category.name,
        (revenueMap.get(product.category.name) ?? 0) + revenue,
      );
    }
    return Array.from(revenueMap.entries()).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawSoldMovements, rawProductsById, revenueByCategoryPeriod, locale]);

  const invoiceStatus = useMemo(() => {
    const buckets = buildBuckets(invoiceStatusPeriod, locale);
    const rangeStart = buckets[0].start;
    const rangeEnd = buckets[buckets.length - 1].end;
    const counts: Record<string, number> = {};
    for (const invoice of invoices) {
      const time = new Date(invoice.createdAt).getTime();
      if (time < rangeStart || time >= rangeEnd) continue;
      counts[invoice.status] = (counts[invoice.status] ?? 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [invoices, invoiceStatusPeriod, locale]);

  const noData = t("dashboard.charts.noData");
  const tickFormatter = (value: number) => localeNumber(value, locale);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
        {t("dashboard.chartsTitle")}
      </h2>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 1. Sales Trend */}
        <ChartCard
          title={t("dashboard.charts.salesTrend")}
          hasData={salesTrend.some((p) => p.value > 0)}
          noDataLabel={noData}
          period={salesTrendPeriod}
          onPeriodChange={setSalesTrendPeriod}
          periodLabels={periodLabels}
        >
          <ResponsiveContainer>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={tickFormatter} width={60} />
              <Tooltip formatter={(v: number) => localeNumber(v, locale)} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={COLORS[0]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Purchases vs Sales */}
        <ChartCard
          title={t("dashboard.charts.purchasesVsSales")}
          hasData={purchasesVsSales.some((p) => p.sales > 0 || p.purchases > 0)}
          noDataLabel={noData}
          period={purchasesVsSalesPeriod}
          onPeriodChange={setPurchasesVsSalesPeriod}
          periodLabels={periodLabels}
        >
          <ResponsiveContainer>
            <BarChart data={purchasesVsSales}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={tickFormatter} width={60} />
              <Tooltip formatter={(v: number) => localeNumber(v, locale)} />
              <Bar dataKey="sales" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="purchases" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Top Selling Products */}
        <ChartCard
          title={t("dashboard.charts.topProducts")}
          hasData={topProducts.length > 0}
          noDataLabel={noData}
          period={topProductsPeriod}
          onPeriodChange={setTopProductsPeriod}
          periodLabels={periodLabels}
        >
          <ResponsiveContainer>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis
                type="number"
                fontSize={12}
                tickFormatter={tickFormatter}
              />
              <YAxis type="category" dataKey="name" width={90} fontSize={12} />
              <Tooltip formatter={(v: number) => localeNumber(v, locale)} />
              <Bar dataKey="quantity" fill={COLORS[2]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Invoice Status */}
        <ChartCard
          title={t("dashboard.charts.invoiceStatus")}
          hasData={invoiceStatus.length > 0}
          noDataLabel={noData}
          period={invoiceStatusPeriod}
          onPeriodChange={setInvoiceStatusPeriod}
          periodLabels={periodLabels}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={invoiceStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {invoiceStatus.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => localeNumber(v, locale)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 5. Revenue by Category */}
        <ChartCard
          title={t("dashboard.charts.revenueByCategory")}
          hasData={revenueByCategory.length > 0}
          noDataLabel={noData}
          period={revenueByCategoryPeriod}
          onPeriodChange={setRevenueByCategoryPeriod}
          periodLabels={periodLabels}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={revenueByCategory}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {revenueByCategory.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => localeNumber(v, locale)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 6. Customer Growth */}
        <ChartCard
          title={t("dashboard.charts.customerGrowth")}
          hasData={customerGrowth.some((p) => p.customers > 0)}
          noDataLabel={noData}
          period={customerGrowthPeriod}
          onPeriodChange={setCustomerGrowthPeriod}
          periodLabels={periodLabels}
        >
          <ResponsiveContainer>
            <LineChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={tickFormatter} width={60} />
              <Tooltip formatter={(v: number) => localeNumber(v, locale)} />
              <Line
                type="monotone"
                dataKey="customers"
                stroke={COLORS[3]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}
