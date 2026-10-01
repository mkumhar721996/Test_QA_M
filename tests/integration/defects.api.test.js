const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../../src/api/app');

function validInput(overrides = {}) {
  return {
    title: 'Login button unresponsive',
    description: 'Clicking login does nothing on Safari',
    severity: 'High',
    reporter: 'Alice',
    stepsToReproduce: '1. Open app 2. Click login',
    affectedModule: 'Auth',
    ...overrides,
  };
}

async function withServer(t, fn) {
  const app = createApp();
  await new Promise((resolve) => app.listen(0, resolve));
  const { port } = app.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  t.after(() => app.close());
  return fn(baseUrl);
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return { status: res.status, json };
}

test('POST /defects with blank mandatory fields returns 400 with a per-field error', async (t) => {
  await withServer(t, async (baseUrl) => {
    const { status, json } = await postJson(`${baseUrl}/defects`, validInput({ title: '', reporter: '' }));

    assert.equal(status, 400);
    assert.ok(json.errors.title);
    assert.ok(json.errors.reporter);
  });
});

test('POST /defects fully populated returns 201 with status Open and no assignedDeveloper required', async (t) => {
  await withServer(t, async (baseUrl) => {
    const { status, json } = await postJson(`${baseUrl}/defects`, validInput());

    assert.equal(status, 201);
    assert.equal(json.status, 'Open');
    assert.ok(!json.assignedDeveloper);
  });
});

test('POST /defects/:id/transitions-to-fixed without an assigned developer is blocked (409)', async (t) => {
  await withServer(t, async (baseUrl) => {
    const created = await postJson(`${baseUrl}/defects`, validInput());
    const res = await fetch(`${baseUrl}/defects/${created.json.id}/transitions-to-fixed`, { method: 'POST' });
    const json = await res.json();

    assert.equal(res.status, 409);
    assert.equal(json.message, 'An assigned developer is required to mark this defect as Fixed');
  });
});

test('POST /defects/:id/transitions-to-fixed with an assigned developer succeeds (200)', async (t) => {
  await withServer(t, async (baseUrl) => {
    const created = await postJson(`${baseUrl}/defects`, validInput({ assignedDeveloper: 'Jane Doe' }));
    const res = await fetch(`${baseUrl}/defects/${created.json.id}/transitions-to-fixed`, { method: 'POST' });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.status, 'Fixed');
  });
});

test('PATCH /defects/:id/assigned-developer updates the displayed assignee', async (t) => {
  await withServer(t, async (baseUrl) => {
    const created = await postJson(`${baseUrl}/defects`, validInput());
    const res = await fetch(`${baseUrl}/defects/${created.json.id}/assigned-developer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedDeveloper: 'Jane Doe' }),
    });
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.assignedDeveloper, 'Jane Doe');

    const getRes = await fetch(`${baseUrl}/defects/${created.json.id}`);
    const getJson = await getRes.json();
    assert.equal(getJson.assignedDeveloper, 'Jane Doe');
  });
});

test('POST /defects/:id/transitions-to-fixed for an unknown defect returns 404, not 409', async (t) => {
  await withServer(t, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/defects/does-not-exist/transitions-to-fixed`, { method: 'POST' });
    const json = await res.json();

    assert.equal(res.status, 404);
    assert.equal(json.message, 'Defect not found');
  });
});

test('PATCH /defects/:id/assigned-developer with a non-string value returns 400', async (t) => {
  await withServer(t, async (baseUrl) => {
    const created = await postJson(`${baseUrl}/defects`, validInput());
    const res = await fetch(`${baseUrl}/defects/${created.json.id}/assigned-developer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedDeveloper: 123 }),
    });
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.ok(json.message);
  });
});

test('POST /defects with an oversized body is rejected (413) instead of exhausting memory', async (t) => {
  await withServer(t, async (baseUrl) => {
    const oversizedDescription = 'x'.repeat(2 * 1024 * 1024);
    const res = await fetch(`${baseUrl}/defects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validInput({ description: oversizedDescription })),
    });

    assert.equal(res.status, 413);
  });
});
