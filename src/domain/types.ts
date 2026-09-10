export type Role = "tester" | "developer" | "manager";

export type DefectStatus =
  | "New"
  | "InProgress"
  | "Fixed"
  | "Verified"
  | "Closed"
  | "Reopened";

export interface Defect {
  id: string;
  title: string;
  description: string;
  severity: string;
  stepsToReproduce: string;
  module: string;
  assignedDeveloper: string;
  status: DefectStatus;
}

export const EDITABLE_FIELDS = [
  "title",
  "description",
  "severity",
  "stepsToReproduce",
  "module",
  "assignedDeveloper",
] as const;

export type EditableField = (typeof EDITABLE_FIELDS)[number];
