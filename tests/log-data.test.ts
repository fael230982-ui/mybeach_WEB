import test from "node:test";
import assert from "node:assert/strict";

import { exportableAuditLogRows } from "../src/lib/log-data.ts";

test("audit log export rows normalize missing values", () => {
  const rows = exportableAuditLogRows([
    {
      created_at: "2026-04-13T12:00:00.000Z",
      action: "LOGIN",
      user: "admin@mybeach.com.br",
      user_role: "ADMIN",
      resource_type: "auth",
      resource_id: "session",
      ip_address: "10.0.0.1",
      ip: "127.0.0.1",
      status: 200,
    },
    {
      endpoint: "/alerts",
      user_id: "u-2",
    },
  ]);

  assert.deepEqual(rows[0], [
    "13/04/2026, 09:00",
    "LOGIN",
    "admin@mybeach.com.br",
    "ADMIN",
    "auth",
    "session",
    "10.0.0.1",
    200,
  ]);
  assert.deepEqual(rows[1], [
    "Data indisponível",
    "/alerts",
    "u-2",
    "",
    "",
    "",
    "",
    "",
  ]);
});
