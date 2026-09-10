import { availableTransitions, transitionDefect } from './src/domain/workflow.ts';

// Test 1: Unassigned developer on Fixed status (currently untested)
const unassignedDevOnFixed = { id: 'd-test', status: 'Fixed' as const, assigneeId: null };
const developer = { id: 'u-dev', role: 'developer' as const };
console.log('Unassigned developer on Fixed:', availableTransitions(unassignedDevOnFixed, developer));

// Test 2: Error case - tester trying invalid transition (currently untested)
const openDefect = { id: 'd-test', status: 'Open' as const, assigneeId: null };
const tester = { id: 'u-tester', role: 'tester' as const };
try {
  transitionDefect(openDefect, 'Closed', tester);
  console.log('ERROR: Should have thrown!');
} catch (e) {
  console.log('Correctly threw for invalid transition:', (e as Error).message);
}
