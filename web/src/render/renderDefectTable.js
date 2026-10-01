const COLUMNS = [
  { column: "title", label: "Title" },
  { column: "status", label: "Status" },
  { column: "severity", label: "Severity" },
  { column: "module", label: "Module" },
  { column: "assignedDeveloper", label: "Assigned Developer" },
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHeaderCell({ column, label }, sortState) {
  const isActive = sortState && sortState.column === column;
  const sortAttr = isActive ? ` data-sort-direction="${sortState.direction}"` : "";
  return `<th data-column="${column}"${sortAttr}>${escapeHtml(label)}</th>`;
}

function renderRow(defect) {
  return `<tr>${COLUMNS.map(({ column }) => `<td>${escapeHtml(defect[column])}</td>`).join("")}</tr>`;
}

/**
 * Renders the defect list as an HTML table, or an empty-state message when
 * there are no defects to display.
 * @param {import('../../../server/src/models/defect').Defect[]} defects
 * @param {{column: string, direction: "asc"|"desc"}|null} sortState
 * @returns {string}
 */
function renderDefectTable(defects, sortState) {
  const headerRow = `<tr>${COLUMNS.map((c) => renderHeaderCell(c, sortState)).join("")}</tr>`;

  if (defects.length === 0) {
    return `<table><thead>${headerRow}</thead></table><p class="empty-state">No defects found</p>`;
  }

  const bodyRows = defects.map(renderRow).join("");
  return `<table><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table>`;
}

if (typeof module !== "undefined") {
  module.exports = { renderDefectTable, COLUMNS };
}
if (typeof window !== "undefined") {
  window.DefectApp = Object.assign(window.DefectApp || {}, { renderDefectTable, COLUMNS });
}
