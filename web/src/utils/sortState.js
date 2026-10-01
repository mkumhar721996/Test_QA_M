/**
 * Computes the next sort state after a column header is clicked: sorts a
 * newly-clicked column ascending, and toggles direction on repeat clicks.
 * @param {{column: string, direction: "asc"|"desc"}|null} current
 * @param {string} column
 * @returns {{column: string, direction: "asc"|"desc"}}
 */
function nextSortState(current, column) {
  if (current && current.column === column) {
    return { column, direction: current.direction === "asc" ? "desc" : "asc" };
  }
  return { column, direction: "asc" };
}

if (typeof module !== "undefined") {
  module.exports = { nextSortState };
}
if (typeof window !== "undefined") {
  window.DefectApp = Object.assign(window.DefectApp || {}, { nextSortState });
}
