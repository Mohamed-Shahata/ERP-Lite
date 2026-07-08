import type { ReactNode } from "react";
import {
  formatDashboardCurrency,
  formatDashboardNumber,
} from "./format-dashboard";

type StatCard = {
  label: string;
  value: string;
  trend: string;
  trendLabel: string;
  icon: ReactNode;
  featured?: boolean;
  iconBg?: string;
};

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"
      />
      <path
        strokeLinecap="round"
        d="M16 7.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v1.5M18 12h3"
      />
    </svg>
  );
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16V8Z"
      />
      <path strokeLinecap="round" d="M3.5 8 12 12.5 20.5 8M12 12.5V20.5" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
    >
      <circle cx="9" cy="7.5" r="3" />
      <path strokeLinecap="round" d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path
        strokeLinecap="round"
        d="M16 8a2.75 2.75 0 1 1 0 5.5M18.5 19.5a4.75 4.75 0 0 0-3.9-4.67"
      />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 4h2l2.5 11h9.5l2-7H7"
      />
      <circle cx="10" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </svg>
  );
}

function StatCardView({ card }: { card: StatCard }) {
  const featured = card.featured;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 shadow-sm ${
        featured
          ? "bg-blue-600 text-white"
          : "border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 pe-2">
          <p
            className={`text-xs font-semibold leading-snug ${
              featured ? "text-blue-100" : "text-red-600 dark:text-red-400"
            }`}
          >
            {card.trend}
          </p>
          <span
            className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
              featured
                ? "bg-white/15 text-white"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {card.trendLabel}
          </span>
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            featured
              ? "bg-white/15 text-white"
              : (card.iconBg ??
                "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400")
          }`}
        >
          {card.icon}
        </span>
      </div>
      <p
        className={`mt-6 text-sm font-medium ${
          featured ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        {card.label}
      </p>
      <p
        className={`mt-2 text-3xl font-bold tracking-tight ${
          featured ? "text-white" : "text-slate-900 dark:text-white"
        }`}
      >
        {card.value}
      </p>
    </div>
  );
}

export function DashboardStatCards({
  totalSales,
  totalProducts,
  totalCustomers,
  totalPurchases,
  locale,
  labels,
}: {
  totalSales: number;
  totalProducts: number;
  totalCustomers: number;
  totalPurchases: number;
  locale: string;
  labels: {
    totalSales: string;
    totalProducts: string;
    totalCustomers: string;
    totalPurchases: string;
    thisMonth: string;
    trends: {
      sales: string;
      products: string;
      customers: string;
      purchases: string;
    };
  };
}) {
  const cards: StatCard[] = [
    {
      label: labels.totalSales,
      value: formatDashboardCurrency(totalSales, locale),
      trend: labels.trends.sales,
      trendLabel: labels.thisMonth,
      icon: <WalletIcon className="h-5 w-5" />,
      featured: true,
    },
    {
      label: labels.totalProducts,
      value: formatDashboardNumber(totalProducts, locale),
      trend: labels.trends.products,
      trendLabel: labels.thisMonth,
      icon: <BoxIcon className="h-5 w-5 text-blue-600" />,
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      label: labels.totalCustomers,
      value: formatDashboardNumber(totalCustomers, locale),
      trend: labels.trends.customers,
      trendLabel: labels.thisMonth,
      icon: <UsersIcon className="h-5 w-5" />,
      iconBg:
        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    },
    {
      label: labels.totalPurchases,
      value: formatDashboardCurrency(totalPurchases, locale),
      trend: labels.trends.purchases,
      trendLabel: labels.thisMonth,
      icon: <CartIcon className="h-5 w-5 text-red-500" />,
      iconBg: "bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCardView key={card.label} card={card} />
      ))}
    </section>
  );
}
