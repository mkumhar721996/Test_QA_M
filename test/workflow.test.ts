import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availableTransitions, transitionDefect } from '../src/domain/workflow.ts';
import type { Defect, User } from '../src/domain/types.ts';

const tester: User = { id: 'u-tester', role: 'tester' };
const developer: User = { id: 'u-dev', role: 'developer' };
const manager: User = { id: 'u-mgr', role: 'manager' };

test('AC1: Open defect offers only Fixed to a tester', () => {
  const defect: Defect = { id: 'd-1', status: 'Open', assigneeId: null };
  assert.deepEqual(availableTransitions(defect, tester), ['Fixed']);
});

test('AC2: Fixed defect offers Closed and Reopened to a tester', () => {
  const defect: Defect = { id: 'd-2', status: 'Fixed', assigneeId: null };
  assert.deepEqual(
    new Set(availableTransitions(defect, tester)),
    new Set(['Closed', 'Reopened']),
  );
});

test('AC3: Reopened defect offers Fixed and Closed to a tester', () => {
  const defect: Defect = { id: 'd-3', status: 'Reopened', assigneeId: null };
  assert.deepEqual(
    new Set(availableTransitions(defect, tester)),
    new Set(['Fixed', 'Closed']),
  );
});

test('AC4: Closed defect offers no transitions to any user', () => {
  const defect: Defect = { id: 'd-4', status: 'Closed', assigneeId: null };
  assert.deepEqual(availableTransitions(defect, tester), []);
  assert.deepEqual(availableTransitions(defect, developer), []);
  assert.deepEqual(availableTransitions(defect, manager), []);
});

test('AC5: assigned developer sees only Fixed for Open or Reopened defects', () => {
  const openDefect: Defect = { id: 'd-5a', status: 'Open', assigneeId: developer.id };
  const reopenedDefect: Defect = { id: 'd-5b', status: 'Reopened', assigneeId: developer.id };
  assert.deepEqual(availableTransitions(openDefect, developer), ['Fixed']);
  assert.deepEqual(availableTransitions(reopenedDefect, developer), ['Fixed']);
});

test('AC6: a manager is never offered any status transition', () => {
  const statuses: Defect['status'][] = ['Open', 'Fixed', 'Closed', 'Reopened'];
  for (const status of statuses) {
    const defect: Defect = { id: `d-6-${status}`, status, assigneeId: null };
    assert.deepEqual(availableTransitions(defect, manager), []);
  }
});

test('AC7: a tester transitioning a Fixed defect to Reopened records the new status', () => {
  const defect: Defect = { id: 'd-7', status: 'Fixed', assigneeId: null };
  const updated = transitionDefect(defect, 'Reopened', tester);
  assert.equal(updated.status, 'Reopened');
});
