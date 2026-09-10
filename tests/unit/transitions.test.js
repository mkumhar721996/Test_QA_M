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
