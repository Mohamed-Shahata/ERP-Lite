import type { SalesOrderStatus } from "@/types/sales-order.types";

const STYLES: Record<SalesOrderStatus, string> = {
  DRAFT: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  CONFIRMED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  CANCELLED:
    "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const DOT_STYLES: Record<SalesOrderStatus, string> = {
  DRAFT: "bg-blue-500",
  CONFIRMED: "bg-emerald-500",
  CANCELLED: "bg-slate-400",
};

export function SalesOrderStatusBadge({
  status,
  label,
}: {
  status: SalesOrderStatus;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status]}`} />
      {label}
    </span>
  );
}
