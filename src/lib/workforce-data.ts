import { countOperationallyActiveUsers } from "./activity.ts";
import type { AppUser } from "./types.ts";

export const OPERATIONS_ROLES = new Set(["ADMIN", "GUARDA", "GV", "CENTRAL"]);

export type WorkforceSummary = {
  totalUsers: number;
  totalOperationalUsers: number;
  activeOperationalUsers: number;
  activeCoverage: number;
  byRole: Array<{ role: string; total: number }>;
  byCity: Array<{ city: string; total: number }>;
};

export function exportableWorkforceSummaryRows(summary: WorkforceSummary) {
  return [
    ["Efetivo ativo", summary.activeOperationalUsers],
    ["Efetivo operacional total", summary.totalOperationalUsers],
    ["Cobertura ativa (%)", summary.activeCoverage],
    ["Usuários totais", summary.totalUsers],
    ...summary.byRole.slice(0, 4).map((item) => [`Efetivo por função - ${item.role}`, item.total]),
    ...summary.byCity.slice(0, 4).map((item) => [`Efetivo por cidade - ${item.city}`, item.total]),
  ] as Array<[string, string | number]>;
}

export function isOperationalUser(user: AppUser) {
  return OPERATIONS_ROLES.has(user.role);
}

export function buildWorkforceSummary(
  users: AppUser[],
  activeUsers: AppUser[] = [],
  options?: { activeUsersSourceFailed?: boolean; referenceDate?: Date },
): WorkforceSummary {
  const operationalUsers = users.filter(isOperationalUser);
  const totalOperationalUsers = operationalUsers.length || users.length;
  const baseUsers = operationalUsers.length > 0 ? operationalUsers : users;
  const activeOperationalUsers = countOperationallyActiveUsers(baseUsers, activeUsers, options);
  const byRoleMap = new Map<string, number>();
  const byCityMap = new Map<string, number>();

  for (const user of baseUsers) {
    const role = user.role || "SEM_FUNCAO";
    byRoleMap.set(role, (byRoleMap.get(role) || 0) + 1);

    const city = user.city_name || "Sem cidade";
    byCityMap.set(city, (byCityMap.get(city) || 0) + 1);
  }

  return {
    totalUsers: users.length,
    totalOperationalUsers,
    activeOperationalUsers,
    activeCoverage: totalOperationalUsers > 0 ? Math.round((activeOperationalUsers / totalOperationalUsers) * 100) : 0,
    byRole: [...byRoleMap.entries()]
      .map(([role, total]) => ({ role, total }))
      .sort((left, right) => right.total - left.total || left.role.localeCompare(right.role)),
    byCity: [...byCityMap.entries()]
      .map(([city, total]) => ({ city, total }))
      .sort((left, right) => right.total - left.total || left.city.localeCompare(right.city)),
  };
}
