import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAlertDailyFrequency,
  buildAlertStats,
  buildHotZones,
  buildOperationalRows,
  exportableAlertRow,
  filterAlerts,
  filterOperationalRows,
  listRecentAlerts,
  normalizeAlerts,
} from "../src/lib/alert-data.ts";
import { alertFixtures, beachFixtures } from "./fixtures/alerts.fixture.ts";

test("alert data normalization canonicalizes statuses and types", () => {
  const normalized = normalizeAlerts(alertFixtures);

  assert.equal(normalized[0]?.status, "REPORTED");
  assert.equal(normalized[0]?.alert_type, "DROWNING");
  assert.equal(normalized[2]?.status, "IN_PROGRESS");
  assert.equal(normalized[3]?.alert_type, "MEDICAL");
});

test("alert filters apply period and status using a stable reference date", () => {
  const normalized = normalizeAlerts(alertFixtures);
  const referenceDate = new Date("2026-04-12T12:00:00.000Z");

  assert.equal(filterAlerts(normalized, { period: "hoje", referenceDate }).length, 1);
  assert.equal(filterAlerts(normalized, { period: "7dias", referenceDate }).length, 3);
  assert.equal(filterAlerts(normalized, { status: "ativos", referenceDate }).length, 3);
  assert.equal(filterAlerts(normalized, { status: "resolvidos", referenceDate }).length, 2);
});

test("alert aggregates and exports stay stable for local fixtures", () => {
  const normalized = normalizeAlerts(alertFixtures);
  const stats = buildAlertStats(normalized);
  const recent = listRecentAlerts(normalized, 3);
  const hotZones = buildHotZones(normalized, 2);
  const chart = buildAlertDailyFrequency(normalized, {
    days: 3,
    referenceDate: new Date("2026-04-12T12:00:00.000Z"),
  });
  const exported = exportableAlertRow(normalized[0]!);

  assert.deepEqual(stats, { total: 6, ativos: 3, resolvidos: 2, falsos: 1 });
  assert.deepEqual(recent.map((item) => item.id), ["alert-1", "alert-2", "alert-3"]);
  assert.deepEqual(hotZones[0], { nome: "Praia Serena", count: 2 });
  assert.deepEqual(chart, [
    { data: "10/04", Ocorrencias: 1 },
    { data: "11/04", Ocorrencias: 1 },
    { data: "12/04", Ocorrencias: 1 },
  ]);
  assert.equal(exported[4], "Aguardando despacho");
  assert.equal(exported[6], "0%");
});

test("operational rows and local filters preserve normalized semantics", () => {
  const normalized = normalizeAlerts(alertFixtures);
  const rows = buildOperationalRows(normalized, beachFixtures);
  const graveRows = filterOperationalRows(rows, { grau: "Grave" });
  const resolvedRows = filterOperationalRows(rows, { encaminhamento: "Resolvido no local" });
  const beachRows = filterOperationalRows(rows, { praia: "Praia Serena" });

  assert.equal(rows[0]?.tipo, "Afogamento");
  assert.equal(rows[2]?.praia, "Não informada");
  assert.equal(rows[3]?.posto, "Zona específica");
  assert.equal(graveRows.length, 3);
  assert.equal(resolvedRows.length, 2);
  assert.equal(beachRows.length, 2);
});
