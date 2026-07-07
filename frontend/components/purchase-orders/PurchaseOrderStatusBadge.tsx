import type { PurchaseOrderStatus } from "@/types/purchase-order.types";

const STYLES: Record<PurchaseOrderStatus, string> = {
  PENDING:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  RECEIVED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  CANCELLED:
    "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const DOT_STYLES: Record<PurchaseOrderStatus, string> = {
  PENDING: "bg-amber-500",
  RECEIVED: "bg-emerald-500",
  CANCELLED: "bg-slate-400",
};

export function PurchaseOrderStatusBadge({
  status,
  label,
}: {
  status: PurchaseOrderStatus;
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
