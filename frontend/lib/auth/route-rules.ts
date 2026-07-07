export interface RouteRule {
  pattern: string;
  roles: Array<"ADMIN" | "MANAGER" | "EMPLOYEE">;
}

export const ROUTE_RULES: RouteRule[] = [
  { pattern: "/settings/users", roles: ["ADMIN"] },
  { pattern: "/settings", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { pattern: "/products", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { pattern: "/categories", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { pattern: "/customers", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  // Suppliers are commercial/purchasing data — only admins and managers,
  // unlike products/categories which every authenticated role can view.
  { pattern: "/suppliers", roles: ["ADMIN", "MANAGER"] },
  // Purchasing is admin/manager territory end-to-end (create/edit/cancel/
  // receive/delete AND read) — employees can't even view this module.
  { pattern: "/purchase-orders", roles: ["ADMIN", "MANAGER"] },
  { pattern: "/dashboard", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
];

export function findMatchingRule(pathname: string): RouteRule | undefined {
  // Longest pattern first, so '/settings/users' is checked before the
  // broader '/settings' rule.
  return [...ROUTE_RULES]
    .sort((a, b) => b.pattern.length - a.pattern.length)
    .find((rule) => pathname.startsWith(rule.pattern));
}
