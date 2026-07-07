"use client";

import type { Product } from "@/types/product.types";
import type { SalesOrderItemPayload } from "@/lib/api/sales-orders.api";
import { useTranslations } from "@/lib/i18n/use-translations";

interface SalesOrderItemsFormProps {
  products: Product[];
  items: SalesOrderItemPayload[];
  onChange: (items: SalesOrderItemPayload[]) => void;
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

export function SalesOrderItemsForm({
  products,
  items,
  onChange,
}: SalesOrderItemsFormProps) {
  const { t } = useTranslations();

  function updateItem(index: number, patch: Partial<SalesOrderItemPayload>) {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function addRow() {
    const firstProduct = products[0];
    onChange([
      ...items,
      {
        productId: firstProduct?.id ?? "",
        quantity: 1,
        unitPrice: firstProduct ? Number(firstProduct.sellPrice) : 0,
      },
    ]);
  }

  function removeRow(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleProductChange(index: number, productId: string) {
    const product = products.find((item) => item.id === productId);
    updateItem(index, {
      productId,
      unitPrice: product ? Number(product.sellPrice) : 0,
    });
  }

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-140 text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-2 font-semibold">
                {t("purchaseOrders.product")}
              </th>
              <th className="px-4 py-2 font-semibold">
                {t("purchaseOrders.quantity")}
              </th>
              <th className="px-4 py-2 font-semibold">
                {t("salesOrders.unitPrice")}
              </th>
              <th className="px-4 py-2 font-semibold">
                {t("purchaseOrders.lineTotal")}
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {items.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2">
                  <select
                    className={inputClass}
                    onChange={(event) =>
                      handleProductChange(index, event.target.value)
                    }
                    value={item.productId}
                  >
                    <option value="" disabled>
                      {t("purchaseOrders.selectProduct")}
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    className={`${inputClass} w-24`}
                    min={1}
                    onChange={(event) =>
                      updateItem(index, {
                        quantity: Number(event.target.value),
                      })
                    }
                    type="number"
                    value={item.quantity}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    className={`${inputClass} w-28`}
                    min={0}
                    onChange={(event) =>
                      updateItem(index, {
                        unitPrice: Number(event.target.value),
                      })
                    }
                    step="0.01"
                    type="number"
                    value={item.unitPrice}
                  />
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-300">
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </td>
                <td className="px-4 py-2">
                  <button
                    className="text-xs font-medium text-red-600 hover:underline dark:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={items.length <= 1}
                    onClick={() => removeRow(index)}
                    type="button"
                  >
                    {t("common.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <button
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          onClick={addRow}
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-3.5 w-3.5"
          >
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
          {t("purchaseOrders.addProductRow")}
        </button>
        <p className="text-sm font-semibold text-slate-950 dark:text-white">
          {t("purchaseOrders.total")} : ${total.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
