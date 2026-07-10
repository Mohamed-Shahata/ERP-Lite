import Link from "next/link";
import type { StockMovement } from "@/types/stock-movement.types";

const TYPE_STYLES: Record<StockMovement["type"], string> = {
  IN: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  OUT: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  ADJUSTMENT:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
};

export function DashboardStockMovements({
  movements,
  locale,
  isLoading,
  labels,
  typeLabels,
}: {
  movements: StockMovement[];
  locale: string;
  isLoading: boolean;
  labels: {
    title: string;
    viewAll: string;
    product: string;
    type: string;
    quantity: string;
    date: string;
    empty: string;
  };
  typeLabels: Record<StockMovement["type"], string>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {labels.title}
        </h3>
        <Link
          href="/stock-movements"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {labels.viewAll}
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-5 py-3 text-start font-medium">
                {labels.product}
              </th>
              <th className="px-5 py-3 text-start font-medium">
                {labels.type}
              </th>
              <th className="px-5 py-3 text-start font-medium">
                {labels.quantity}
              </th>
              <th className="px-5 py-3 text-start font-medium">
                {labels.date}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  ...
                </td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  {labels.empty}
                </td>
              </tr>
            ) : (
              movements.map((movement) => (
                <tr
                  key={movement.id}
                  className="border-b border-slate-50 last:border-0 dark:border-slate-800/60"
                >
                  <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                    {movement.product.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${TYPE_STYLES[movement.type]}`}
                    >
                      {typeLabels[movement.type]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    {movement.type === "OUT" ? "-" : "+"}
                    {new Intl.NumberFormat(locale).format(movement.quantity)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    {new Date(movement.createdAt).toLocaleDateString(locale)}
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
