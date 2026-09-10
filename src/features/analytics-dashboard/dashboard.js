import { createCrossFilterStore } from "./crossFilterStore.js";
import {
  filterDefects,
  groupBySeverity,
  groupByModule,
  groupByStatus,
  trendSeries,
} from "./selectors.js";

/** @typedef {import("../../data/defect.js").Defect} Defect */

const PANELS = [
  { dimension: "severity", groupBy: groupBySeverity },
  { dimension: "module", groupBy: groupByModule },
  { dimension: "status", groupBy: groupByStatus },
];

/**
 * Composes the four analytics panels with a shared cross-filter store.
 * Every value that appears anywhere in the dataset is always rendered as an
 * item (even at zero count) so a panel never loses a clickable target.
 * @param {Defect[]} defects
 */
export function createDashboard(defects) {
  const store = createCrossFilterStore();
  const categoriesByDimension = Object.fromEntries(
    PANELS.map(({ dimension, groupBy }) => [dimension, Object.keys(groupBy(defects))])
  );

  function buildBreakdownPanel(dimension, groupBy) {
    const activeFilters = store.getActiveFilters();
    const scoped = filterDefects(defects, activeFilters, dimension);
    const counts = groupBy(scoped);
    const items = categoriesByDimension[dimension].map((value) => ({
      id: `${dimension}:${value}`,
      dimension,
      value,
      label: value,
      count: counts[value] ?? 0,
      active: activeFilters[dimension] === value,
    }));
    return { id: dimension, clickable: true, items };
  }

  function buildTrendPanel() {
    const activeFilters = store.getActiveFilters();
    const scoped = filterDefects(defects, activeFilters);
    return { id: "trend", clickable: false, points: trendSeries(scoped) };
  }

  return {
    getViewModel() {
      const activeFilters = store.getActiveFilters();
      const hasActiveFilters = Object.keys(activeFilters).length > 0;
      return {
        activeFilters,
        hasActiveFilters,
        trend: buildTrendPanel(),
        severity: buildBreakdownPanel("severity", groupBySeverity),
        module: buildBreakdownPanel("module", groupByModule),
        status: buildBreakdownPanel("status", groupByStatus),
        clearFilters: { id: "clear-filters", visible: hasActiveFilters },
      };
    },
    select(dimension, value) {
      store.select(dimension, value);
    },
    clearAll() {
      store.clearAll();
    },
    subscribe(listener) {
      return store.subscribe(listener);
    },
  };
}
