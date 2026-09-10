import { test } from "node:test";
import assert from "node:assert/strict";
import { createDefect } from "../../src/services/defectService.ts";
import type { Defect } from "../../src/domain/types.ts";

function newDefectInput(): Defect {
  return {
    id: "new-1",
    title: "New defect",
    description: "desc",
    severity: "medium",
    stepsToReproduce: "steps",
    module: "checkout",
    assignedDeveloper: "dev-2",
    status: "New",
  };
}

test("AC3: tester can create a new defect", () => {
  const input = newDefectInput();
  const result = createDefect("tester", input, []);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.value, [input]);
  }
});

test("AC8: manager cannot create a defect", () => {
  const input = newDefectInput();
  const result = createDefect("manager", input, []);
  assert.equal(result.ok, false);
});
