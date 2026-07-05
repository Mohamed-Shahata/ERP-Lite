export interface RouteRule {
  pattern: string;
  roles: Array<"ADMIN" | "MANAGER" | "EMPLOYEE">;
}

export const ROUTE_RULES: RouteRule[] = [
  { pattern: "/settings/users", roles: ["ADMIN"] },
  { pattern: "/settings", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { pattern: "/dashboard", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
];

export function findMatchingRule(pathname: string): RouteRule | undefined {
  // Longest pattern first, so '/settings/users' is checked before the
  // broader '/settings' rule.
  return [...ROUTE_RULES]
    .sort((a, b) => b.pattern.length - a.pattern.length)
    .find((rule) => pathname.startsWith(rule.pattern));
}
