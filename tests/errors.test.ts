import test from "node:test";
import assert from "node:assert/strict";

import { extractApiErrorMessage, shouldRetryQueryError } from "../src/lib/errors.ts";

test("api error message prefers structured validation detail", () => {
  const message = extractApiErrorMessage(
    {
      message: "Erro generico",
      body: {
        detail: [
          { loc: ["body", "email"], msg: "Campo obrigatório" },
          { loc: ["body", "role"], msg: "Valor inválido" },
        ],
      },
    },
    "Fallback",
  );

  assert.equal(message, "email: Campo obrigatório | role: Valor inválido");
});

test("api error message falls back to string detail and message", () => {
  assert.equal(
    extractApiErrorMessage({ message: "Erro genérico", body: { detail: "Sem permissão" } }, "Fallback"),
    "Sem permissão",
  );
  assert.equal(extractApiErrorMessage({ message: "Backend offline" }, "Fallback"), "Backend offline");
});

test("query retry helper retries only transient failures", () => {
  assert.equal(shouldRetryQueryError(0, { status: 500 }), true);
  assert.equal(shouldRetryQueryError(1, { status: 502 }), true);
  assert.equal(shouldRetryQueryError(2, { status: 503 }), false);
  assert.equal(shouldRetryQueryError(0, { status: 401 }), false);
  assert.equal(shouldRetryQueryError(0, { status: 422 }), false);
});
