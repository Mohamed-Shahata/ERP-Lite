import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { findMatchingRule } from "@/lib/auth/route-rules";
import { decodeJwtRole } from "@/lib/auth/decode-jwt-role";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/cookie-names";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const hasSession = Boolean(accessToken || refreshToken);

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(hasSession ? "/dashboard" : "/login", request.url),
    );
  }

  const rule = findMatchingRule(pathname);
  if (!rule) {
    return NextResponse.next();
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!accessToken) {
    return NextResponse.next();
  }

  const role = decodeJwtRole(accessToken);
  if (!role || !rule.roles.includes(role as (typeof rule.roles)[number])) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/settings/:path*",
    "/dashboard/:path*",
    "/products/:path*",
    "/categories/:path*",
    "/suppliers/:path*",
    "/purchase-orders/:path*",
    "/reports/:path*",
    "/stock-movements/:path*",
  ],
};
