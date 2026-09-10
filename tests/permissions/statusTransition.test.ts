import { test } from "node:test";
import assert from "node:assert/strict";
import { transitionStatus } from "../../src/services/defectService.ts";
import { isValidTransition } from "../../src/domain/statusWorkflow.ts";
import type { Defect, DefectStatus } from "../../src/domain/types.ts";

const ALL_STATUSES: DefectStatus[] = [
  "New",
  "InProgress",
  "Fixed",
  "Verified",
  "Closed",
  "Reopened",
];

function defectWithStatus(status: DefectStatus): Defect {
  return {
    id: "1",
    title: "Title",
    description: "Description",
    severity: "high",
    stepsToReproduce: "Steps",
    module: "billing",
    assignedDeveloper: "dev-1",
    status,
  };
}

function validTransitionPairs(): Array<[DefectStatus, DefectStatus]> {
  const pairs: Array<[DefectStatus, DefectStatus]> = [];
  for (const from of ALL_STATUSES) {
    for (const to of ALL_STATUSES) {
      if (isValidTransition(from, to)) {
        pairs.push([from, to]);
      }
    }
  }
  return pairs;
}

for (const [from, to] of validTransitionPairs()) {
  test(`AC5: tester can transition from ${from} to ${to}`, () => {
    const result = transitionStatus("tester", defectWithStatus(from), to);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.status, to);
    }
  });

  test(`AC10: manager cannot transition from ${from} to ${to}`, () => {
    const result = transitionStatus("manager", defectWithStatus(from), to);
    assert.equal(result.ok, false);
  });
}

test("AC6: developer can transition to Fixed when preconditions are met", () => {
  const result = transitionStatus("developer", defectWithStatus("InProgress"), "Fixed");
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.status, "Fixed");
  }
});

for (const [from, to] of validTransitionPairs().filter(([, to]) => to !== "Fixed")) {
  test(`AC7: developer cannot transition from ${from} to ${to}`, () => {
    const result = transitionStatus("developer", defectWithStatus(from), to);
    assert.equal(result.ok, false);
  });
}
