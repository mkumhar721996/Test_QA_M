function canTransitionToFixed(defect) {
  return typeof defect.assignedDeveloper === 'string' && defect.assignedDeveloper.trim().length > 0;
}

module.exports = { canTransitionToFixed };
