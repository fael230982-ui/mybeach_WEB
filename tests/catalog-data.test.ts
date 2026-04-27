import test from "node:test";
import assert from "node:assert/strict";

import {
  filterBeachCatalog,
  filterPostCatalog,
  normalizeBeachStatus,
  normalizePostStatus,
} from "../src/lib/catalog-data.ts";

const beachFixtures = [
  { id: "b1", city_id: "c1", name: "Praia Central", area: "Faixa sul", status: undefined },
  { id: "b2", city_id: "c2", name: "Praia do Forte", area: "Faixa norte", status: "inativo" },
  { id: "b3", city_id: "c1", name: "Enseada Azul", area: "Area leste", status: "ativo" },
];

const cityFixtures = [
  { id: "c1", name: "Guaruja", state: "SP" },
  { id: "c2", name: "Santos", state: "SP" },
];

const postFixtures = [
  { id: "p1", beach_id: "b1", name: "Posto 1", status: undefined },
  { id: "p2", beach_id: "b2", name: "Base Forte", status: "inativo" },
  { id: "p3", beach_id: "b3", name: "Posto Enseada", status: "ativo" },
];

test("catalog helpers normalize beach and post statuses", () => {
  const beaches = normalizeBeachStatus(beachFixtures);
  const posts = normalizePostStatus(postFixtures);

  assert.equal(beaches[0]?.status, "ATIVO");
  assert.equal(beaches[1]?.status, "INATIVO");
  assert.equal(posts[0]?.status, "ATIVO");
  assert.equal(posts[1]?.status, "INATIVO");
});

test("catalog helpers filter beaches by city, search and sort", () => {
  const beaches = normalizeBeachStatus(beachFixtures);
  const filtered = filterBeachCatalog({
    beaches,
    cities: cityFixtures,
    cityFilter: "c1",
    search: "guaruja",
    sort: "ZA",
  });

  assert.deepEqual(filtered.map((item) => item.id), ["b1", "b3"]);
});

test("catalog helpers filter posts by city, beach and search", () => {
  const beaches = normalizeBeachStatus(beachFixtures);
  const posts = normalizePostStatus(postFixtures);
  const filtered = filterPostCatalog({
    posts,
    beaches,
    cityFilter: "c1",
    beachFilter: "b3",
    search: "enseada",
  });

  assert.deepEqual(filtered.map((item) => item.id), ["p3"]);
});
