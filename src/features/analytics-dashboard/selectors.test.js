import { test } from "node:test";
import assert from "node:assert/strict";
import { fixtureDefects } from "../../data/fixtureDefects.js";
import {
  filterDefects,
  groupBySeverity,
  groupByModule,
  groupByStatus,
  trendSeries,
} from "./selectors.js";

test("groupBySeverity counts every defect by its severity", () => {
  const counts = groupBySeverity(fixtureDefects);
  assert.deepEqual(counts, { low: 2, medium: 3, high: 5, critical: 2 });
});

test("groupByModule counts every defect by its module", () => {
  const counts = groupByModule(fixtureDefects);
  assert.deepEqual(counts, { auth: 3, billing: 5, search: 4 });
});

test("groupByStatus counts every defect by its current status", () => {
  const counts = groupByStatus(fixtureDefects);
  assert.deepEqual(counts, { open: 5, "in-progress": 2, resolved: 1, closed: 4 });
});

test("trendSeries reports created and closed counts per month", () => {
  const series = trendSeries(fixtureDefects);
  const jan = series.find((point) => point.period === "2024-01");
  const feb = series.find((point) => point.period === "2024-02");
  assert.deepEqual(jan, { period: "2024-01", created: 4, closed: 1 });
  assert.deepEqual(feb, { period: "2024-02", created: 4, closed: 2 });
});

test("filterDefects with no active filters returns the full dataset", () => {
  const result = filterDefects(fixtureDefects, {});
  assert.equal(result.length, fixtureDefects.length);
});

test("filterDefects applies a single dimension filter", () => {
  const result = filterDefects(fixtureDefects, { severity: "high" });
  assert.equal(result.length, 5);
  assert.ok(result.every((defect) => defect.severity === "high"));
});

test("filterDefects ANDs multiple active dimensions together (intersection)", () => {
  const result = filterDefects(fixtureDefects, { severity: "high", module: "billing" });
  assert.equal(result.length, 3);
  assert.ok(result.every((defect) => defect.severity === "high" && defect.module === "billing"));
});

test("filterDefects excludes the given dimension so a panel can show its own full breakdown", () => {
  const result = filterDefects(fixtureDefects, { severity: "high", module: "billing" }, "module");
  // severity filter still applies, module filter is excluded
  assert.equal(result.length, 5);
  assert.ok(result.every((defect) => defect.severity === "high"));
});
