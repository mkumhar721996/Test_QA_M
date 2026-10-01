/**
 * Returns a new array of defects sorted by the given column.
 * @param {import('../../../server/src/models/defect').Defect[]} defects
 * @param {"title"|"status"|"severity"|"module"|"assignedDeveloper"} column
 * @param {"asc"|"desc"} direction
 */
function sortDefects(defects, column, direction) {
  const factor = direction === "desc" ? -1 : 1;
  return [...defects].sort((a, b) => {
    const aValue = String(a[column]).toLowerCase();
    const bValue = String(b[column]).toLowerCase();
    if (aValue < bValue) return -1 * factor;
    if (aValue > bValue) return 1 * factor;
    return 0;
  });
}

if (typeof module !== "undefined") {
  module.exports = { sortDefects };
}
if (typeof window !== "undefined") {
  window.DefectApp = Object.assign(window.DefectApp || {}, { sortDefects });
}
