import { test } from "node:test";
import assert from "node:assert/strict";
import { updateDefectField } from "../../src/services/defectService.ts";
import { EDITABLE_FIELDS } from "../../src/domain/types.ts";
import type { Defect } from "../../src/domain/types.ts";

function baseDefect(): Defect {
  return {
    id: "1",
    title: "Original title",
    description: "Original description",
    severity: "low",
    stepsToReproduce: "Original steps",
    module: "billing",
    assignedDeveloper: "dev-1",
    status: "New",
  };
}

for (const field of EDITABLE_FIELDS) {
  test(`AC2: developer cannot edit ${field}`, () => {
    const result = updateDefectField("developer", baseDefect(), field, "new value");
    assert.equal(result.ok, false);
  });

  test(`AC4: tester can edit ${field}`, () => {
    const defect = baseDefect();
    const result = updateDefectField("tester", defect, field, "new value");
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value[field], "new value");
    }
  });

  test(`AC9: manager cannot edit ${field}`, () => {
    const result = updateDefectField("manager", baseDefect(), field, "new value");
    assert.equal(result.ok, false);
  });
}
