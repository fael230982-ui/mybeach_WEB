import type { UserRole } from "./types.ts";

export const SESSION_ROLE_COOKIE = "mybeach_role";
export const API_TOKEN_COOKIE = "mybeach_token";

type JwtPayload = {
  role?: string;
  roles?: string[] | string;
  user_role?: string;
  profile?: string;
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const base64 = `${normalized}${padding}`;

  if (typeof globalThis.atob === "function") {
    return globalThis.atob(base64);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64").toString("utf-8");
  }

  throw new Error("No base64 decoder available");
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length < 2 || !parts[1]) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

export function extractRoleFromToken(token: string) {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  const candidates = [
    payload.role,
    payload.user_role,
    payload.profile,
    Array.isArray(payload.roles) ? payload.roles[0] : payload.roles,
  ];

  const role = candidates.find((candidate) => typeof candidate === "string" && candidate.trim());
  return role ? role.toUpperCase() : null;
}

export function syncSessionRoleFromToken(token: string) {
  return extractRoleFromToken(token);
}

export function clearSessionRole() {
  if (typeof document !== "undefined") {
    document.cookie = `${SESSION_ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(prefix.length));
}

export function getSessionRole() {
  if (typeof window === "undefined") {
    return null;
  }

  return readCookie(SESSION_ROLE_COOKIE);
}

export function hasAnyRole(role: string | null, allowedRoles: UserRole[]) {
  if (!role) {
    return false;
  }

  const normalizedRole = role.toUpperCase();
  return allowedRoles.some((allowedRole) => normalizedRole === allowedRole.toUpperCase());
}

export function canAccessLogs(role: string | null) {
  return hasAnyRole(role, ["MASTER", "ADMIN"]);
}

export function canManageUsers(role: string | null) {
  return hasAnyRole(role, ["MASTER", "ADMIN"]);
}

export function sanitizeAdminRedirectTarget(target: string | null | undefined, fallback = "/admin") {
  if (!target) {
    return fallback;
  }

  if (!target.startsWith("/admin")) {
    return fallback;
  }

  if (target.startsWith("//")) {
    return fallback;
  }

  return target;
}

export function canAccessPath(pathname: string, role: string | null) {
  if (pathname.startsWith("/admin/logs")) {
    return canAccessLogs(role);
  }

  if (
    pathname.startsWith("/admin/usuarios") ||
    pathname.startsWith("/admin/novo-usuario") ||
    pathname.startsWith("/admin/editar-usuario")
  ) {
    return canManageUsers(role);
  }

  return true;
}
