import { NextResponse } from "next/server";

import { API_TOKEN_COOKIE } from "@/lib/auth";
import { BASE_URL } from "@/lib/apiClient";

async function handleProxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const url = new URL(request.url);
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

  const target = `${BASE_URL}/${path.join("/")}${url.search}`;
  const headers = new Headers();
  const token = cookies[API_TOKEN_COOKIE];
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (accept) {
    headers.set("Accept", accept);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  let response: Response;

  try {
    response = await fetch(target, init);
  } catch {
    return NextResponse.json(
      {
        detail: "Não foi possível alcançar o backend configurado.",
      },
      { status: 502 },
    );
  }
  const responseHeaders = new Headers();
  const responseContentType = response.headers.get("content-type");
  const contentDisposition = response.headers.get("content-disposition");

  if (responseContentType) {
    responseHeaders.set("Content-Type", responseContentType);
  }

  if (contentDisposition) {
    responseHeaders.set("Content-Disposition", contentDisposition);
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function PATCH(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}

export async function DELETE(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, context);
}
