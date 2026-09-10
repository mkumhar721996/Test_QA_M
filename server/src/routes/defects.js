const { filterDefects, searchDefectsByTitle } = require("../services/defectService");

/**
 * Handles GET /api/defects: applies status/severity/module filters and a
 * title search from query params, then responds with the matching defects.
 * @param {import('../models/defect').Defect[]} defects
 * @param {URLSearchParams} query
 * @returns {import('../models/defect').Defect[]}
 */
function handleGetDefects(defects, query) {
  const filtered = filterDefects(defects, {
    status: query.get("status") || undefined,
    severity: query.get("severity") || undefined,
    module: query.get("module") || undefined,
  });
  return searchDefectsByTitle(filtered, query.get("search") || "");
}

module.exports = { handleGetDefects };
