/**
 * Builds a query string from the currently active status/severity/module
 * filters and title search term, omitting any that are unset.
 * @param {{status?: string, severity?: string, module?: string, search?: string}} criteria
 * @returns {string}
 */
function buildDefectsQuery(criteria) {
  const params = new URLSearchParams();
  const { status, severity, module, search } = criteria || {};
  if (status) params.set("status", status);
  if (severity) params.set("severity", severity);
  if (module) params.set("module", module);
  if (search) params.set("search", search);
  return params.toString();
}

if (typeof module !== "undefined") {
  module.exports = { buildDefectsQuery };
}
if (typeof window !== "undefined") {
  window.DefectApp = Object.assign(window.DefectApp || {}, { buildDefectsQuery });
}
