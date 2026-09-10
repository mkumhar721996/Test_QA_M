const test = require('node:test');
const assert = require('node:assert/strict');
const { createDefectService } = require('../../src/services/defectService');
const { DefectStatus } = require('../../src/domain/defect');
const { canTransitionToFixed } = require('../../src/domain/transitions');

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

test('transitionToFixed: blocked when no developer is assigned, status unchanged', () => {
  const service = createDefectService();
  const { defect } = service.createDefect(validInput());

  const result = service.transitionToFixed(defect.id);

  assert.equal(result.success, false);
  assert.equal(
    result.message,
    'An assigned developer is required to mark this defect as Fixed'
  );
  assert.equal(service.getDefect(defect.id).status, DefectStatus.OPEN);
});

test('transitionToFixed: succeeds when a developer is assigned', () => {
  const service = createDefectService();
  const { defect } = service.createDefect(validInput({ assignedDeveloper: 'Jane Doe' }));

  const result = service.transitionToFixed(defect.id);

  assert.equal(result.success, true);
  assert.equal(result.defect.status, DefectStatus.FIXED);
  assert.equal(service.getDefect(defect.id).status, DefectStatus.FIXED);
});

test('transitionToFixed: unknown defect id is distinguishable from a missing developer', () => {
  const service = createDefectService();

  const result = service.transitionToFixed('does-not-exist');

  assert.equal(result.success, false);
  assert.equal(result.reason, 'NOT_FOUND');
  assert.notEqual(result.reason, 'DEVELOPER_REQUIRED');
});

test('canTransitionToFixed: a non-string assignedDeveloper is treated as unassigned, not a crash', () => {
  assert.equal(canTransitionToFixed({ assignedDeveloper: 123 }), false);
  assert.equal(canTransitionToFixed({}), false);
});
