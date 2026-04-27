import { NextResponse } from "next/server";

import { API_TOKEN_COOKIE, SESSION_ROLE_COOKIE, extractRoleFromToken } from "@/lib/auth";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [key, ...rest] = item.split("=");
        return [key, decodeURIComponent(rest.join("="))];
      }),
  );

  const token = cookies[API_TOKEN_COOKIE];
  const role = cookies[SESSION_ROLE_COOKIE] || (token ? extractRoleFromToken(token) : null);

  return NextResponse.json({ authenticated: Boolean(token), role });
}
