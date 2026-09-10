const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { sortDefects } = require("../../src/utils/sortDefects");

const defects = [
  { id: "DEF-1", title: "Banana bug", status: "Open", severity: "Low", module: "Search", assignedDeveloper: "Zoe" },
  { id: "DEF-2", title: "Apple bug", status: "Closed", severity: "High", module: "Cart", assignedDeveloper: "Amy" },
  { id: "DEF-3", title: "Cherry bug", status: "In Progress", severity: "Medium", module: "Profile", assignedDeveloper: "Max" },
];

describe("sortDefects", () => {
  test("sorts by title ascending", () => {
    const result = sortDefects(defects, "title", "asc");
    assert.deepEqual(result.map((d) => d.id), ["DEF-2", "DEF-1", "DEF-3"]);
  });

  test("sorts by title descending", () => {
    const result = sortDefects(defects, "title", "desc");
    assert.deepEqual(result.map((d) => d.id), ["DEF-3", "DEF-1", "DEF-2"]);
  });

  test("sorts by severity ascending using textual comparison", () => {
    const result = sortDefects(defects, "severity", "asc");
    assert.deepEqual(result.map((d) => d.id), ["DEF-2", "DEF-1", "DEF-3"]);
  });

  test("sorts by module descending", () => {
    const result = sortDefects(defects, "module", "desc");
    assert.deepEqual(result.map((d) => d.id), ["DEF-1", "DEF-3", "DEF-2"]);
  });

  test("sorts by assignedDeveloper ascending", () => {
    const result = sortDefects(defects, "assignedDeveloper", "asc");
    assert.deepEqual(result.map((d) => d.id), ["DEF-2", "DEF-3", "DEF-1"]);
  });

  test("does not mutate the original array", () => {
    const original = [...defects];
    sortDefects(defects, "title", "asc");
    assert.deepEqual(defects, original);
  });
});
