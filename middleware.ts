import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { API_TOKEN_COOKIE, canAccessPath, extractRoleFromToken, sanitizeAdminRedirectTarget } from "@/lib/auth";

function buildLoginRedirect(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);

  if (request.nextUrl.pathname.startsWith("/admin")) {
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  }

  return NextResponse.redirect(loginUrl);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(API_TOKEN_COOKIE)?.value || null;
  const role = token ? extractRoleFromToken(token) : null;
  const nextParam = request.nextUrl.searchParams.get("next");

  if (pathname === "/login" && token) {
    const target = sanitizeAdminRedirectTarget(nextParam);
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!token) {
    return buildLoginRedirect(request);
  }

  if (!canAccessPath(pathname, role)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*"],
};
