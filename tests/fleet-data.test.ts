import test from "node:test";
import assert from "node:assert/strict";

import { exportableFleetRows, normalizeFleetStatus } from "../src/lib/fleet-data.ts";

test("fleet status normalization accepts aliases and accents", () => {
  assert.equal(normalizeFleetStatus("Na base (parada)"), "base");
  assert.equal(normalizeFleetStatus("em uso ou alocada"), "allocated");
  assert.equal(normalizeFleetStatus("EM USO"), "allocated");
  assert.equal(normalizeFleetStatus("manutencao"), "maintenance");
  assert.equal(normalizeFleetStatus("baixada (inativa)"), "inactive");
});

test("fleet export rows normalize api 1.2 telemetry fields", () => {
  const rows = exportableFleetRows([
    {
      id: "1",
      identifier: "UR-101",
      type: "LANCHA",
      status: "em uso ou alocada",
      current_crew: "Equipe Alfa",
      base_sector: "Ponta da Praia",
      last_ping: "Agora",
      latitude: -23.9,
      longitude: -46.3,
      assigned_post_id: "post-1",
      is_operational: true,
    },
    {
      id: "2",
      prefixo: "UR-202",
      tipo: "VIATURA 4X4",
      status: "manutencao",
      equipe: "",
      base: "",
      last_ping: null,
    },
  ]);

  assert.deepEqual(rows[0], [
    "UR-101",
    "LANCHA",
    "Em Uso Ou Alocada",
    "Equipe Alfa",
    "Ponta da Praia",
    "Agora",
    "SIM",
    -23.9,
    -46.3,
    "post-1",
    "SIM",
  ]);
  assert.deepEqual(rows[1], [
    "UR-202",
    "VIATURA 4X4",
    "Manutencao",
    "Nao designada",
    "Base Central",
    "Sem ping",
    "NAO",
    "",
    "",
    "",
    "SIM",
  ]);
});
