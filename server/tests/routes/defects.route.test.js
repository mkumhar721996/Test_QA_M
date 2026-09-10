const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { createApp } = require("../../src/app");

let server;
let baseUrl;

before(async () => {
  const app = createApp();
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe("GET /api/defects", () => {
  test("returns 200 and every defect includes title, status, severity, module, assignedDeveloper", async () => {
    const res = await fetch(`${baseUrl}/api/defects`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
    for (const defect of body) {
      assert.equal(typeof defect.title, "string");
      assert.equal(typeof defect.status, "string");
      assert.equal(typeof defect.severity, "string");
      assert.equal(typeof defect.module, "string");
      assert.equal(typeof defect.assignedDeveloper, "string");
    }
  });

  test("honors the status query param", async () => {
    const res = await fetch(`${baseUrl}/api/defects?status=Open`);
    const body = await res.json();
    assert.ok(body.length > 0);
    assert.ok(body.every((d) => d.status === "Open"));
  });

  test("honors the severity query param", async () => {
    const res = await fetch(`${baseUrl}/api/defects?severity=Critical`);
    const body = await res.json();
    assert.ok(body.length > 0);
    assert.ok(body.every((d) => d.severity === "Critical"));
  });

  test("honors the module query param", async () => {
    const res = await fetch(`${baseUrl}/api/defects?module=Checkout`);
    const body = await res.json();
    assert.ok(body.length > 0);
    assert.ok(body.every((d) => d.module === "Checkout"));
  });

  test("honors the search query param case-insensitively against title", async () => {
    const res = await fetch(`${baseUrl}/api/defects?search=PASSWORD`);
    const body = await res.json();
    assert.ok(body.length > 0);
    assert.ok(body.every((d) => d.title.toLowerCase().includes("password")));
  });

  test("combines status, severity, module, and search with AND semantics", async () => {
    const res = await fetch(
      `${baseUrl}/api/defects?status=Open&severity=Critical&module=Authentication&search=reset`
    );
    const body = await res.json();
    assert.deepEqual(
      body.map((d) => d.id),
      ["DEF-5"]
    );
  });

  test("returns an empty array when no defect matches the filters", async () => {
    const res = await fetch(`${baseUrl}/api/defects?status=Closed&severity=Critical`);
    const body = await res.json();
    assert.deepEqual(body, []);
  });
});
