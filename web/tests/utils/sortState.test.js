const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { nextSortState } = require("../../src/utils/sortState");

describe("nextSortState", () => {
  test("clicking a column with no prior sort state sorts ascending", () => {
    const result = nextSortState(null, "title");
    assert.deepEqual(result, { column: "title", direction: "asc" });
  });

  test("clicking a different column than the current one sorts that column ascending", () => {
    const result = nextSortState({ column: "title", direction: "asc" }, "status");
    assert.deepEqual(result, { column: "status", direction: "asc" });
  });

  test("clicking the same column again toggles from ascending to descending", () => {
    const result = nextSortState({ column: "title", direction: "asc" }, "title");
    assert.deepEqual(result, { column: "title", direction: "desc" });
  });

  test("clicking the same column a third time toggles back to ascending", () => {
    const result = nextSortState({ column: "title", direction: "desc" }, "title");
    assert.deepEqual(result, { column: "title", direction: "asc" });
  });
});
