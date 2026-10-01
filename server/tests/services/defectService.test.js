const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { filterDefects, searchDefectsByTitle } = require("../../src/services/defectService");

const defects = [
  {
    id: "DEF-1",
    title: "Login page throws error on invalid password",
    status: "Open",
    severity: "High",
    module: "Authentication",
    assignedDeveloper: "Alice Chen",
  },
  {
    id: "DEF-2",
    title: "Checkout button unresponsive on mobile",
    status: "In Progress",
    severity: "Critical",
    module: "Checkout",
    assignedDeveloper: "Bilal Khan",
  },
  {
    id: "DEF-3",
    title: "Search results pagination skips last page",
    status: "Resolved",
    severity: "Medium",
    module: "Search",
    assignedDeveloper: "Carla Diaz",
  },
  {
    id: "DEF-4",
    title: "Password reset email never arrives",
    status: "Open",
    severity: "Critical",
    module: "Authentication",
    assignedDeveloper: "Dev Patel",
  },
];

describe("filterDefects", () => {
  test("returns only defects matching the given status", () => {
    const result = filterDefects(defects, { status: "Open" });
    assert.deepEqual(result.map((d) => d.id), ["DEF-1", "DEF-4"]);
  });

  test("returns only defects matching the given severity", () => {
    const result = filterDefects(defects, { severity: "Critical" });
    assert.deepEqual(result.map((d) => d.id), ["DEF-2", "DEF-4"]);
  });

  test("returns only defects matching the given module", () => {
    const result = filterDefects(defects, { module: "Authentication" });
    assert.deepEqual(result.map((d) => d.id), ["DEF-1", "DEF-4"]);
  });

  test("combines status, severity, and module filters with AND semantics", () => {
    const result = filterDefects(defects, {
      status: "Open",
      severity: "Critical",
      module: "Authentication",
    });
    assert.deepEqual(result.map((d) => d.id), ["DEF-4"]);
  });

  test("returns all defects when no filters are given", () => {
    const result = filterDefects(defects, {});
    assert.equal(result.length, defects.length);
  });
});

describe("searchDefectsByTitle", () => {
  test("matches titles containing the keyword case-insensitively", () => {
    const result = searchDefectsByTitle(defects, "pAsSwOrD");
    assert.deepEqual(result.map((d) => d.id).sort(), ["DEF-1", "DEF-4"]);
  });

  test("excludes titles that do not contain the keyword", () => {
    const result = searchDefectsByTitle(defects, "checkout");
    assert.deepEqual(result.map((d) => d.id), ["DEF-2"]);
  });

  test("returns all defects when the keyword is empty", () => {
    const result = searchDefectsByTitle(defects, "");
    assert.equal(result.length, defects.length);
  });
});

describe("filterDefects and searchDefectsByTitle combined", () => {
  test("applies filters and search together with AND semantics, not OR", () => {
    const filtered = filterDefects(defects, { status: "Open", severity: "Critical" });
    const result = searchDefectsByTitle(filtered, "password reset");
    assert.deepEqual(result.map((d) => d.id), ["DEF-4"]);
  });

  test("returns an empty array when no defect satisfies all criteria", () => {
    const filtered = filterDefects(defects, { status: "Closed" });
    const result = searchDefectsByTitle(filtered, "login");
    assert.deepEqual(result, []);
  });
});
