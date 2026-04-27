"use client";

import { useQuery } from "@tanstack/react-query";

import { normalizeAlerts } from "./alert-data.ts";
import { apiFetch } from "./apiClient.ts";
import { queryKeys } from "./queryKeys.ts";
import type { AppAlert, AppBeach, AppCity, AppPost, AppUser, AppZone, AuditLogEntry, FleetUnit } from "./types.ts";

type DashboardData = {
  alerts: AppAlert[];
  posts: AppPost[];
  users: AppUser[];
  activeUsers: AppUser[];
  zones: AppZone[];
  failedSources: string[];
};

type MapData = {
  alerts: AppAlert[];
  beaches: AppBeach[];
  cities: AppCity[];
  posts: AppPost[];
  zones: AppZone[];
};

type ReportsData = {
  alerts: AppAlert[];
  activeUsers: AppUser[];
  beaches: AppBeach[];
  stats: Record<string, number> | null;
  users: AppUser[];
  failedSources: string[];
};

type WorkforceData = {
  users: AppUser[];
  activeUsers: AppUser[];
  failedSources: string[];
};

type AlertsQueryOptions = {
  refetchInterval?: number;
};

type DashboardStatsPayload = {
  kpis?: Record<string, unknown>;
  metricas_cards?: Record<string, unknown>;
  workforce?: {
    active_guards?: unknown;
  };
};

export type SettledResult<T> = PromiseSettledResult<T>;

export function extractArrayData<T>(result: SettledResult<unknown>) {
  if (result.status === "fulfilled" && Array.isArray(result.value)) {
    return result.value as T[];
  }

  return [] as T[];
}

export function normalizeActiveUsersPayload(value: unknown) {
  if (Array.isArray(value)) {
    return value as AppUser[];
  }

  if (value && typeof value === "object" && Array.isArray((value as { items?: unknown }).items)) {
    return (value as { items: unknown[] }).items as AppUser[];
  }

  return [] as AppUser[];
}

export function extractActiveUsersData(result: SettledResult<unknown>) {
  if (result.status === "fulfilled") {
    return normalizeActiveUsersPayload(result.value);
  }

  return [] as AppUser[];
}

export function extractObjectData<T extends object>(result: SettledResult<unknown>) {
  if (result.status === "fulfilled" && result.value && typeof result.value === "object") {
    return result.value as T;
  }

  return null;
}

export function extractNumericStat(stats: Record<string, number> | null | undefined, key: string) {
  const value = stats?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function collectNumericRecord(source: Record<string, unknown> | undefined) {
  if (!source) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(source).filter(
      (entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]),
    ),
  );
}

export function normalizeDashboardStatsPayload(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as DashboardStatsPayload;
  const kpis = collectNumericRecord(payload.kpis);
  const stats = Object.keys(kpis).length > 0 ? kpis : collectNumericRecord(payload.metricas_cards);

  if (typeof payload.workforce?.active_guards === "number" && Number.isFinite(payload.workforce.active_guards) && stats.efetivo === undefined) {
    stats.efetivo = payload.workforce.active_guards;
  }

  return Object.keys(stats).length > 0 ? stats : null;
}

export function extractDashboardStatsData(result: SettledResult<unknown>) {
  if (result.status === "fulfilled") {
    return normalizeDashboardStatsPayload(result.value);
  }

  return null;
}

export function collectFailedSources(entries: Array<{ source: string; result: SettledResult<unknown> }>) {
  return entries.filter((entry) => entry.result.status === "rejected").map((entry) => entry.source);
}

export function extractAlertData(result: SettledResult<unknown>) {
  return normalizeAlerts(extractArrayData<AppAlert>(result));
}

export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const data = await apiFetch("/users");
      return Array.isArray(data) ? (data as AppUser[]) : [];
    },
  });
}

export function useCitiesQuery() {
  return useQuery({
    queryKey: queryKeys.cities,
    queryFn: async () => {
      const data = await apiFetch("/cities");
      return Array.isArray(data) ? (data as AppCity[]) : [];
    },
  });
}

export function useBeachesQuery() {
  return useQuery({
    queryKey: queryKeys.beaches,
    queryFn: async () => {
      const data = await apiFetch("/beaches");
      return Array.isArray(data) ? (data as AppBeach[]) : [];
    },
  });
}

export function usePostsQuery() {
  return useQuery({
    queryKey: queryKeys.posts,
    queryFn: async () => {
      const data = await apiFetch("/posts");
      return Array.isArray(data) ? (data as AppPost[]) : [];
    },
  });
}

export function useZonesQuery() {
  return useQuery({
    queryKey: queryKeys.zones,
    queryFn: async () => {
      const data = await apiFetch("/zones");
      return Array.isArray(data) ? (data as AppZone[]) : [];
    },
  });
}

export function useFleetsQuery() {
  return useQuery({
    queryKey: queryKeys.fleets,
    queryFn: async () => {
      const data = await apiFetch("/fleets");
      return Array.isArray(data) ? (data as FleetUnit[]) : [];
    },
  });
}

export function useAlertsQuery(options?: AlertsQueryOptions) {
  return useQuery({
    queryKey: queryKeys.alerts,
    queryFn: async () => {
      const data = await apiFetch("/alerts");
      return Array.isArray(data) ? normalizeAlerts(data as AppAlert[]) : [];
    },
    refetchInterval: options?.refetchInterval,
  });
}

export function useLogsQuery() {
  return useQuery({
    queryKey: queryKeys.logs,
    queryFn: async () => {
      const data = await apiFetch("/logs/");
      return Array.isArray(data) ? (data as AuditLogEntry[]) : [];
    },
  });
}

export function useDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async (): Promise<DashboardData> => {
      const [alertsResult, postsResult, zonesResult, usersResult, activeUsersResult] = await Promise.allSettled([
        apiFetch("/alerts"),
        apiFetch("/posts"),
        apiFetch("/zones"),
        apiFetch("/users"),
        apiFetch("/users/active"),
      ]);
      const failedSources = collectFailedSources([
        { source: "alerts", result: alertsResult },
        { source: "posts", result: postsResult },
        { source: "zones", result: zonesResult },
        { source: "users", result: usersResult },
        { source: "usuarios-ativos", result: activeUsersResult },
      ]);

      return {
        alerts: extractAlertData(alertsResult),
        posts: extractArrayData<AppPost>(postsResult),
        users: extractArrayData<AppUser>(usersResult),
        activeUsers: extractActiveUsersData(activeUsersResult),
        zones: extractArrayData<AppZone>(zonesResult),
        failedSources,
      };
    },
  });
}

export function useMapDataQuery() {
  return useQuery({
    queryKey: queryKeys.mapData,
    queryFn: async (): Promise<MapData> => {
      const [alertsData, citiesData, beachesData, postsData, zonesData] = await Promise.all([
        apiFetch("/alerts"),
        apiFetch("/cities"),
        apiFetch("/beaches"),
        apiFetch("/posts"),
        apiFetch("/zones"),
      ]);

      return {
        alerts: Array.isArray(alertsData) ? normalizeAlerts(alertsData as AppAlert[]) : [],
        beaches: Array.isArray(beachesData) ? (beachesData as AppBeach[]) : [],
        cities: Array.isArray(citiesData) ? (citiesData as AppCity[]) : [],
        posts: Array.isArray(postsData) ? (postsData as AppPost[]) : [],
        zones: Array.isArray(zonesData) ? (zonesData as AppZone[]) : [],
      };
    },
  });
}

export function useReportsDataQuery() {
  return useQuery({
    queryKey: queryKeys.reports,
    queryFn: async (): Promise<ReportsData> => {
      const [statsResult, alertsResult, beachesResult, usersResult, activeUsersResult, workforceResult] = await Promise.allSettled([
        apiFetch("/dashboard/stats"),
        apiFetch("/alerts"),
        apiFetch("/beaches"),
        apiFetch("/users"),
        apiFetch("/users/active"),
        apiFetch("/workforce"),
      ]);
      const workforceActiveUsers = extractActiveUsersData(workforceResult);
      const failedSources = collectFailedSources([
        { source: "dashboard-stats", result: statsResult },
        { source: "alerts", result: alertsResult },
        { source: "beaches", result: beachesResult },
        { source: "users", result: usersResult },
        { source: "usuarios-ativos", result: activeUsersResult },
        { source: "workforce", result: workforceResult },
      ]);

      return {
        alerts: extractAlertData(alertsResult),
        activeUsers: workforceActiveUsers.length > 0 ? workforceActiveUsers : extractActiveUsersData(activeUsersResult),
        beaches: extractArrayData<AppBeach>(beachesResult),
        stats: extractDashboardStatsData(statsResult),
        users: extractArrayData<AppUser>(usersResult),
        failedSources,
      };
    },
  });
}

export function useWorkforceQuery() {
  return useQuery({
    queryKey: [...queryKeys.users, "workforce"],
    queryFn: async (): Promise<WorkforceData> => {
      const [usersResult, activeUsersResult, workforceResult] = await Promise.allSettled([
        apiFetch("/users"),
        apiFetch("/users/active"),
        apiFetch("/workforce"),
      ]);
      const workforceActiveUsers = extractActiveUsersData(workforceResult);
      const failedSources = collectFailedSources([
        { source: "users", result: usersResult },
        { source: "usuarios-ativos", result: activeUsersResult },
        { source: "workforce", result: workforceResult },
      ]);

      return {
        users: extractArrayData<AppUser>(usersResult),
        activeUsers: workforceActiveUsers.length > 0 ? workforceActiveUsers : extractActiveUsersData(activeUsersResult),
        failedSources,
      };
    },
  });
}
