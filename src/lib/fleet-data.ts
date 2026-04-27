import { formatLastPing, hasRecentPing } from "./activity.ts";
import { normalizeText, toDisplayStatus } from "./formatters.ts";
import type { FleetUnit } from "./types.ts";

export function normalizeFleetStatus(value?: string | null) {
  const normalized = normalizeText(value || "Na base (parada)");

  if (normalized.includes("uso") || normalized.includes("alocada")) {
    return "allocated";
  }

  if (normalized.includes("manutenc")) {
    return "maintenance";
  }

  if (normalized.includes("baixada") || normalized.includes("inativa")) {
    return "inactive";
  }

  return "base";
}

export function exportableFleetRows(units: FleetUnit[]) {
  return units.map((unit) => {
    const identifier = unit.identifier || unit.prefixo || "S/N";
    const type = unit.type || unit.tipo || "VIATURA";
    const status = toDisplayStatus(unit.status || "Na base (parada)");
    const crew = unit.equipe || "Não designada";
    const base = unit.base || "Base Central";
    const ping = formatLastPing(unit.last_ping);
    const online = hasRecentPing(unit.last_ping) ? "SIM" : "NÃO";

    return [identifier, type, status, crew, base, ping, online];
  });
}
