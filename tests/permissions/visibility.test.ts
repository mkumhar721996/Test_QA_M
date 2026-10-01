import { test } from "node:test";
import assert from "node:assert/strict";
import { listDefects } from "../../src/services/defectService.ts";
import type { Defect, Role } from "../../src/domain/types.ts";

function makeDefect(id: string, module: string): Defect {
  return {
    id,
    title: `Defect ${id}`,
    description: "desc",
    severity: "high",
    stepsToReproduce: "steps",
    module,
    assignedDeveloper: "dev-1",
    status: "New",
  };
}

const defects: Defect[] = [
  makeDefect("1", "billing"),
  makeDefect("2", "auth"),
  makeDefect("3", "reporting"),
];

const roles: Role[] = ["tester", "developer", "manager"];

for (const role of roles) {
  test(`AC1: ${role} sees all defects regardless of module or team`, () => {
    const result = listDefects(role, defects);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.value, defects);
    }
  });
}
