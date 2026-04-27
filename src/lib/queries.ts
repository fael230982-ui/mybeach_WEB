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

export type SettledResult<T> = PromiseSettledResult<T>;

export function extractArrayData<T>(result: SettledResult<unknown>) {
  if (result.status === "fulfilled" && Array.isArray(result.value)) {
    return result.value as T[];
  }

  return [] as T[];
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
        activeUsers: extractArrayData<AppUser>(activeUsersResult),
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
      const [statsResult, alertsResult, beachesResult, usersResult, activeUsersResult] = await Promise.allSettled([
        apiFetch("/dashboard/stats"),
        apiFetch("/alerts"),
        apiFetch("/beaches"),
        apiFetch("/users"),
        apiFetch("/users/active"),
      ]);
      const statsData = extractObjectData<{ kpis?: Record<string, number> }>(statsResult);
      const failedSources = collectFailedSources([
        { source: "dashboard-stats", result: statsResult },
        { source: "alerts", result: alertsResult },
        { source: "beaches", result: beachesResult },
        { source: "users", result: usersResult },
        { source: "usuarios-ativos", result: activeUsersResult },
      ]);

      return {
        alerts: extractAlertData(alertsResult),
        activeUsers: extractArrayData<AppUser>(activeUsersResult),
        beaches: extractArrayData<AppBeach>(beachesResult),
        stats:
          statsData && "kpis" in statsData
            ? ((statsData.kpis || null) as Record<string, number> | null)
            : null,
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
      const [usersResult, activeUsersResult] = await Promise.allSettled([
        apiFetch("/users"),
        apiFetch("/users/active"),
      ]);
      const failedSources = collectFailedSources([
        { source: "users", result: usersResult },
        { source: "usuarios-ativos", result: activeUsersResult },
      ]);

      return {
        users: extractArrayData<AppUser>(usersResult),
        activeUsers: extractArrayData<AppUser>(activeUsersResult),
        failedSources,
      };
    },
  });
}
