import Link from "next/link";
import { formatDashboardCurrency } from "./format-dashboard";
import type { PurchaseOrderListItem } from "@/types/purchase-order.types";
import type { SalesOrderListItem, SalesOrderStatus } from "@/types/sales-order.types";
import type { PurchaseOrderStatus } from "@/types/purchase-order.types";

const SALES_STATUS_STYLES: Record<SalesOrderStatus, string> = {
  CONFIRMED: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  DRAFT: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  CANCELLED: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

const PURCHASE_STATUS_STYLES: Record<PurchaseOrderStatus, string> = {
  RECEIVED: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  PENDING:
    "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  CANCELLED:
    "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
};

function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-3.5 w-3.5"
    >
      <path strokeLinecap="round" d="M14 5h5v5M10 14 20 9M15 5l-5 5" />
    </svg>
  );
}

function SalesOrdersIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5 text-blue-600"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3.5h10a1 1 0 0 1 1 1V20l-3-2-3 2-3-2-3 2V4.5a1 1 0 0 1 1-1Z"
      />
      <path strokeLinecap="round" d="M9 8h6M9 11.5h6M9 15h3" />
    </svg>
  );
}

function PurchaseOrdersIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className="h-5 w-5 text-blue-600"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"
      />
      <circle cx="7.5" cy="18" r="1.5" />
      <circle cx="17.5" cy="18" r="1.5" />
    </svg>
  );
}

function OrdersTableCard({
  title,
  href,
  viewDetailsLabel,
  icon,
  columns,
  rows,
  emptyLabel,
  isLoading,
}: {
  title: string;
  href: string;
  viewDetailsLabel: string;
  icon: React.ReactNode;
  columns: string[];
  rows: Array<{
    id: string;
    reference: string;
    party: string;
    amount: string;
    status: string;
    statusStyle: string;
  }>;
  emptyLabel: string;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {viewDetailsLabel}
          <ExternalLinkIcon />
        </Link>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
            {icon}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              {columns.map((column) => (
                <th key={column} className="px-5 py-3 text-start font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  ...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-50 last:border-0 dark:border-slate-800/60"
                >
                  <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                    {row.reference}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    {row.party}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                    {row.amount}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.statusStyle}`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DashboardRecentTables({
  salesOrders,
  purchaseOrders,
  locale,
  isLoading,
  labels,
  salesStatusLabels,
  purchaseStatusLabels,
}: {
  salesOrders: SalesOrderListItem[];
  purchaseOrders: PurchaseOrderListItem[];
  locale: string;
  isLoading: boolean;
  labels: {
    recentSales: string;
    recentPurchases: string;
    viewDetails: string;
    reference: string;
    customer: string;
    supplier: string;
    value: string;
    cost: string;
    status: string;
    emptySales: string;
    emptyPurchases: string;
  };
  salesStatusLabels: Record<SalesOrderStatus, string>;
  purchaseStatusLabels: Record<PurchaseOrderStatus, string>;
}) {
  const salesRows = salesOrders.map((order) => ({
    id: order.id,
    reference: order.orderNumber,
    party: order.customer.name,
    amount: formatDashboardCurrency(Number(order.totalAmount), locale),
    status: salesStatusLabels[order.status],
    statusStyle: SALES_STATUS_STYLES[order.status],
  }));

  const purchaseRows = purchaseOrders.map((order) => ({
    id: order.id,
    reference: order.poNumber,
    party: order.supplier.name,
    amount: formatDashboardCurrency(Number(order.totalAmount), locale),
    status: purchaseStatusLabels[order.status],
    statusStyle: PURCHASE_STATUS_STYLES[order.status],
  }));

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <OrdersTableCard
        title={labels.recentSales}
        href="/sales-orders"
        viewDetailsLabel={labels.viewDetails}
        icon={<SalesOrdersIcon />}
        columns={[labels.reference, labels.customer, labels.value, labels.status]}
        rows={salesRows}
        emptyLabel={labels.emptySales}
        isLoading={isLoading}
      />
      <OrdersTableCard
        title={labels.recentPurchases}
        href="/purchase-orders"
        viewDetailsLabel={labels.viewDetails}
        icon={<PurchaseOrdersIcon />}
        columns={[labels.reference, labels.supplier, labels.cost, labels.status]}
        rows={purchaseRows}
        emptyLabel={labels.emptyPurchases}
        isLoading={isLoading}
      />
    </section>
  );
}
