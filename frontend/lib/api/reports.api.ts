import { listInvoicesRequest } from "./invoices.api";
import { listSalesOrdersRequest } from "./sales-orders.api";
import { listPurchaseOrdersRequest } from "./purchase-orders.api";
import { listProductsRequest } from "./products.api";
import type { DateRangeFilter, ReportsSummary } from "@/types/report.types";
import type { InvoiceListItem, InvoiceStatus } from "@/types/invoice.types";
import type { PurchaseOrderListItem } from "@/types/purchase-order.types";
import type { Product } from "@/types/product.types";

// Reports are computed on the frontend from the existing list endpoints —
// there's no dedicated /reports API yet, so we over-fetch once (bounded by
// REPORT_FETCH_LIMIT) and filter/aggregate client-side.
const REPORT_FETCH_LIMIT = 100;

function isWithinRange(dateStr: string, range: DateRangeFilter): boolean {
  const time = new Date(dateStr).getTime();
  if (range.from && time < new Date(range.from).getTime()) return false;
  if (range.to && time > new Date(range.to).getTime() + 86_400_000 - 1)
    return false;
  return true;
}

export async function getReportsSummaryRequest(
  range: DateRangeFilter = {},
): Promise<ReportsSummary> {
  const [invoicesRes, salesOrdersRes, purchaseOrdersRes, productsRes] =
    await Promise.all([
      listInvoicesRequest({ limit: REPORT_FETCH_LIMIT }),
      listSalesOrdersRequest({ limit: REPORT_FETCH_LIMIT }),
      listPurchaseOrdersRequest({ limit: REPORT_FETCH_LIMIT }),
      listProductsRequest({ limit: REPORT_FETCH_LIMIT }),
    ]);

  const invoices = invoicesRes.data.filter((inv) =>
    isWithinRange(inv.createdAt, range),
  );
  const totalSales = salesOrdersRes.data
    .filter(
      (so) => so.status === "CONFIRMED" && isWithinRange(so.createdAt, range),
    )
    .reduce((sum, so) => sum + parseFloat(so.totalAmount), 0);
  const totalPurchases = purchaseOrdersRes.data
    .filter(
      (po) => po.status === "RECEIVED" && isWithinRange(po.createdAt, range),
    )
    .reduce((sum, po) => sum + parseFloat(po.totalAmount), 0);
  const outstandingInvoices = invoices
    .filter((inv) => inv.status !== "PAID")
    .reduce(
      (sum, inv) => sum + (parseFloat(inv.amount) - parseFloat(inv.amountPaid)),
      0,
    );
  const lowStockCount = productsRes.data.filter(
    (p) => p.quantityInStock <= p.reorderLevel,
  ).length;

  return { totalSales, totalPurchases, outstandingInvoices, lowStockCount };
}

export interface InvoiceReportFilters {
  range?: DateRangeFilter;
  customerId?: string;
  status?: InvoiceStatus;
}

export async function listSalesReportRequest(
  filters: InvoiceReportFilters = {},
): Promise<InvoiceListItem[]> {
  const { data } = await listInvoicesRequest({
    limit: REPORT_FETCH_LIMIT,
    status: filters.status,
  });
  return data.filter((inv) => {
    if (filters.range && !isWithinRange(inv.createdAt, filters.range))
      return false;
    if (filters.customerId && inv.salesOrder.customer.id !== filters.customerId)
      return false;
    return true;
  });
}

// Payment report reuses invoice data — it's the same records viewed through
// a "who paid / who still owes" lens rather than a per-order lens.
export async function listPaymentReportRequest(
  filters: InvoiceReportFilters = {},
): Promise<InvoiceListItem[]> {
  return listSalesReportRequest(filters);
}

export interface PurchaseReportFilters {
  range?: DateRangeFilter;
  supplierId?: string;
  status?: PurchaseOrderListItem["status"];
}

export async function listPurchaseReportRequest(
  filters: PurchaseReportFilters = {},
): Promise<PurchaseOrderListItem[]> {
  const { data } = await listPurchaseOrdersRequest({
    limit: REPORT_FETCH_LIMIT,
    status: filters.status,
  });
  return data.filter((po) => {
    if (filters.range && !isWithinRange(po.createdAt, filters.range))
      return false;
    if (filters.supplierId && po.supplier.id !== filters.supplierId)
      return false;
    return true;
  });
}

export interface InventoryReportFilters {
  categoryId?: string;
  lowStockOnly?: boolean;
}

export async function listInventoryReportRequest(
  filters: InventoryReportFilters = {},
): Promise<Product[]> {
  const { data } = await listProductsRequest({ limit: REPORT_FETCH_LIMIT });
  return data.filter((p) => {
    if (filters.categoryId && p.categoryId !== filters.categoryId) return false;
    if (filters.lowStockOnly && p.quantityInStock > p.reorderLevel)
      return false;
    return true;
  });
}
