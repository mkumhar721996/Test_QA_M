const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { buildDefectsQuery } = require("../../src/api/buildDefectsQuery");

describe("buildDefectsQuery", () => {
  test("returns an empty string when no criteria are active", () => {
    assert.equal(buildDefectsQuery({}), "");
  });

  test("includes only the status param when only status is set", () => {
    assert.equal(buildDefectsQuery({ status: "Open" }), "status=Open");
  });

  test("includes only the severity param when only severity is set", () => {
    assert.equal(buildDefectsQuery({ severity: "High" }), "severity=High");
  });

  test("includes only the module param when only module is set", () => {
    assert.equal(buildDefectsQuery({ module: "Checkout" }), "module=Checkout");
  });

  test("includes only the search param when only a search term is set", () => {
    assert.equal(buildDefectsQuery({ search: "login error" }), "search=login+error");
  });

  test("combines status, severity, module, and search when all are set", () => {
    const result = buildDefectsQuery({
      status: "Open",
      severity: "Critical",
      module: "Authentication",
      search: "reset",
    });
    assert.equal(result, "status=Open&severity=Critical&module=Authentication&search=reset");
  });

  test("omits empty-string criteria", () => {
    assert.equal(buildDefectsQuery({ status: "Open", severity: "", module: "", search: "" }), "status=Open");
  });
});
