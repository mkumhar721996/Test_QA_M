import { availableTransitions, transitionDefect } from './src/domain/workflow.ts';

// Test 1: Unassigned developer on Fixed status (currently untested)
const unassignedDevOnFixed = { id: 'd-test', status: 'Fixed', assigneeId: null };
const developer = { id: 'u-dev', role: 'developer' };
console.log('Unassigned developer on Fixed:', availableTransitions(unassignedDevOnFixed, developer));

// Test 2: Error case - tester trying invalid transition (currently untested)
const openDefect = { id: 'd-test', status: 'Open', assigneeId: null };
const tester = { id: 'u-tester', role: 'tester' };
try {
  transitionDefect(openDefect, 'Closed', tester);
  console.log('ERROR: Should have thrown!');
} catch (e) {
  console.log('Correctly threw for invalid transition:', e.message);
}
