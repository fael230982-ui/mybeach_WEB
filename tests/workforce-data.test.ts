import test from "node:test";
import assert from "node:assert/strict";

import { buildWorkforceSummary, exportableWorkforceSummaryRows, isOperationalUser } from "../src/lib/workforce-data.ts";

const users = [
  { id: "1", name: "Ana", email: "ana@example.com", role: "GV", city_name: "Santos", last_ping: "2026-04-13T11:55:00.000Z" },
  { id: "2", name: "Bruno", email: "bruno@example.com", role: "GUARDA", city_name: "Santos", last_ping: "2026-04-13T11:30:00.000Z" },
  { id: "3", name: "Carla", email: "carla@example.com", role: "ADMIN", city_name: "Guaruja", is_active: true },
  { id: "4", name: "Dani", email: "dani@example.com", role: "CENTRAL", city_name: "Guaruja", is_active: true },
  { id: "5", name: "Erika", email: "erika@example.com", role: "MASTER", city_name: "Guaruja" },
];

test("workforce helpers identify operational roles", () => {
  assert.equal(isOperationalUser(users[0]), true);
  assert.equal(isOperationalUser(users[3]), true);
  assert.equal(isOperationalUser(users[4]), false);
});

test("workforce summary groups operational totals, roles and cities", () => {
  const summary = buildWorkforceSummary(users as never, [{ id: "1" }, { id: "3" }, { id: "4" }] as never);

  assert.equal(summary.totalUsers, 5);
  assert.equal(summary.totalOperationalUsers, 4);
  assert.equal(summary.activeOperationalUsers, 3);
  assert.equal(summary.activeCoverage, 75);
  assert.deepEqual(summary.byRole, [
    { role: "ADMIN", total: 1 },
    { role: "CENTRAL", total: 1 },
    { role: "GUARDA", total: 1 },
    { role: "GV", total: 1 },
  ]);
  assert.deepEqual(summary.byCity, [
    { city: "Guaruja", total: 2 },
    { city: "Santos", total: 2 },
  ]);
});

test("workforce export rows include active coverage and top breakdowns", () => {
  const summary = buildWorkforceSummary(users as never, [{ id: "1" }, { id: "3" }, { id: "4" }] as never);
  const rows = exportableWorkforceSummaryRows(summary);

  assert.deepEqual(rows.slice(0, 4).map((row) => row[1]), [3, 4, 75, 5]);
  assert.ok(rows.some((row) => String(row[0]).includes("GV") && row[1] === 1));
  assert.ok(rows.some((row) => String(row[0]).includes("Santos") && row[1] === 2));
});
