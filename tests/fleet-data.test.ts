import test from "node:test";
import assert from "node:assert/strict";

import { exportableFleetRows, normalizeFleetStatus } from "../src/lib/fleet-data.ts";

test("fleet status normalization accepts aliases and accents", () => {
  assert.equal(normalizeFleetStatus("Na base (parada)"), "base");
  assert.equal(normalizeFleetStatus("em uso ou alocada"), "allocated");
  assert.equal(normalizeFleetStatus("EM USO"), "allocated");
  assert.equal(normalizeFleetStatus("manutenção"), "maintenance");
  assert.equal(normalizeFleetStatus("baixada (inativa)"), "inactive");
});

test("fleet export rows normalize identifier, status and ping state", () => {
  const rows = exportableFleetRows([
    {
      id: "1",
      identifier: "UR-101",
      type: "LANCHA",
      status: "em uso ou alocada",
      equipe: "Equipe Alfa",
      base: "Ponta da Praia",
      last_ping: "Agora",
    },
    {
      id: "2",
      prefixo: "UR-202",
      tipo: "VIATURA 4X4",
      status: "manutencao",
      equipe: "",
      base: "",
      last_ping: null as never,
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
  ]);
  assert.deepEqual(rows[1], [
    "UR-202",
    "VIATURA 4X4",
    "Manutencao",
    "Não designada",
    "Base Central",
    "Sem ping",
    "NÃO",
  ]);
});
