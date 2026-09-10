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

function validateDefectInput(input) {
  const errors = {};

  for (const { key, label } of MANDATORY_FIELDS) {
    if (isBlank(input[key])) {
      errors[key] = `${label} is required`;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateDefectInput, MANDATORY_FIELDS };
