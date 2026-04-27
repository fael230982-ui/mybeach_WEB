import test from "node:test";
import assert from "node:assert/strict";

import { buildPathWithQueryState, hasQueryStateChanged } from "../src/lib/url-state.ts";

test("query state builder sets, preserves and removes params", () => {
  assert.equal(
    buildPathWithQueryState("/admin/usuarios", "page=2", {
      busca: "ana",
      role: "ADMIN",
    }),
    "/admin/usuarios?page=2&busca=ana&role=ADMIN",
  );

  assert.equal(
    buildPathWithQueryState("/admin/usuarios", "page=2&role=GV", {
      busca: "",
      role: null,
    }),
    "/admin/usuarios?page=2",
  );

  assert.equal(
    buildPathWithQueryState("/admin/mapa", "focus=abc123&city=10", {
      city: null,
      beach: "22",
    }),
    "/admin/mapa?focus=abc123&beach=22",
  );
});

test("query state change detector compares full relative paths", () => {
  assert.equal(hasQueryStateChanged("/admin", "/admin"), false);
  assert.equal(hasQueryStateChanged("/admin", "/admin?periodo=7dias"), true);
});
