import test from "node:test";
import assert from "node:assert/strict";

import { beachFormSchema, managedUserSchema, postFormSchema, zoneFormSchema } from "../src/lib/schemas.ts";

test("managed user schema validates required fields", () => {
  const result = managedUserSchema.safeParse({
    name: "Equipe Central",
    email: "equipe@mybeach.com.br",
    password: "123456",
    role: "ADMIN",
  });

  assert.equal(result.success, true);
});

test("post schema rejects invalid coordinates", () => {
  const result = postFormSchema.safeParse({
    name: "Posto 1",
    beach_id: "praia-1",
    latitude: "",
    longitude: "",
    radius: 500,
  });

  assert.equal(result.success, false);
});

test("territorial schemas accept valid beach and zone payloads", () => {
  const beachResult = beachFormSchema.safeParse({
    name: "Praia Central",
    city_id: "1",
    area: "POLYGON((-46 -23,-46 -24,-45 -24,-46 -23))",
    is_active: true,
  });

  const zoneResult = zoneFormSchema.safeParse({
    name: "Corrente de retorno",
    beach_id: "1",
    status_level: "ALTO",
    coordinates: [
      [-46.0, -23.0],
      [-46.1, -23.1],
      [-46.2, -23.2],
      [-46.0, -23.0],
    ],
  });

  assert.equal(beachResult.success, true);
  assert.equal(zoneResult.success, true);
});
