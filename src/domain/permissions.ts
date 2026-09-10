import type { Defect, EditableField, Role } from "./types.ts";
import type { DefectStatus } from "./types.ts";
import { isValidTransition, meetsFixedPrecondition } from "./statusWorkflow.ts";

export function canViewAllDefects(_role: Role): boolean {
  return true;
}

export function canCreateDefect(role: Role): boolean {
  return role === "tester";
}

export function canEditDefectField(
  role: Role,
  _field: EditableField,
): boolean {
  return role === "tester";
}

export function canTransitionStatus(
  role: Role,
  defect: Defect,
  toStatus: DefectStatus,
): boolean {
  if (!isValidTransition(defect.status, toStatus)) {
    return false;
  }

  if (role === "tester") {
    return true;
  }

  if (role === "developer") {
    return toStatus === "Fixed" && meetsFixedPrecondition(defect);
  }

  return false;
}
