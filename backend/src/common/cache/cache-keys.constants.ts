/**
 * Central place for cache key prefixes + TTLs, so the modules that write
 * data (products, categories, ...) and the modules that read it (reports,
 * dashboard, ...) agree on exactly what string to invalidate.
 */
export const CACHE_TTL = {
  DASHBOARD: 60_000, // 1 min — near-real-time operational numbers
  REPORTS: 300_000, // 5 min — heavier aggregate queries, ok to be a bit stale
  LIST: 60_000, // 1 min — products/categories/suppliers/customers lists
} as const;

export const CACHE_PREFIX = {
  DASHBOARD_OVERVIEW: 'dashboard:overview:',
  REPORTS_SUMMARY: 'reports:summary',
  REPORTS_SALES: 'reports:sales',
  REPORTS_PURCHASES: 'reports:purchases',
  REPORTS_INVENTORY: 'reports:inventory',
  REPORTS_PAYMENTS: 'reports:payments',
  PRODUCTS_LIST: 'products:list:',
  CATEGORIES_LIST: 'categories:list:',
  SUPPLIERS_LIST: 'suppliers:list:',
  CUSTOMERS_LIST: 'customers:list:',
} as const;
