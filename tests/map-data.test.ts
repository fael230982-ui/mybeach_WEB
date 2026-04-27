import test from "node:test";
import assert from "node:assert/strict";

import { normalizeAlerts } from "../src/lib/alert-data.ts";
import { getMapPoint, parseZoneCoordinates } from "../src/lib/geo.ts";
import {
  buildMapStats,
  filterMapAlerts,
  filterMapPosts,
  filterMapZones,
  getBeachesByCity,
  getFocusedAlert,
  getMapCenter,
} from "../src/lib/map-data.ts";
import { alertFixtures, beachFixtures } from "./fixtures/alerts.fixture.ts";

const cityFixtures = [
  { id: "city-1", name: "Cidade 1", state: "SP", latitude: -23.9, longitude: -46.3 },
  { id: "city-2", name: "Cidade 2", state: "SP", latitude: -24.1, longitude: -46.5 },
];

const postFixtures = [
  { id: "post-1", beach_id: "beach-1", name: "Posto 1", latitude: -23.98, longitude: -46.31 },
  { id: "post-2", beach_id: "beach-3", name: "Posto 2", latitude: -23.95, longitude: -46.28 },
];

const zoneFixtures = [
  {
    id: "zone-1",
    city_id: "city-2",
    beach_id: "beach-3",
    name: "Zona 1",
    coordinates: [
      [-46.3, -23.9],
      [-46.31, -23.91],
      [-46.32, -23.92],
      [-46.3, -23.9],
    ],
  },
  {
    id: "zone-2",
    city_id: "city-1",
    beach_id: "beach-1",
    name: "Zona 2",
    coordinates: JSON.stringify([
      [-46.33, -23.97],
      [-46.34, -23.98],
      [-46.35, -23.99],
      [-46.33, -23.97],
    ]),
  },
];

test("map filters and stats stay consistent for local data", () => {
  const alerts = normalizeAlerts(alertFixtures);
  const filteredAlerts = filterMapAlerts(alerts, "city-1", "all");
  const filteredPosts = filterMapPosts(postFixtures, beachFixtures, "city-2", "all");
  const filteredZones = filterMapZones(zoneFixtures, "all", "beach-1");
  const stats = buildMapStats(filteredAlerts);

  assert.equal(filteredAlerts.length, 3);
  assert.equal(filteredPosts.length, 1);
  assert.equal(filteredZones.length, 1);
  assert.deepEqual(stats, { total: 3, pending: 1, active: 2, solved: 0 });
});

test("map helpers resolve beaches, focus and center deterministically", () => {
  const alerts = normalizeAlerts(alertFixtures);
  const beachesByCity = getBeachesByCity(beachFixtures, "city-1");
  const focused = getFocusedAlert(alerts, "alert-2");
  const fallbackCenter = getMapCenter({
    focusedAlert: null,
    beaches: beachFixtures,
    cities: cityFixtures,
    selectedBeachId: "beach-3",
    selectedCityId: "city-2",
  });
  const focusedCenter = getMapCenter({
    focusedAlert: focused,
    beaches: beachFixtures,
    cities: cityFixtures,
    selectedBeachId: "all",
    selectedCityId: "all",
  });

  assert.equal(beachesByCity.length, 2);
  assert.equal(focused?.id, "alert-2");
  assert.deepEqual(fallbackCenter, [-24.1, -46.5]);
  assert.deepEqual(focusedCenter, [-23.99, -46.32]);
});

test("geo helpers keep map coordinates in leaflet lat-lng order", () => {
  const point = getMapPoint({ latitude: "-23.97", longitude: "-46.33" });
  const polygon = parseZoneCoordinates(zoneFixtures[0]!);
  const polygonFromString = parseZoneCoordinates(zoneFixtures[1]!);

  assert.deepEqual(point, [-23.97, -46.33]);
  assert.deepEqual(polygon[0], [-23.9, -46.3]);
  assert.deepEqual(polygonFromString[1], [-23.98, -46.34]);
});
