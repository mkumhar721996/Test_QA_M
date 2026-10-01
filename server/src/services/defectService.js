/**
 * Filters defects by exact-match status, severity, and/or module criteria,
 * combined with AND semantics. Omitted criteria are not applied.
 * @param {import('../models/defect').Defect[]} defects
 * @param {{status?: string, severity?: string, module?: string}} criteria
 * @returns {import('../models/defect').Defect[]}
 */
function filterDefects(defects, criteria) {
  const { status, severity, module } = criteria || {};
  return defects.filter((defect) => {
    if (status && defect.status !== status) return false;
    if (severity && defect.severity !== severity) return false;
    if (module && defect.module !== module) return false;
    return true;
  });
}

/**
 * Returns defects whose title contains the given keyword, case-insensitively.
 * An empty/whitespace keyword matches all defects.
 * @param {import('../models/defect').Defect[]} defects
 * @param {string} keyword
 * @returns {import('../models/defect').Defect[]}
 */
function searchDefectsByTitle(defects, keyword) {
  const trimmed = (keyword || "").trim().toLowerCase();
  if (!trimmed) return defects;
  return defects.filter((defect) => defect.title.toLowerCase().includes(trimmed));
}

module.exports = { filterDefects, searchDefectsByTitle };
