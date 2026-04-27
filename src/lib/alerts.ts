import type { AppAlert } from "@/lib/types";

const ALERT_STATUS_ALIASES = {
  REPORTED: ["REPORTED", "ABERTO", "NOVO", "PENDING", "PENDENTE", "RECEIVED"],
  ACCEPTED: ["ACCEPTED", "ASSUMIDO", "DISPATCHED", "ASSIGNED"],
  IN_PROGRESS: ["IN_PROGRESS", "EM_ANDAMENTO", "EM_ATENDIMENTO", "EM_DESLOCAMENTO"],
  RESOLVED: ["RESOLVED", "RESOLVIDO", "ENCERRADO", "FINALIZADO"],
  FALSE_ALARM: ["FALSE_ALARM", "ALARME_FALSO", "FALSO_ALARME", "CANCELLED", "CANCELADO"],
} as const;

const ALERT_TYPE_ALIASES = {
  DROWNING: ["DROWNING", "SOS_AGUA", "POSSIVEL_AFOGAMENTO", "AFOGAMENTO"],
  LOST_CHILD: ["LOST_CHILD", "CHILD_MISSING", "CRIANCA_PERDIDA"],
  MEDICAL: ["MEDICAL", "EMERGENCIA_MEDICA"],
} as const;

function findCanonicalKey<T extends string>(
  value: string | null | undefined,
  aliases: Record<T, readonly string[]>,
) {
  const normalizedValue = String(value || "").toUpperCase();
  if (!normalizedValue) {
    return "";
  }

  for (const [canonical, options] of Object.entries(aliases) as Array<[T, readonly string[]]>) {
    if (options.includes(normalizedValue)) {
      return canonical;
    }
  }

  return normalizedValue;
}

function humanizeToken(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normalizeAlertStatus(status?: string | null) {
  return findCanonicalKey(status, ALERT_STATUS_ALIASES);
}

export function normalizeAlertType(type?: string | null) {
  return findCanonicalKey(type, ALERT_TYPE_ALIASES);
}

export function isPendingAlert(status?: string | null) {
  return normalizeAlertStatus(status) === "REPORTED";
}

export function isDispatchedAlert(status?: string | null) {
  return normalizeAlertStatus(status) === "ACCEPTED";
}

export function isInProgressAlert(status?: string | null) {
  return normalizeAlertStatus(status) === "IN_PROGRESS";
}

export function isActiveAlert(status?: string | null) {
  const normalized = normalizeAlertStatus(status);
  return (
    normalized === "REPORTED" ||
    normalized === "ACCEPTED" ||
    normalized === "IN_PROGRESS"
  );
}

export function isResolvedAlert(status?: string | null) {
  return normalizeAlertStatus(status) === "RESOLVED";
}

export function isFalseAlarmAlert(status?: string | null) {
  return normalizeAlertStatus(status) === "FALSE_ALARM";
}

export function getAlertPriorityWeight(status?: string | null) {
  if (isPendingAlert(status)) return 1;
  if (isActiveAlert(status)) return 2;
  return 3;
}

export function getAlertStatusLabel(status?: string | null) {
  if (isPendingAlert(status)) return "Aguardando despacho";
  if (isDispatchedAlert(status)) return "Guarnição acionada";
  if (isInProgressAlert(status)) return "Em atendimento";
  if (isFalseAlarmAlert(status)) return "Falso alarme";
  if (isResolvedAlert(status)) return "Resolvido";
  return status ? humanizeToken(status) : "Sem status";
}

export function getAlertTypeLabel(type?: string | null) {
  const normalized = normalizeAlertType(type);

  if (normalized === "DROWNING") return "Afogamento";
  if (normalized === "LOST_CHILD") return "Criança perdida";
  if (normalized === "MEDICAL") return "Emergência médica";

  return type ? humanizeToken(type) : "Ocorrencia geral";
}

export function hasBatteryLevel(level?: number | null): level is number {
  return typeof level === "number" && Number.isFinite(level);
}

export function isLowBatteryLevel(level?: number | null) {
  return hasBatteryLevel(level) ? level < 20 : false;
}

export function formatBatteryLevel(level?: number | null) {
  return hasBatteryLevel(level) ? `${level}%` : "Oculta";
}

export function getAlertDisplayName(alert: AppAlert) {
  return alert.location_name || alert.beach_name || "Ocorrencia";
}
