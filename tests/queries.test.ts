import test from "node:test";
import assert from "node:assert/strict";

import {
  collectFailedSources,
  extractActiveUsersData,
  extractAlertData,
  extractArrayData,
  extractDashboardStatsData,
  extractNumericStat,
  extractObjectData,
  normalizeDashboardStatsPayload,
  normalizeActiveUsersPayload,
  type SettledResult,
} from "../src/lib/queries.ts";
import { alertFixtures } from "./fixtures/alerts.fixture.ts";

test("query helpers keep fulfilled array payloads and discard invalid values", () => {
  const okResult: SettledResult<unknown> = { status: "fulfilled", value: [{ id: 1 }] };
  const invalidResult: SettledResult<unknown> = { status: "fulfilled", value: { id: 1 } };

  assert.deepEqual(extractArrayData(okResult), [{ id: 1 }]);
  assert.deepEqual(extractArrayData(invalidResult), []);
});

test("query helpers normalize alerts extracted from fulfilled payloads", () => {
  const alertsResult: SettledResult<unknown> = { status: "fulfilled", value: alertFixtures };

  const alerts = extractAlertData(alertsResult);

  assert.equal(alerts[0]?.status, "REPORTED");
  assert.equal(alerts[0]?.alert_type, "DROWNING");
});

test("query helpers keep fulfilled objects and report rejected sources", () => {
  const objectResult: SettledResult<unknown> = { status: "fulfilled", value: { kpis: { total: 3 } } };
  const rejectedResult: SettledResult<unknown> = {
    status: "rejected",
    reason: new Error("backend offline"),
  };

  assert.deepEqual(extractObjectData(objectResult), { kpis: { total: 3 } });
  assert.equal(extractObjectData(rejectedResult), null);
  assert.deepEqual(
    collectFailedSources([
      { source: "stats", result: objectResult },
      { source: "alerts", result: rejectedResult },
    ]),
    ["alerts"],
  );
});

test("query helpers keep numeric stats including zero values", () => {
  assert.equal(extractNumericStat({ efetivo: 0, frota: 12 }, "efetivo"), 0);
  assert.equal(extractNumericStat({ efetivo: 0, frota: 12 }, "frota"), 12);
  assert.equal(extractNumericStat({ efetivo: Number.NaN }, "efetivo"), null);
  assert.equal(extractNumericStat(null, "efetivo"), null);
});

test("query helpers accept users active payload from api 1.2", () => {
  const activePayload = {
    active_guards: 1,
    active_window_minutes: 15,
    generated_at: "2026-04-27T12:00:00.000Z",
    items: [{ id: "1", name: "Ana", role: "GV", is_active: true, status: "ACTIVE" }],
  };
  const result: SettledResult<unknown> = { status: "fulfilled", value: activePayload };

  assert.deepEqual(normalizeActiveUsersPayload(activePayload), activePayload.items);
  assert.deepEqual(extractActiveUsersData(result), activePayload.items);
  assert.deepEqual(normalizeActiveUsersPayload(activePayload.items), activePayload.items);
});

test("query helpers normalize dashboard stats payload from api 1.3", () => {
  const statsPayload = {
    metricas_cards: {
      ocorrencias_ativas: 4,
      praias_visiveis: 8,
      mar_perigoso: 1,
      agentes_no_local: 12,
    },
    workforce: {
      active_guards: 10,
    },
  };
  const result: SettledResult<unknown> = { status: "fulfilled", value: statsPayload };

  assert.deepEqual(normalizeDashboardStatsPayload(statsPayload), {
    ocorrencias_ativas: 4,
    praias_visiveis: 8,
    mar_perigoso: 1,
    agentes_no_local: 12,
    efetivo: 10,
  });
  assert.deepEqual(extractDashboardStatsData(result), normalizeDashboardStatsPayload(statsPayload));
});
