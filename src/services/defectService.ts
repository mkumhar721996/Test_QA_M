import {
  canCreateDefect,
  canEditDefectField,
  canTransitionStatus,
  canViewAllDefects,
} from "../domain/permissions.ts";
import type { Defect, DefectStatus, EditableField, Role } from "../domain/types.ts";

export type ServiceResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string };

export function listDefects(role: Role, defects: Defect[]): ServiceResult<Defect[]> {
  if (!canViewAllDefects(role)) {
    return { ok: false, reason: `${role} cannot view defects` };
  }
  return { ok: true, value: defects };
}

export function createDefect(
  role: Role,
  input: Defect,
  defects: Defect[],
): ServiceResult<Defect[]> {
  if (!canCreateDefect(role)) {
    return { ok: false, reason: `${role} cannot create defects` };
  }
  return { ok: true, value: [...defects, input] };
}

export function updateDefectField(
  role: Role,
  defect: Defect,
  field: EditableField,
  value: string,
): ServiceResult<Defect> {
  if (!canEditDefectField(role, field)) {
    return { ok: false, reason: `${role} cannot edit ${field}` };
  }
  return { ok: true, value: { ...defect, [field]: value } };
}

export function transitionStatus(
  role: Role,
  defect: Defect,
  toStatus: DefectStatus,
): ServiceResult<Defect> {
  if (!canTransitionStatus(role, defect, toStatus)) {
    return { ok: false, reason: `${role} cannot transition to ${toStatus}` };
  }
  return { ok: true, value: { ...defect, status: toStatus } };
}
