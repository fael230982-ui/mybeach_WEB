import { formatDateTime } from "./formatters.ts";
import type { AuditLogEntry } from "./types.ts";

export function exportableAuditLogRows(logs: AuditLogEntry[]) {
  return logs.map((log) => [
    formatDateTime(log.created_at, "Data indisponível"),
    log.action || log.endpoint || "Ação não registrada",
    log.user || log.user_id || "Sistema",
    log.user_role || "",
    log.resource_type || "",
    log.resource_id || "",
    log.ip_address || log.ip || "",
    log.status || "",
  ]);
}
