import test from "node:test";
import assert from "node:assert/strict";

import { collectFailedSources, extractAlertData, extractArrayData, extractNumericStat, extractObjectData, type SettledResult } from "../src/lib/queries.ts";
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
