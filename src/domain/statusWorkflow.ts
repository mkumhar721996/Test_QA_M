import type { Defect, DefectStatus } from "./types.ts";

const ALLOWED_TRANSITIONS: Record<DefectStatus, DefectStatus[]> = {
  New: ["InProgress"],
  InProgress: ["Fixed", "Reopened"],
  Fixed: ["Verified", "Reopened"],
  Verified: ["Closed", "Reopened"],
  Closed: [],
  Reopened: ["InProgress"],
};

export function isValidTransition(
  from: DefectStatus,
  to: DefectStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function meetsFixedPrecondition(defect: Defect): boolean {
  return defect.status === "InProgress";
}
