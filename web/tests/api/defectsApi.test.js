const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { fetchDefects } = require("../../src/api/defectsApi");

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe("fetchDefects", () => {
  test("requests /api/defects with the active criteria as query params", async () => {
    let requestedUrl = null;
    global.fetch = async (url) => {
      requestedUrl = url;
      return { json: async () => [] };
    };

    await fetchDefects("http://localhost:8005", { status: "Open", search: "login" });

    assert.equal(requestedUrl, "http://localhost:8005/api/defects?status=Open&search=login");
  });

  test("requests the bare endpoint when no criteria are active", async () => {
    let requestedUrl = null;
    global.fetch = async (url) => {
      requestedUrl = url;
      return { json: async () => [] };
    };

    await fetchDefects("http://localhost:8005", {});

    assert.equal(requestedUrl, "http://localhost:8005/api/defects");
  });

  test("resolves with the parsed JSON body", async () => {
    global.fetch = async () => ({ json: async () => [{ id: "DEF-1" }] });

    const result = await fetchDefects("http://localhost:8005", {});

    assert.deepEqual(result, [{ id: "DEF-1" }]);
  });
});
