import test from "node:test";
import assert from "node:assert/strict";

import { canAccessPath, sanitizeAdminRedirectTarget } from "../src/lib/auth.ts";

test("route access blocks privileged admin areas for gv", () => {
  assert.equal(canAccessPath("/admin", "GV"), true);
  assert.equal(canAccessPath("/admin/ocorrencias", "GV"), true);
  assert.equal(canAccessPath("/admin/logs", "GV"), false);
  assert.equal(canAccessPath("/admin/usuarios", "GV"), false);
});

test("route access allows privileged admin areas for admins", () => {
  assert.equal(canAccessPath("/admin/logs", "ADMIN"), true);
  assert.equal(canAccessPath("/admin/usuarios", "ADMIN"), true);
  assert.equal(canAccessPath("/admin/editar-usuario/123", "MASTER"), true);
});

test("admin redirect target sanitization rejects external or unrelated paths", () => {
  assert.equal(sanitizeAdminRedirectTarget("/admin"), "/admin");
  assert.equal(sanitizeAdminRedirectTarget("/admin/mapa?focus=1"), "/admin/mapa?focus=1");
  assert.equal(sanitizeAdminRedirectTarget("/"), "/admin");
  assert.equal(sanitizeAdminRedirectTarget("/login?next=/admin"), "/admin");
  assert.equal(sanitizeAdminRedirectTarget("javascript:alert(1)"), "/admin");
});
