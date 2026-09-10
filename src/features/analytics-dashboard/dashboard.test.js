import { test } from "node:test";
import assert from "node:assert/strict";
import { fixtureDefects } from "../../data/fixtureDefects.js";
import { createDashboard } from "./dashboard.js";
import { filterDefects, groupBySeverity, groupByModule, groupByStatus, trendSeries } from "./selectors.js";

function itemCounts(items) {
  const counts = {};
  for (const item of items) counts[item.value] = item.count;
  return counts;
}

// Panels always render every category seen in the full dataset (even at
// zero count) so a zero-count slice stays clickable; zero-fill the plain
// selector output the same way before comparing.
function zeroFilled(counts, fullDataset, groupBy) {
  const filled = { ...counts };
  for (const category of Object.keys(groupBy(fullDataset))) {
    filled[category] = filled[category] ?? 0;
  }
  return filled;
}

// AC1: four panels visible, each showing full unfiltered counts on load.
test("AC1: on load the dashboard exposes four panels with full-dataset counts", () => {
  const dashboard = createDashboard(fixtureDefects);
  const vm = dashboard.getViewModel();

  assert.ok(vm.trend, "trend panel is present");
  assert.ok(vm.severity, "severity breakdown panel is present");
  assert.ok(vm.module, "defects-by-module panel is present");
  assert.ok(vm.status, "status distribution panel is present");

  assert.deepEqual(itemCounts(vm.severity.items), groupBySeverity(fixtureDefects));
  assert.deepEqual(itemCounts(vm.module.items), groupByModule(fixtureDefects));
  assert.deepEqual(itemCounts(vm.status.items), groupByStatus(fixtureDefects));
  assert.deepEqual(vm.trend.points, trendSeries(fixtureDefects));
  assert.equal(vm.hasActiveFilters, false);
});

// AC2: clicking a data point in severity/module/status filters the other three panels.
test("AC2: clicking a severity slice filters the trend, module, and status panels", () => {
  const dashboard = createDashboard(fixtureDefects);
  dashboard.select("severity", "high");
  const vm = dashboard.getViewModel();

  const expected = filterDefects(fixtureDefects, { severity: "high" });
  assert.deepEqual(itemCounts(vm.module.items), zeroFilled(groupByModule(expected), fixtureDefects, groupByModule));
  assert.deepEqual(itemCounts(vm.status.items), zeroFilled(groupByStatus(expected), fixtureDefects, groupByStatus));
  assert.deepEqual(vm.trend.points, trendSeries(expected));

  // the source panel itself keeps showing every severity so it can be re-clicked
  assert.deepEqual(itemCounts(vm.severity.items), groupBySeverity(fixtureDefects));
  const highItem = vm.severity.items.find((item) => item.value === "high");
  assert.equal(highItem.active, true);
});

test("AC2: clicking a module bar filters the trend, severity, and status panels", () => {
  const dashboard = createDashboard(fixtureDefects);
  dashboard.select("module", "billing");
  const vm = dashboard.getViewModel();

  const expected = filterDefects(fixtureDefects, { module: "billing" });
  assert.deepEqual(itemCounts(vm.severity.items), zeroFilled(groupBySeverity(expected), fixtureDefects, groupBySeverity));
  assert.deepEqual(itemCounts(vm.status.items), zeroFilled(groupByStatus(expected), fixtureDefects, groupByStatus));
  assert.deepEqual(vm.trend.points, trendSeries(expected));
});

test("AC2: clicking a status segment filters the trend, severity, and module panels", () => {
  const dashboard = createDashboard(fixtureDefects);
  dashboard.select("status", "open");
  const vm = dashboard.getViewModel();

  const expected = filterDefects(fixtureDefects, { status: "open" });
  assert.deepEqual(itemCounts(vm.severity.items), zeroFilled(groupBySeverity(expected), fixtureDefects, groupBySeverity));
  assert.deepEqual(itemCounts(vm.module.items), zeroFilled(groupByModule(expected), fixtureDefects, groupByModule));
  assert.deepEqual(vm.trend.points, trendSeries(expected));
});

// AC3: a second cross-filter combines with the first (intersection), not replaces it.
test("AC3: selecting a module after a severity filter intersects both on the remaining panels", () => {
  const dashboard = createDashboard(fixtureDefects);
  dashboard.select("severity", "high");
  dashboard.select("module", "billing");
  const vm = dashboard.getViewModel();

  const expected = filterDefects(fixtureDefects, { severity: "high", module: "billing" });
  assert.ok(expected.length > 0);
  assert.deepEqual(vm.trend.points, trendSeries(expected));
  assert.deepEqual(itemCounts(vm.status.items), zeroFilled(groupByStatus(expected), fixtureDefects, groupByStatus));

  // each filter source panel excludes only its own dimension from its own breakdown
  const severityOnlyByModule = filterDefects(fixtureDefects, { severity: "high" }, "module");
  assert.deepEqual(itemCounts(vm.module.items), zeroFilled(groupByModule(severityOnlyByModule), fixtureDefects, groupByModule));
  const moduleOnlyBySeverity = filterDefects(fixtureDefects, { module: "billing" }, "severity");
  assert.deepEqual(itemCounts(vm.severity.items), zeroFilled(groupBySeverity(moduleOnlyBySeverity), fixtureDefects, groupBySeverity));
});

// AC4: re-clicking the active filter, or clearing, reverts to the full dataset.
test("AC4: clicking the already-active severity slice again clears that filter", () => {
  const dashboard = createDashboard(fixtureDefects);
  dashboard.select("severity", "high");
  dashboard.select("severity", "high");
  const vm = dashboard.getViewModel();

  assert.equal(vm.hasActiveFilters, false);
  assert.deepEqual(itemCounts(vm.module.items), groupByModule(fixtureDefects));
  assert.deepEqual(itemCounts(vm.status.items), groupByStatus(fixtureDefects));
  assert.deepEqual(vm.trend.points, trendSeries(fixtureDefects));
});

test("AC4: clearAll reverts every panel to the full unfiltered dataset", () => {
  const dashboard = createDashboard(fixtureDefects);
  dashboard.select("severity", "high");
  dashboard.select("module", "billing");
  dashboard.clearAll();
  const vm = dashboard.getViewModel();

  assert.equal(vm.hasActiveFilters, false);
  assert.deepEqual(itemCounts(vm.severity.items), groupBySeverity(fixtureDefects));
  assert.deepEqual(itemCounts(vm.module.items), groupByModule(fixtureDefects));
  assert.deepEqual(itemCounts(vm.status.items), groupByStatus(fixtureDefects));
  assert.deepEqual(vm.trend.points, trendSeries(fixtureDefects));
});

// AC5: the dashboard is read-only for every role that can view it.
test("AC5: the view model never exposes create, edit, or status-transition controls", () => {
  const dashboard = createDashboard(fixtureDefects);
  dashboard.select("severity", "high");
  const vm = dashboard.getViewModel();

  const serialized = JSON.stringify(vm).toLowerCase();
  for (const forbidden of ["create", "edit", "delete", "transition", "save", "new-defect"]) {
    assert.ok(!new RegExp(`\\b${forbidden}\\b`).test(serialized), `view model must not mention "${forbidden}"`);
  }
  assert.equal(vm.trend.clickable, false);
  assert.equal(vm.clearFilters.visible, true);
});
