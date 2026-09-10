/**
 * @typedef {"low" | "medium" | "high" | "critical"} Severity
 * @typedef {"open" | "in-progress" | "resolved" | "closed"} Status
 * @typedef {{
 *   id: string,
 *   severity: Severity,
 *   module: string,
 *   status: Status,
 *   createdAt: string,
 *   closedAt: string | null,
 * }} Defect
 */
export {};
