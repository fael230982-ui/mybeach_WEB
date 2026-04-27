import test from "node:test";
import assert from "node:assert/strict";

import { buildCsvContent, csvField } from "../src/lib/csv.ts";

test("csvField quotes values and escapes inner quotes", () => {
  assert.equal(csvField('Praia "A"'), '"Praia ""A"""');
  assert.equal(csvField(null), '""');
  assert.equal(csvField(12), '"12"');
});

test("buildCsvContent keeps header row and encoded data order", () => {
  const csv = buildCsvContent(
    ["NOME", "CIDADE", "OBS"],
    [
      ["José", "Guarujá", 'Falou "ok"'],
      ["Ana", "Santos", null],
    ],
  );

  assert.equal(
    csv,
    'NOME,CIDADE,OBS\n"José","Guarujá","Falou ""ok"""\n"Ana","Santos",""',
  );
});
