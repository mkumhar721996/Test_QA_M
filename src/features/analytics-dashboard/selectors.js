/** @typedef {import("../../data/defect.js").Defect} Defect */

/**
 * @typedef {{ severity?: string, module?: string, status?: string }} ActiveFilters
 */

const DIMENSIONS = ["severity", "module", "status"];

/**
 * ANDs every active filter dimension together, optionally excluding one
 * dimension so a panel can render its own full breakdown while the other
 * active filters still narrow the data it shows.
 * @param {Defect[]} defects
 * @param {ActiveFilters} activeFilters
 * @param {"severity" | "module" | "status" | undefined} excludeDimension
 * @returns {Defect[]}
 */
export function filterDefects(defects, activeFilters, excludeDimension) {
  const dimensionsToApply = DIMENSIONS.filter(
    (dimension) => dimension !== excludeDimension && activeFilters[dimension] !== undefined
  );
  return defects.filter((defect) =>
    dimensionsToApply.every((dimension) => defect[dimension] === activeFilters[dimension])
  );
}

/**
 * @param {Defect[]} defects
 * @returns {Record<string, number>}
 */
export function groupBySeverity(defects) {
  return groupByField(defects, "severity");
}

/**
 * @param {Defect[]} defects
 * @returns {Record<string, number>}
 */
export function groupByModule(defects) {
  return groupByField(defects, "module");
}

/**
 * @param {Defect[]} defects
 * @returns {Record<string, number>}
 */
export function groupByStatus(defects) {
  return groupByField(defects, "status");
}

/**
 * @param {Defect[]} defects
 * @param {"severity" | "module" | "status"} field
 * @returns {Record<string, number>}
 */
function groupByField(defects, field) {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const defect of defects) {
    const key = defect[field];
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

/**
 * Builds a created-vs-closed-over-time series, bucketed by calendar month
 * (YYYY-MM) of createdAt / closedAt, sorted chronologically.
 * @param {Defect[]} defects
 * @returns {{ period: string, created: number, closed: number }[]}
 */
export function trendSeries(defects) {
  /** @type {Map<string, { created: number, closed: number }>} */
  const byPeriod = new Map();

  const bump = (period, key) => {
    if (!byPeriod.has(period)) {
      byPeriod.set(period, { created: 0, closed: 0 });
    }
    byPeriod.get(period)[key] += 1;
  };

  for (const defect of defects) {
    bump(defect.createdAt.slice(0, 7), "created");
    if (defect.closedAt) {
      bump(defect.closedAt.slice(0, 7), "closed");
    }
  }

  return Array.from(byPeriod.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, counts]) => ({ period, ...counts }));
}
