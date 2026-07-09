"use client";

import { useMemo } from "react";
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

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

function ChartCard({
  title,
  hasData,
  noDataLabel,
  children,
}: {
  title: string;
  hasData: boolean;
  noDataLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="h-64 w-full">
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

export interface SalesTrendPoint {
  label: string;
  value: number;
}

export interface PurchasesVsSalesPoint {
  month: string;
  sales: number;
  purchases: number;
}

export interface TopProductPoint {
  name: string;
  quantity: number;
}

export interface RevenueByCategoryPoint {
  name: string;
  value: number;
}

export interface CustomerGrowthPoint {
  month: string;
  customers: number;
}

interface AdminDashboardChartsProps {
  /** Already-fetched invoices from the dashboard page — reused here to
   * compute the Invoice Status breakdown without another request. */
  invoices: InvoiceListItem[];
  salesTrend: SalesTrendPoint[];
  purchasesVsSales: PurchasesVsSalesPoint[];
  topProducts: TopProductPoint[];
  revenueByCategory: RevenueByCategoryPoint[];
  customerGrowth: CustomerGrowthPoint[];
}

/** All 6 charts are computed from real API data fetched on the dashboard
 * page (sales orders, purchase orders, invoices, stock movements, and
 * customers) — none of them use placeholder/sample data. */
export function AdminDashboardCharts({
  invoices,
  salesTrend,
  purchasesVsSales,
  topProducts,
  revenueByCategory,
  customerGrowth,
}: AdminDashboardChartsProps) {
  const { t } = useTranslations();

  const invoiceStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const invoice of invoices) {
      counts[invoice.status] = (counts[invoice.status] ?? 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [invoices]);

  const noData = t("dashboard.charts.noData");

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
        >
          <ResponsiveContainer>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
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
        >
          <ResponsiveContainer>
            <BarChart data={purchasesVsSales}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
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
        >
          <ResponsiveContainer>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="name" width={90} fontSize={12} />
              <Tooltip />
              <Bar dataKey="quantity" fill={COLORS[2]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Invoice Status */}
        <ChartCard
          title={t("dashboard.charts.invoiceStatus")}
          hasData={invoiceStatus.length > 0}
          noDataLabel={noData}
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 5. Revenue by Category */}
        <ChartCard
          title={t("dashboard.charts.revenueByCategory")}
          hasData={revenueByCategory.length > 0}
          noDataLabel={noData}
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 6. Customer Growth */}
        <ChartCard
          title={t("dashboard.charts.customerGrowth")}
          hasData={customerGrowth.some((p) => p.customers > 0)}
          noDataLabel={noData}
        >
          <ResponsiveContainer>
            <LineChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
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
