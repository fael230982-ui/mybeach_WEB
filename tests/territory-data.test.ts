import test from "node:test";
import assert from "node:assert/strict";

import {
  filterBeachesByCity,
  getBeachPresetCenter,
  getCityMapCenter,
  getCityPresetCenter,
  getOperationalBeachCenter,
} from "../src/lib/territory-data.ts";
import { beachFixtures } from "./fixtures/alerts.fixture.ts";

test("territory helpers return known preset centers for cities and beaches", () => {
  assert.deepEqual(getCityPresetCenter("Guaruja"), [-23.9934, -46.2564]);
  assert.deepEqual(
    getCityMapCenter({ id: "1", name: "Cidade X", state: "SP", latitude: -23.9, longitude: -46.2 }),
    [-23.9, -46.2],
  );
  assert.deepEqual(
    getBeachPresetCenter({ id: "b1", city_id: "1", name: "Praia das Pitangueiras" }),
    [-23.9984, -46.2575],
  );
});

test("territory helpers prefer explicit beach coordinates and filter by city", () => {
  const beachWithCoordinates = {
    id: "b2",
    city_id: "city-1",
    name: "Praia Custom",
    latitude: -23.88,
    longitude: -46.11,
  };

  assert.deepEqual(getOperationalBeachCenter(beachWithCoordinates), [-23.88, -46.11]);
  assert.equal(filterBeachesByCity(beachFixtures, "city-1").length, 2);
  assert.equal(filterBeachesByCity(beachFixtures, "").length, 4);
});
