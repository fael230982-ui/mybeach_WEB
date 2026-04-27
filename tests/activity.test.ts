import test from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVE_PING_WINDOW_MINUTES,
  countOperationallyActiveUsers,
  formatLastPing,
  hasRecentPing,
  isUserOperationallyActive,
} from "../src/lib/activity.ts";

const referenceDate = new Date("2026-04-13T12:00:00.000Z");

test("activity helpers detect recent pings using the operational window", () => {
  assert.equal(
    hasRecentPing("2026-04-13T11:50:30.000Z", referenceDate, ACTIVE_PING_WINDOW_MINUTES),
    true,
  );
  assert.equal(
    hasRecentPing("2026-04-13T11:40:00.000Z", referenceDate, ACTIVE_PING_WINDOW_MINUTES),
    false,
  );
  assert.equal(hasRecentPing("Agora", referenceDate, ACTIVE_PING_WINDOW_MINUTES), true);
});

test("activity helpers format last ping for recent and stale timestamps", () => {
  assert.equal(formatLastPing("2026-04-13T11:59:45.000Z", referenceDate), "Agora");
  assert.equal(formatLastPing("2026-04-13T11:43:00.000Z", referenceDate), "17 min atrás");
  assert.equal(formatLastPing("2026-04-13T09:00:00.000Z", referenceDate), "3 h atrás");
  assert.equal(formatLastPing(undefined, referenceDate), "Sem ping");
});

test("activity helpers classify and count operationally active users", () => {
  const users = [
    { id: "1", name: "Ana", email: "ana@example.com", role: "GV", last_ping: "2026-04-13T11:55:00.000Z" },
    { id: "2", name: "Bruno", email: "bruno@example.com", role: "GUARDA", last_ping: "2026-04-13T11:30:00.000Z" },
    { id: "3", name: "Caio", email: "caio@example.com", role: "ADMIN", is_active: true },
  ];

  assert.equal(isUserOperationallyActive(users[0], referenceDate), true);
  assert.equal(isUserOperationallyActive(users[1], referenceDate), false);
  assert.equal(isUserOperationallyActive(users[2], referenceDate), true);

  assert.equal(countOperationallyActiveUsers(users, [{ id: "1" }, { id: "3" }] as never), 2);
  assert.equal(countOperationallyActiveUsers(users, [{ id: "1" }, { id: "3" }, { id: "999" }] as never), 2);
  assert.equal(
    countOperationallyActiveUsers(users, [], {
      activeUsersSourceFailed: true,
      referenceDate,
    }),
    2,
  );
});
