export type Status = 'Open' | 'Fixed' | 'Closed' | 'Reopened';

export type Role = 'tester' | 'developer' | 'manager';

export interface Defect {
  id: string;
  status: Status;
  assigneeId: string | null;
}

export interface User {
  id: string;
  role: Role;
}
