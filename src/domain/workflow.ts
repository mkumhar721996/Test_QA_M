import type { Defect, Status, User } from './types.ts';

function testerTransitions(status: Status): Status[] {
  if (status === 'Open') {
    return ['Fixed'];
  }
  if (status === 'Fixed') {
    return ['Closed', 'Reopened'];
  }
  if (status === 'Reopened') {
    return ['Fixed', 'Closed'];
  }
  return [];
}

function developerTransitions(defect: Defect, actingUser: User): Status[] {
  const isAssignedToActingUser = defect.assigneeId === actingUser.id;
  if (isAssignedToActingUser && (defect.status === 'Open' || defect.status === 'Reopened')) {
    return ['Fixed'];
  }
  return [];
}

export function availableTransitions(defect: Defect, actingUser: User): Status[] {
  if (actingUser.role === 'tester') {
    return testerTransitions(defect.status);
  }
  if (actingUser.role === 'developer') {
    return developerTransitions(defect, actingUser);
  }
  return [];
}

export function transitionDefect(defect: Defect, targetStatus: Status, actingUser: User): Defect {
  if (!availableTransitions(defect, actingUser).includes(targetStatus)) {
    throw new Error(
      `Transition from ${defect.status} to ${targetStatus} is not permitted for role ${actingUser.role}`,
    );
  }
  return { ...defect, status: targetStatus };
}
