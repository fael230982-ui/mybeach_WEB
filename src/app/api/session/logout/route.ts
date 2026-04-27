import { NextResponse } from "next/server";

import { API_TOKEN_COOKIE, SESSION_ROLE_COOKIE } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ authenticated: false });

  response.cookies.set(API_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(SESSION_ROLE_COOKIE, "", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
