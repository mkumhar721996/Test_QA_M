/** @typedef {import("./defect.js").Defect} Defect */

/** @type {Defect[]} */
export const fixtureDefects = [
  { id: "d1", severity: "high", module: "auth", status: "open", createdAt: "2024-01-05", closedAt: null },
  { id: "d2", severity: "high", module: "billing", status: "closed", createdAt: "2024-01-10", closedAt: "2024-01-20" },
  { id: "d3", severity: "high", module: "billing", status: "closed", createdAt: "2024-02-01", closedAt: "2024-02-10" },
  { id: "d4", severity: "medium", module: "billing", status: "open", createdAt: "2024-01-15", closedAt: null },
  { id: "d5", severity: "medium", module: "auth", status: "in-progress", createdAt: "2024-02-05", closedAt: null },
  { id: "d6", severity: "low", module: "search", status: "resolved", createdAt: "2024-02-15", closedAt: null },
  { id: "d7", severity: "critical", module: "auth", status: "open", createdAt: "2024-03-01", closedAt: null },
  { id: "d8", severity: "critical", module: "search", status: "closed", createdAt: "2024-01-25", closedAt: "2024-02-01" },
  { id: "d9", severity: "high", module: "search", status: "in-progress", createdAt: "2024-03-10", closedAt: null },
  { id: "d10", severity: "medium", module: "search", status: "closed", createdAt: "2024-03-15", closedAt: "2024-03-20" },
  { id: "d11", severity: "low", module: "billing", status: "open", createdAt: "2024-02-20", closedAt: null },
  { id: "d12", severity: "high", module: "billing", status: "open", createdAt: "2024-03-05", closedAt: null },
];
