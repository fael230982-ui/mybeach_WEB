import test from "node:test";
import assert from "node:assert/strict";

import { buildApiUrl } from "../src/lib/apiClient.ts";

test("buildApiUrl normalizes endpoints with and without slash", () => {
  assert.equal(buildApiUrl("/alerts"), "/alerts");
  assert.equal(buildApiUrl("alerts"), "/alerts");
  assert.equal(buildApiUrl("/alerts/"), "/alerts");
  assert.equal(buildApiUrl("alerts/"), "/alerts");
});
