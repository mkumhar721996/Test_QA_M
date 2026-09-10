const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { renderDefectTable } = require("../../src/render/renderDefectTable");

const defects = [
  {
    id: "DEF-1",
    title: "Login page throws error",
    status: "Open",
    severity: "High",
    module: "Authentication",
    assignedDeveloper: "Alice Chen",
  },
  {
    id: "DEF-2",
    title: "Checkout button unresponsive",
    status: "In Progress",
    severity: "Critical",
    module: "Checkout",
    assignedDeveloper: "Bilal Khan",
  },
];

describe("renderDefectTable", () => {
  test("renders title, status, severity, module, and assigned developer for every defect", () => {
    const html = renderDefectTable(defects, null);
    for (const defect of defects) {
      assert.ok(html.includes(defect.title), `expected html to include title "${defect.title}"`);
      assert.ok(html.includes(defect.status));
      assert.ok(html.includes(defect.severity));
      assert.ok(html.includes(defect.module));
      assert.ok(html.includes(defect.assignedDeveloper));
    }
  });

  test("renders a sortable header for each of the five visible columns", () => {
    const html = renderDefectTable(defects, null);
    for (const column of ["title", "status", "severity", "module", "assignedDeveloper"]) {
      assert.ok(
        html.includes(`data-column="${column}"`),
        `expected a clickable header for column "${column}"`
      );
    }
  });

  test("marks the active sort column and direction on the header", () => {
    const html = renderDefectTable(defects, { column: "severity", direction: "desc" });
    assert.ok(html.includes('data-column="severity" data-sort-direction="desc"'));
  });

  test("renders an empty-state message instead of table rows when there are no matching defects", () => {
    const html = renderDefectTable([], null);
    assert.ok(html.includes("No defects found"));
    assert.ok(!html.includes("<td"));
  });
});
