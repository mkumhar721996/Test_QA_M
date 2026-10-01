const { buildDefectsQuery } =
  typeof module !== "undefined" ? require("./buildDefectsQuery") : window.DefectApp;

/**
 * Fetches defects from the API, applying the given status/severity/module
 * filters and title search as query params.
 * @param {string} baseUrl
 * @param {{status?: string, severity?: string, module?: string, search?: string}} criteria
 * @returns {Promise<import('../../../server/src/models/defect').Defect[]>}
 */
async function fetchDefects(baseUrl, criteria) {
  const query = buildDefectsQuery(criteria);
  const url = query ? `${baseUrl}/api/defects?${query}` : `${baseUrl}/api/defects`;
  const response = await fetch(url);
  return response.json();
}

if (typeof module !== "undefined") {
  module.exports = { fetchDefects };
}
if (typeof window !== "undefined") {
  window.DefectApp = Object.assign(window.DefectApp || {}, { fetchDefects });
}
