const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { createDefectListController } = require("../../src/pages/defectListController");

const allDefects = [
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
    title: "Password reset email never arrives",
    status: "Open",
    severity: "Critical",
    module: "Authentication",
    assignedDeveloper: "Dev Patel",
  },
  {
    id: "DEF-4",
    title: "Password validation rejects valid strong passwords",
    status: "Open",
    severity: "Critical",
    module: "Authentication",
    assignedDeveloper: "Alice Chen",
  },
];

function fakeFetchDefects(criteria) {
  let result = allDefects;
  if (criteria.status) result = result.filter((d) => d.status === criteria.status);
  if (criteria.severity) result = result.filter((d) => d.severity === criteria.severity);
  if (criteria.module) result = result.filter((d) => d.module === criteria.module);
  if (criteria.search) {
    const keyword = criteria.search.toLowerCase();
    result = result.filter((d) => d.title.toLowerCase().includes(keyword));
  }
  return Promise.resolve(result);
}

describe("createDefectListController", () => {
  test("applies status, severity, module filters and a search term together with AND semantics", async () => {
    let lastRendered = null;
    const controller = createDefectListController({
      fetchDefects: fakeFetchDefects,
      onRender: (defects) => {
        lastRendered = defects;
      },
    });

    await controller.setFilter("status", "Open");
    await controller.setFilter("severity", "Critical");
    await controller.setFilter("module", "Authentication");
    await controller.setSearch("reset");

    assert.deepEqual(lastRendered.map((d) => d.id), ["DEF-3"]);
  });

  test("renders an empty list when the combined criteria match nothing", async () => {
    let lastRendered = null;
    const controller = createDefectListController({
      fetchDefects: fakeFetchDefects,
      onRender: (defects) => {
        lastRendered = defects;
      },
    });

    await controller.setFilter("status", "Closed");
    await controller.setSearch("password");

    assert.deepEqual(lastRendered, []);
  });

  test("sorts the currently fetched results and toggles direction on repeat clicks", async () => {
    let lastRendered = null;
    const controller = createDefectListController({
      fetchDefects: fakeFetchDefects,
      onRender: (defects) => {
        lastRendered = defects;
      },
    });

    await controller.setFilter("status", "Open");
    await controller.sortByColumn("title");
    assert.deepEqual(
      lastRendered.map((d) => d.id),
      ["DEF-1", "DEF-3", "DEF-4"]
    );

    await controller.sortByColumn("title");
    assert.deepEqual(
      lastRendered.map((d) => d.id),
      ["DEF-4", "DEF-3", "DEF-1"]
    );
  });
});
