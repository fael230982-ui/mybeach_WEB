import test from "node:test";
import assert from "node:assert/strict";

import { exportableBeachRows, exportableCityRows, exportablePostRows, exportableUserRows, exportableZoneRows } from "../src/lib/catalog-export.ts";

test("catalog export rows normalize cities, beaches and posts", () => {
  const cityRows = exportableCityRows([
    {
      id: "c1",
      name: "Santos",
      state: "SP",
      status: "ATIVO",
      qtdPraias: 4,
      qtdPostos: 6,
    },
  ] as never);

  const beachRows = exportableBeachRows(
    [
      {
        id: "b1",
        city_id: "c1",
        name: "Ponta da Praia",
        status: "INATIVO",
        area: "POLYGON(...)",
      },
    ] as never,
    [{ id: "c1", name: "Santos", state: "SP" }] as never,
  );

  const postRows = exportablePostRows(
    [
      {
        id: "p1",
        beach_id: "b1",
        name: "Posto 4",
        status: "ATIVO",
        latitude: -23.99,
        longitude: -46.31,
        radius: 500,
      },
    ] as never,
    [{ id: "b1", city_id: "c1", name: "Ponta da Praia" }] as never,
  );

  assert.deepEqual(cityRows[0], ["Santos", "SP", "Ativo", 4, 6]);
  assert.deepEqual(beachRows[0], ["Ponta da Praia", "Santos", "SP", "Inativo", "POLYGON(...)"]);
  assert.deepEqual(postRows[0], ["Posto 4", "Ponta da Praia", "Ativo", -23.99, -46.31, 500]);
});

test("catalog export rows normalize users and zones", () => {
  const userRows = exportableUserRows([
    {
      id: "u1",
      name: "Ana",
      email: "ana@mybeach.com.br",
      role: "ADMIN",
      city_name: "Santos",
      email_verified: true,
      last_ping: "2026-04-13T12:00:00.000Z",
      is_active: true,
    },
  ] as never);

  const zoneRows = exportableZoneRows(
    [{ id: "z1", beach_id: "b1", name: "Canal 6", status_level: "ALTO", coordinates: "POLYGON(...)" }] as never,
    [{ id: "b1", city_id: "c1", name: "Ponta da Praia" }] as never,
  );

  assert.deepEqual(userRows[0], [
    "Ana",
    "ana@mybeach.com.br",
    "ADMIN",
    "Santos",
    "SIM",
    "2026-04-13T12:00:00.000Z",
    "SIM",
  ]);
  assert.deepEqual(zoneRows[0], ["Canal 6", "Ponta da Praia", "ALTO", "POLYGON(...)"]);
});
