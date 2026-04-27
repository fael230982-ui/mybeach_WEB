import { clearSessionRole } from "./auth.ts";
import type { ApiErrorLike } from "./types.ts";

const DEFAULT_BASE_URL = "https://api.mybeach.com.br";
export const AUTH_EXPIRED_EVENT = "mybeach:auth-expired";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_URL;

export function buildApiUrl(endpoint: string) {
  const cleanEndpoint = endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
  return cleanEndpoint.startsWith("/") ? cleanEndpoint : `/${cleanEndpoint}`;
}

export function hasApiSession() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie
    .split(";")
    .map((item) => item.trim())
    .some((item) => item.startsWith("mybeach_role="));
}

export async function clearApiToken() {
  await fetch("/api/session/logout", { method: "POST" });
  clearSessionRole();
}

async function handleUnauthorizedResponse() {
  try {
    await clearApiToken();
  } catch {
    // Ignora falha de limpeza local; a sessao do backend ja esta invalida.
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  }
}

export async function createSession(email: string, password: string) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await fetch("/api/session/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    const apiError = new Error(`Erro na autenticacao: ${response.status}`) as ApiErrorLike;
    apiError.status = response.status;

    try {
      apiError.body = await response.json();
      const detail = (apiError.body as { detail?: string } | undefined)?.detail;
      if (detail) {
        apiError.message = detail;
      }
    } catch {
      // Sem corpo JSON relevante.
    }

    throw apiError;
  }

  return response.json();
}

export async function apiFetch(endpoint: string, options: RequestInit = {}, config?: { omitAuth?: boolean }) {
  const finalEndpoint = buildApiUrl(endpoint);
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const target = config?.omitAuth ? finalEndpoint : `/api/proxy${finalEndpoint}`;
  const response = await fetch(target, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const apiError = new Error(`Erro na API: ${response.status}`) as ApiErrorLike;
    apiError.status = response.status;

    try {
      const errorData = await response.json();
      apiError.body = errorData;

      if (errorData?.detail) {
        apiError.message =
          typeof errorData.detail === "string"
            ? errorData.detail
            : JSON.stringify(errorData.detail);
      }
    } catch {
      // Ignora respostas sem corpo JSON.
    }

    if (response.status === 401 && !config?.omitAuth) {
      await handleUnauthorizedResponse();
    }

    throw apiError;
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}
