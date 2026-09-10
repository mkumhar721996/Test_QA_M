function canTransitionToFixed(defect) {
  return Boolean(defect.assignedDeveloper && defect.assignedDeveloper.trim().length > 0);
}

module.exports = { canTransitionToFixed };
