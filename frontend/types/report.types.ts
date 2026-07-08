export interface DateRangeFilter {
  from?: string;
  to?: string;
}

export interface ReportsSummary {
  totalSales: number;
  totalPurchases: number;
  outstandingInvoices: number;
  lowStockCount: number;
}
