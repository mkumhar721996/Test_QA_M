const { sortDefects, nextSortState } =
  typeof module !== "undefined"
    ? { ...require("../utils/sortDefects"), ...require("../utils/sortState") }
    : window.DefectApp;

/**
 * Drives the defect list page: tracks active filters/search/sort, fetches
 * matching defects, applies the current sort, and hands the result to the
 * caller's render callback. DOM-free so it can be unit tested directly.
 * @param {{fetchDefects: (criteria: object) => Promise<import('../../../server/src/models/defect').Defect[]>, onRender: (defects: import('../../../server/src/models/defect').Defect[]) => void}} deps
 */
function createDefectListController({ fetchDefects, onRender }) {
  const state = { status: "", severity: "", module: "", search: "", sort: null };

  async function refresh() {
    const defects = await fetchDefects({
      status: state.status,
      severity: state.severity,
      module: state.module,
      search: state.search,
    });
    const sorted = state.sort ? sortDefects(defects, state.sort.column, state.sort.direction) : defects;
    onRender(sorted);
    return sorted;
  }

  return {
    setFilter(field, value) {
      state[field] = value;
      return refresh();
    },
    setSearch(term) {
      state.search = term;
      return refresh();
    },
    sortByColumn(column) {
      state.sort = nextSortState(state.sort, column);
      return refresh();
    },
    getState() {
      return { ...state };
    },
  };
}

if (typeof module !== "undefined") {
  module.exports = { createDefectListController };
}
if (typeof window !== "undefined") {
  window.DefectApp = Object.assign(window.DefectApp || {}, { createDefectListController });
}
