const test = require('node:test');
const assert = require('node:assert/strict');
const { validateDefectInput } = require('../../src/domain/validation');

const MANDATORY_FIELDS = [
  'title',
  'description',
  'severity',
  'reporter',
  'stepsToReproduce',
  'affectedModule',
];

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

test('validateDefectInput: all mandatory fields present is valid', () => {
  const result = validateDefectInput(validInput());
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

for (const field of MANDATORY_FIELDS) {
  test(`validateDefectInput: blank ${field} is rejected and individually flagged`, () => {
    const result = validateDefectInput(validInput({ [field]: '' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors[field], `expected an error for ${field}`);
  });

  test(`validateDefectInput: whitespace-only ${field} is rejected`, () => {
    const result = validateDefectInput(validInput({ [field]: '   ' }));
    assert.equal(result.valid, false);
    assert.ok(result.errors[field], `expected an error for ${field}`);
  });
}

test('validateDefectInput: multiple blank fields are each individually flagged, not short-circuited', () => {
  const result = validateDefectInput(
    validInput({ title: '', severity: '', affectedModule: '' })
  );
  assert.equal(result.valid, false);
  assert.ok(result.errors.title);
  assert.ok(result.errors.severity);
  assert.ok(result.errors.affectedModule);
  assert.equal(result.errors.description, undefined);
  assert.equal(result.errors.reporter, undefined);
  assert.equal(result.errors.stepsToReproduce, undefined);
});

test('validateDefectInput: assignedDeveloper is optional (blank/omitted is valid)', () => {
  const blank = validateDefectInput(validInput({ assignedDeveloper: '' }));
  assert.equal(blank.valid, true);
  assert.equal(blank.errors.assignedDeveloper, undefined);

  const omitted = validateDefectInput(validInput());
  delete omitted.assignedDeveloper;
  assert.equal(omitted.valid, true);
});
