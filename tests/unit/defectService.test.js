const test = require('node:test');
const assert = require('node:assert/strict');
const { createDefectService } = require('../../src/services/defectService');
const { DefectStatus } = require('../../src/domain/defect');

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

test('createDefect: with all mandatory fields populated, saves and is retrievable', () => {
  const service = createDefectService();
  const result = service.createDefect(validInput());

  assert.equal(result.valid, true);
  assert.ok(result.defect.id);

  const fetched = service.getDefect(result.defect.id);
  assert.ok(fetched);
  assert.equal(fetched.title, 'Login button unresponsive');
});

test('createDefect: with all mandatory fields populated, defect status defaults to Open', () => {
  const service = createDefectService();
  const result = service.createDefect(validInput());

  assert.equal(result.valid, true);
  assert.equal(result.defect.status, DefectStatus.OPEN);
});

test('createDefect: with a mandatory field blank, returns validation errors and does not save', () => {
  const service = createDefectService();
  const result = service.createDefect(validInput({ title: '' }));

  assert.equal(result.valid, false);
  assert.ok(result.errors.title);
  assert.equal(result.defect, undefined);
});

test('createDefect: assignedDeveloper omitted still saves successfully with it empty', () => {
  const service = createDefectService();
  const input = validInput();
  delete input.assignedDeveloper;
  const result = service.createDefect(input);

  assert.equal(result.valid, true);
  assert.ok(!result.defect.assignedDeveloper);
});

test('updateAssignedDeveloper: updates the assignee on a saved defect', () => {
  const service = createDefectService();
  const { defect } = service.createDefect(validInput());

  const result = service.updateAssignedDeveloper(defect.id, 'Jane Doe');
  assert.equal(result.success, true);
  assert.equal(result.defect.assignedDeveloper, 'Jane Doe');

  const fetched = service.getDefect(defect.id);
  assert.equal(fetched.assignedDeveloper, 'Jane Doe');
});

test('updateAssignedDeveloper: unknown defect id is reported as not found', () => {
  const service = createDefectService();

  const result = service.updateAssignedDeveloper('does-not-exist', 'Jane Doe');

  assert.equal(result.success, false);
  assert.equal(result.reason, 'NOT_FOUND');
});

test('updateAssignedDeveloper: rejects a non-string value without crashing', () => {
  const service = createDefectService();
  const { defect } = service.createDefect(validInput());

  const result = service.updateAssignedDeveloper(defect.id, 123);

  assert.equal(result.success, false);
  assert.equal(result.reason, 'INVALID_INPUT');
  assert.equal(service.getDefect(defect.id).assignedDeveloper, undefined);
});
