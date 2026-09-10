import { test } from "node:test";
import assert from "node:assert/strict";
import { createCrossFilterStore } from "./crossFilterStore.js";

test("starts with no active filters", () => {
  const store = createCrossFilterStore();
  assert.deepEqual(store.getActiveFilters(), {});
});

test("select sets an active value for a dimension", () => {
  const store = createCrossFilterStore();
  store.select("severity", "high");
  assert.deepEqual(store.getActiveFilters(), { severity: "high" });
});

test("selecting a different dimension keeps prior selections (intersection)", () => {
  const store = createCrossFilterStore();
  store.select("severity", "high");
  store.select("module", "billing");
  assert.deepEqual(store.getActiveFilters(), { severity: "high", module: "billing" });
});

test("re-selecting the same active value toggles the dimension off", () => {
  const store = createCrossFilterStore();
  store.select("severity", "high");
  store.select("severity", "high");
  assert.deepEqual(store.getActiveFilters(), {});
});

test("selecting a new value for an already-active dimension replaces it", () => {
  const store = createCrossFilterStore();
  store.select("severity", "high");
  store.select("severity", "low");
  assert.deepEqual(store.getActiveFilters(), { severity: "low" });
});

test("clearAll removes every active filter dimension", () => {
  const store = createCrossFilterStore();
  store.select("severity", "high");
  store.select("module", "billing");
  store.clearAll();
  assert.deepEqual(store.getActiveFilters(), {});
});

test("notifies subscribers whenever the active filters change", () => {
  const store = createCrossFilterStore();
  let notifications = 0;
  store.subscribe(() => {
    notifications += 1;
  });
  store.select("severity", "high");
  store.clearAll();
  assert.equal(notifications, 2);
});
