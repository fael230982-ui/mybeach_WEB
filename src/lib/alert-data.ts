import {
  formatBatteryLevel,
  getAlertDisplayName,
  getAlertStatusLabel,
  getAlertTypeLabel,
  isActiveAlert,
  isFalseAlarmAlert,
  isResolvedAlert,
  normalizeAlertStatus,
  normalizeAlertType,
} from "./alerts.ts";
import { formatDateTime } from "./formatters.ts";
import type { AppAlert, AppBeach } from "./types.ts";

export type AlertPeriod = "hoje" | "7dias" | "30dias" | "todos";
export type AlertStatusFilter = "todos" | "ativos" | "resolvidos";

export type AlertStats = {
  total: number;
  ativos: number;
  resolvidos: number;
  falsos: number;
};

export type HotZoneEntry = {
  nome: string;
  count: number;
};

export type AlertFrequencyPoint = {
  data: string;
  Ocorrencias: number;
};

export type OperationalAlertRow = {
  id: string;
  data: string;
  praia: string;
  posto: string;
  tipo: string;
  grau: "Grave" | "Normal";
  encaminhamento: string;
  viatura: string;
};

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function getDayDiff(referenceDate: Date, value?: string | null) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  const normalizedReference = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const normalizedValue = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
  return Math.floor((normalizedReference.getTime() - normalizedValue.getTime()) / (1000 * 60 * 60 * 24));
}

export function normalizeAlert(alert: AppAlert): AppAlert {
  return {
    ...alert,
    status: normalizeAlertStatus(alert.status),
    alert_type: normalizeAlertType(alert.alert_type),
  };
}

export function normalizeAlerts(alerts: AppAlert[]) {
  return alerts.map(normalizeAlert);
}

export function filterAlerts(
  alerts: AppAlert[],
  options: { period?: AlertPeriod; status?: AlertStatusFilter; referenceDate?: Date } = {},
) {
  const period = options.period || "todos";
  const status = options.status || "todos";
  const referenceDate = options.referenceDate || new Date();

  return alerts.filter((alert) => {
    const dayDiff = getDayDiff(referenceDate, alert.created_at);

    if (period === "hoje" && !Number.isFinite(dayDiff)) return false;
    if (period === "hoje" && dayDiff !== 0) return false;
    if (period === "7dias" && dayDiff > 7) return false;
    if (period === "30dias" && dayDiff > 30) return false;
    if (status === "ativos" && !isActiveAlert(alert.status)) return false;
    if (status === "resolvidos" && !isResolvedAlert(alert.status)) return false;

    return true;
  });
}

export function buildAlertStats(alerts: AppAlert[]): AlertStats {
  return {
    total: alerts.length,
    ativos: alerts.filter((alert) => isActiveAlert(alert.status)).length,
    resolvidos: alerts.filter((alert) => isResolvedAlert(alert.status)).length,
    falsos: alerts.filter((alert) => isFalseAlarmAlert(alert.status)).length,
  };
}

export function listRecentAlerts(alerts: AppAlert[], limit = 6) {
  return [...alerts]
    .sort((left, right) => new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime())
    .slice(0, limit);
}

export function buildHotZones(alerts: AppAlert[], limit = 5): HotZoneEntry[] {
  const ranking = alerts.reduce<Record<string, number>>((accumulator, alert) => {
    const name = getAlertDisplayName(alert) || "Coordenada Externa";
    accumulator[name] = (accumulator[name] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(ranking)
    .map(([nome, count]) => ({ nome, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, limit);
}

export function buildAlertDailyFrequency(
  alerts: AppAlert[],
  options: { days?: number; referenceDate?: Date } = {},
): AlertFrequencyPoint[] {
  const days = options.days || 7;
  const referenceDate = options.referenceDate || new Date();
  const points: AlertFrequencyPoint[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(referenceDate);
    date.setDate(referenceDate.getDate() - index);
    const label = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    const total = alerts.filter((alert) => {
      if (!alert.created_at) {
        return false;
      }

      const alertDate = new Date(alert.created_at);
      return !Number.isNaN(alertDate.getTime()) && isSameCalendarDay(alertDate, date);
    }).length;

    points.push({ data: label, Ocorrencias: total });
  }

  return points;
}

export function buildOperationalRows(alerts: AppAlert[], beaches: AppBeach[]): OperationalAlertRow[] {
  return alerts.map((alert) => {
    const beach = beaches.find((item) => String(item.id) === String(alert.beach_id));

    return {
      id: alert.id ? String(alert.id).substring(0, 8).toUpperCase() : "ALERTA",
      data: formatDateTime(alert.created_at, "Recente"),
      praia: beach?.name || alert.beach_name || "Não informada",
      posto: alert.zone_id ? "Zona específica" : "Patrulha",
      tipo: getAlertTypeLabel(alert.alert_type),
      grau: isActiveAlert(alert.status) ? "Grave" : "Normal",
      encaminhamento: isResolvedAlert(alert.status) ? "Resolvido no local" : "Acompanhamento",
      viatura: alert.procedimento || "Equipe GV",
    };
  });
}

export function filterOperationalRows(
  rows: OperationalAlertRow[],
  options: { praia?: string; grau?: string; encaminhamento?: string },
) {
  return rows.filter((row) => {
    if (options.praia && options.praia !== "Todas as praias" && row.praia !== options.praia) return false;
    if (options.grau && options.grau !== "TODOS" && row.grau !== options.grau) return false;
    if (
      options.encaminhamento &&
      options.encaminhamento !== "TODOS" &&
      row.encaminhamento !== options.encaminhamento
    ) {
      return false;
    }

    return true;
  });
}

export function exportableAlertRow(alert: AppAlert) {
  return [
    alert.id,
    formatDateTime(alert.created_at, "").split(", ")[0] || "",
    formatDateTime(alert.created_at, "").split(", ")[1] || "",
    alert.beach_name || alert.location_name || "Externa",
    getAlertStatusLabel(alert.status),
    alert.user_name || "Anônimo",
    formatBatteryLevel(alert.battery_level),
    alert.procedimento || "",
  ];
}
