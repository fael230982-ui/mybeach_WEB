import test from "node:test";
import assert from "node:assert/strict";

import { canAccessLogs, canAccessPath, canManageUsers, decodeJwtPayload, extractRoleFromToken, hasAnyRole, sanitizeAdminRedirectTarget } from "../src/lib/auth.ts";
import { shouldRetryQueryError } from "../src/lib/errors.ts";

function createToken(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.`;
}

test("jwt payload decoding supports role extraction", () => {
  const token = createToken({ role: "admin" });
  assert.deepEqual(decodeJwtPayload(token), { role: "admin" });
  assert.equal(extractRoleFromToken(token), "ADMIN");
});

test("jwt role extraction handles alternate payload fields and invalid tokens", () => {
  assert.equal(extractRoleFromToken(createToken({ user_role: "gv" })), "GV");
  assert.equal(extractRoleFromToken(createToken({ roles: ["master"] })), "MASTER");
  assert.equal(decodeJwtPayload("invalid-token"), null);
  assert.equal(extractRoleFromToken("invalid-token"), null);
});

test("permissions are granted only to allowed roles", () => {
  assert.equal(hasAnyRole("MASTER", ["MASTER", "ADMIN"]), true);
  assert.equal(hasAnyRole("admin", ["MASTER", "ADMIN"]), true);
  assert.equal(canManageUsers("ADMIN"), true);
  assert.equal(canAccessLogs("GV"), false);
});

test("path authorization denies restricted admin pages without role", () => {
  assert.equal(canAccessPath("/admin/logs", null), false);
  assert.equal(canAccessPath("/admin/usuarios", null), false);
  assert.equal(canAccessPath("/admin/ocorrencias", null), true);
});

test("query retry policy skips auth and client errors", () => {
  assert.equal(shouldRetryQueryError(0, { status: 401 }), false);
  assert.equal(shouldRetryQueryError(0, { status: 403 }), false);
  assert.equal(shouldRetryQueryError(0, { status: 404 }), false);
  assert.equal(shouldRetryQueryError(0, { status: 422 }), false);
  assert.equal(shouldRetryQueryError(0, { status: 502 }), true);
  assert.equal(shouldRetryQueryError(2, { status: 502 }), false);
});

test("redirect target sanitizer only allows admin-relative paths", () => {
  assert.equal(sanitizeAdminRedirectTarget("/admin/logs"), "/admin/logs");
  assert.equal(sanitizeAdminRedirectTarget("/admin/usuarios?role=ADMIN"), "/admin/usuarios?role=ADMIN");
  assert.equal(sanitizeAdminRedirectTarget("/login"), "/admin");
  assert.equal(sanitizeAdminRedirectTarget("https://example.com"), "/admin");
  assert.equal(sanitizeAdminRedirectTarget("//evil.example"), "/admin");
  assert.equal(sanitizeAdminRedirectTarget(null), "/admin");
});
