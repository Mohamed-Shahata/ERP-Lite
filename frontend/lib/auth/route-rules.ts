export interface RouteRule {
  pattern: string;
  roles: Array<"ADMIN" | "MANAGER" | "EMPLOYEE">;
}

export const ROUTE_RULES: RouteRule[] = [
  { pattern: "/users", roles: ["ADMIN"] },
  // Company name/logo/currency/invoice details — admins only.
  { pattern: "/settings/company", roles: ["ADMIN"] },
  // Who did what, when — admins only.
  { pattern: "/settings/audit-logs", roles: ["ADMIN"] },
  { pattern: "/settings", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { pattern: "/products", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { pattern: "/categories", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { pattern: "/customers", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  // View-only for employees; create/edit/delete stays admin/manager (enforced
  // by canManage in the page and @Roles on the backend mutation endpoints).
  { pattern: "/suppliers", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { pattern: "/purchase-orders", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  // Every role can view reports; printing/exporting is restricted inside
  // the ExportButtons component itself (hidden for EMPLOYEE).
  { pattern: "/reports", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  // Inventory audit trail — same access level as reports/purchase-orders.
  { pattern: "/stock-movements", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/dashboard", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
];

export function findMatchingRule(pathname: string): RouteRule | undefined {
  // Longest pattern first, so more specific rules are checked before
  // broader prefix rules.
  return [...ROUTE_RULES]
    .sort((a, b) => b.pattern.length - a.pattern.length)
    .find((rule) => pathname.startsWith(rule.pattern));
}
