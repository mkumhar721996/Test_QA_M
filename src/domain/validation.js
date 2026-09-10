const MANDATORY_FIELDS = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'severity', label: 'Severity' },
  { key: 'reporter', label: 'Reporter' },
  { key: 'stepsToReproduce', label: 'Steps to reproduce' },
  { key: 'affectedModule', label: 'Affected module' },
];

function isBlank(value) {
  return typeof value !== 'string' || value.trim().length === 0;
}

function isValidAssignedDeveloper(value) {
  return value === undefined || value === null || typeof value === 'string';
}

function validateDefectInput(input) {
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: { _form: 'Defect input must be an object' } };
  }

  const errors = {};

  for (const { key, label } of MANDATORY_FIELDS) {
    if (isBlank(input[key])) {
      errors[key] = `${label} is required`;
    }
  }

  if (!isValidAssignedDeveloper(input.assignedDeveloper)) {
    errors.assignedDeveloper = 'Assigned developer must be text';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateDefectInput, isValidAssignedDeveloper, MANDATORY_FIELDS };
