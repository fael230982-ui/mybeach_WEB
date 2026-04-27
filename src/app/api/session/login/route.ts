import { NextResponse } from "next/server";

import { API_TOKEN_COOKIE, extractRoleFromToken, SESSION_ROLE_COOKIE } from "@/lib/auth";
import { BASE_URL, buildApiUrl } from "@/lib/apiClient";

const SESSION_MAX_AGE = 60 * 60 * 12;

function buildCookieOptions(httpOnly: boolean) {
  return {
    httpOnly,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

function createSessionResponse(token: string) {
  const role = extractRoleFromToken(token);
  const response = NextResponse.json({ authenticated: true, role });

  response.cookies.set(API_TOKEN_COOKIE, token, buildCookieOptions(true));
  if (role) {
    response.cookies.set(SESSION_ROLE_COOKIE, role, buildCookieOptions(false));
  }

  return response;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const { token } = (await request.json()) as { token?: string };
    if (!token) {
      return NextResponse.json({ detail: "Token ausente." }, { status: 400 });
    }

    return createSessionResponse(token);
  }

  const body = await request.text();
  const response = await fetch(`${BASE_URL}${buildApiUrl("/auth/login")}`, {
    method: "POST",
    headers: {
      "Content-Type": contentType || "application/x-www-form-urlencoded",
    },
    body,
  });

  const rawText = await response.text();
  let payload: unknown = null;

  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    payload = rawText;
  }

  if (!response.ok) {
    return NextResponse.json(
      typeof payload === "object" && payload !== null ? payload : { detail: "Falha na autenticação." },
      { status: response.status },
    );
  }

  const token =
    (payload as { access_token?: string; token?: string } | null)?.access_token ||
    (payload as { token?: string } | null)?.token;

  if (!token) {
    return NextResponse.json({ detail: "A API não retornou um token válido." }, { status: 502 });
  }

  return createSessionResponse(token);
}
