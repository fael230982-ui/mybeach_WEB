import { formatDateTime } from "./formatters.ts";
import type { AppUser } from "./types.ts";

export const ACTIVE_PING_WINDOW_MINUTES = 15;

function parsePingTime(value: string | null | undefined, referenceDate: Date) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "agora" || normalized === "now") {
    return referenceDate;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function hasRecentPing(
  value: string | null | undefined,
  referenceDate = new Date(),
  windowMinutes = ACTIVE_PING_WINDOW_MINUTES,
) {
  const pingDate = parsePingTime(value, referenceDate);
  if (!pingDate) {
    return false;
  }

  const diffMs = referenceDate.getTime() - pingDate.getTime();
  if (diffMs < 0) {
    return false;
  }

  return diffMs <= windowMinutes * 60 * 1000;
}

export function formatLastPing(value: string | null | undefined, referenceDate = new Date()) {
  const pingDate = parsePingTime(value, referenceDate);
  if (!pingDate) {
    return "Sem ping";
  }

  const diffMs = referenceDate.getTime() - pingDate.getTime();
  if (diffMs < 60 * 1000) {
    return "Agora";
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60) {
    return `${diffMinutes} min atrás`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} h atrás`;
  }

  return formatDateTime(pingDate.toISOString(), "Sem ping");
}

export function isUserOperationallyActive(
  user: Pick<AppUser, "last_ping" | "is_active">,
  referenceDate = new Date(),
) {
  if (user.is_active === true) {
    return true;
  }

  return hasRecentPing(user.last_ping, referenceDate);
}

export function countOperationallyActiveUsers(
  users: AppUser[],
  activeUsers: AppUser[] = [],
  options?: { activeUsersSourceFailed?: boolean; referenceDate?: Date },
) {
  if (!options?.activeUsersSourceFailed) {
    const allowedUserIds = new Set(users.map((user) => user.id).filter(Boolean));
    return new Set(
      activeUsers
        .map((user) => user.id)
        .filter((id): id is string => Boolean(id) && allowedUserIds.has(id)),
    ).size;
  }

  const referenceDate = options.referenceDate || new Date();
  return users.filter((user) => isUserOperationallyActive(user, referenceDate)).length;
}
