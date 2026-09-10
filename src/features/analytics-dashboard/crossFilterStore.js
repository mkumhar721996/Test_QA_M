/**
 * Tracks at most one active value per dimension (severity/module/status)
 * for cross-filtering the dashboard panels.
 * @returns {{
 *   getActiveFilters: () => Record<string, string>,
 *   select: (dimension: string, value: string) => void,
 *   clearAll: () => void,
 *   subscribe: (listener: () => void) => () => void,
 * }}
 */
export function createCrossFilterStore() {
  /** @type {Record<string, string>} */
  let activeFilters = {};
  /** @type {Set<() => void>} */
  const listeners = new Set();

  const notify = () => {
    for (const listener of listeners) listener();
  };

  return {
    getActiveFilters() {
      return { ...activeFilters };
    },
    select(dimension, value) {
      const next = { ...activeFilters };
      if (next[dimension] === value) {
        delete next[dimension];
      } else {
        next[dimension] = value;
      }
      activeFilters = next;
      notify();
    },
    clearAll() {
      activeFilters = {};
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
