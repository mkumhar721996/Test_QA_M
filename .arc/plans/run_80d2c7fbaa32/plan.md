summary: |
  This plan implements the rehire flow as pure domain logic: an operation that, given an
  employment record currently in `Terminated` status, creates a brand-new `Candidate` employment
  record linked to the same person, with zero fields carried over (role, department, seniority,
  compensation, benefits, manager), while leaving the prior terminated record completely
  untouched. The new record must flow through the exact same Candidate -> Active -> Terminated
  state machine as any other employment record, and a direct reactivation attempt on a
  `Terminated` record (bypassing rehire) must fail with a clear error. The repository currently
  has no application code at all (confirmed via repo-wide search: no `package.json`, no `src/`
  tree, no matches for "employment"/"Terminated"/"Candidate"/"rehire" outside a stale, unshipped
  plan artifact from a prior run) — only a design-system asset bootstrap and an empty README.
  This plan therefore also stands up the minimal TypeScript + vitest scaffolding required to
  write and execute the failing tests, and is scoped strictly to what the five acceptance
  criteria require: no persistence, API, or UI layer, since none of those exist yet and none are
  described by this story.
scope:
  - description: |
      Bootstrap a minimal Node/TypeScript project so domain code and tests can be written and
      executed. Add `package.json` with a `test` script (`vitest run`), `tsconfig.json` with
      `strict: true` targeting `ES2022`, and `vitest.config.ts` resolving the `src` tree.
    files:
      - package.json
      - tsconfig.json
      - vitest.config.ts
    rationale: |
      There is no build tooling, test runner, or source tree anywhere in the repo. This is the
      smallest scaffold that lets the tests below actually run.
  - description: |
      Define the shared domain types: `EmploymentStatus`, `Person`, `EmploymentRecord`, `Actor`,
      and the error types thrown by the state machine and rehire operation.

      ```ts
      export type EmploymentStatus = 'Candidate' | 'Active' | 'Terminated';

      export interface Person {
        id: string;
      }

      export interface EmploymentRecord {
        id: string;
        personId: string;
        status: EmploymentStatus;
        role: string | null;
        department: string | null;
        seniority: string | null;
        compensation: number | null;
        benefits: string[];
        managerId: string | null;
      }

      export interface Actor {
        id: string;
        role: 'hr_admin' | 'manager' | 'employee';
      }

      export class InvalidTransitionError extends Error {}
      export class UnauthorizedRehireError extends Error {}
      export class InvalidRehireSourceError extends Error {}
      ```
    files:
      - src/domain/employment/types.ts
      - src/domain/employment/errors.ts
    rationale: |
      Every other module in scope shares this vocabulary; defining it once avoids duplicated
      shape assumptions between the state machine and the rehire operation.
  - description: |
      Implement the Candidate -> Active -> Terminated transition function as a pure function
      over an explicit transition table, with `Terminated` as a true terminal state (zero
      outgoing transitions). This single table is what both the rehire flow's state machine
      reuse (AC4) and the direct-reactivation rejection (AC5) rely on.

      ```ts
      const ALLOWED_TRANSITIONS: Record<EmploymentStatus, EmploymentStatus[]> = {
        Candidate: ['Active'],
        Active: ['Terminated'],
        Terminated: [],
      };

      export function transitionEmploymentStatus(
        record: EmploymentRecord,
        next: EmploymentStatus
      ): EmploymentRecord {
        if (!ALLOWED_TRANSITIONS[record.status].includes(next)) {
          throw new InvalidTransitionError(
            `Cannot transition employment record ${record.id} from ${record.status} to ${next}. ` +
            (record.status === 'Terminated'
              ? 'Terminated is a permanent state; use rehireEmployee to create a new record instead.'
              : 'Only forward transitions in Candidate -> Active -> Terminated are allowed.')
          );
        }
        return { ...record, status: next };
      }
      ```
    files:
      - src/domain/employment/stateMachine.ts
      - src/domain/employment/stateMachine.test.ts
    rationale: |
      AC4 requires rehired records to follow "the same" rules as any other record, satisfied by
      giving `rehireEmployee` no special-cased transition logic of its own. AC5 requires a clear,
      specific error (not a silent no-op) when reactivation of a `Terminated` record is attempted
      directly; this table makes that fall out of the same terminal-state rule rather than a
      separate check that could drift from it.
  - description: |
      Implement `rehireEmployee`: authorization check, precondition check (prior record must be
      `Terminated`), and construction of a fresh `Candidate` record linked to the same person
      with every carryover-eligible field reset to its empty value.

      ```ts
      export function rehireEmployee(
        priorRecord: EmploymentRecord,
        actor: Actor,
        newRecordId: string
      ): EmploymentRecord {
        if (actor.role !== 'hr_admin') {
          throw new UnauthorizedRehireError(
            `Actor ${actor.id} (role: ${actor.role}) is not authorized to initiate a rehire.`
          );
        }
        if (priorRecord.status !== 'Terminated') {
          throw new InvalidRehireSourceError(
            `Employment record ${priorRecord.id} must be Terminated to be rehired ` +
            `(current status: ${priorRecord.status}).`
          );
        }
        return {
          id: newRecordId,
          personId: priorRecord.personId,
          status: 'Candidate',
          role: null,
          department: null,
          seniority: null,
          compensation: null,
          benefits: [],
          managerId: null,
        };
      }
      ```
    files:
      - src/domain/employment/rehire.ts
      - src/domain/employment/rehire.test.ts
    rationale: |
      Directly implements AC1 (authorization gate + zero carryover), AC2 (same `personId`), and
      AC3 (the function only ever reads `priorRecord` and returns a new object literal, so the
      caller's existing reference to the terminated record is never mutated).
tests:
  - |
    AC1 — rehire by an authorized HR admin produces a fresh Candidate record with no carried-over
    fields (`src/domain/employment/rehire.test.ts`):
    ```ts
    const rehired = rehireEmployee(terminatedRecord, hrAdmin, 'emp-2');
    expect(rehired.status).toBe('Candidate');
    expect(rehired.role).toBeNull();
    expect(rehired.department).toBeNull();
    expect(rehired.seniority).toBeNull();
    expect(rehired.compensation).toBeNull();
    expect(rehired.benefits).toEqual([]);
    expect(rehired.managerId).toBeNull();
    ```
    and that a non-admin actor is rejected before any record is constructed:
    ```ts
    const manager: Actor = { id: 'mgr-1', role: 'manager' };
    expect(() => rehireEmployee(terminatedRecord, manager, 'emp-2')).toThrow(UnauthorizedRehireError);
    ```
  - |
    AC2 — the new record is linked to the same person as the prior record
    (`src/domain/employment/rehire.test.ts`):
    ```ts
    const rehired = rehireEmployee(terminatedRecord, hrAdmin, 'emp-2');
    expect(rehired.personId).toBe(terminatedRecord.personId);
    expect(rehired.id).not.toBe(terminatedRecord.id);
    ```
  - |
    AC3 — the prior terminated record remains intact and unchanged after rehire
    (`src/domain/employment/rehire.test.ts`):
    ```ts
    const before = structuredClone(terminatedRecord);
    rehireEmployee(terminatedRecord, hrAdmin, 'emp-2');
    expect(terminatedRecord).toEqual(before);
    ```
  - |
    AC4 — a rehired record follows the same Candidate -> Active -> Terminated rules as any other
    record, including rejecting a skipped transition (`src/domain/employment/stateMachine.test.ts`):
    ```ts
    const rehired = rehireEmployee(terminatedRecord, hrAdmin, 'emp-2');
    const active = transitionEmploymentStatus(rehired, 'Active');
    expect(active.status).toBe('Active');
    const terminatedAgain = transitionEmploymentStatus(active, 'Terminated');
    expect(terminatedAgain.status).toBe('Terminated');
    expect(() => transitionEmploymentStatus(rehired, 'Terminated')).toThrow(InvalidTransitionError);
    ```
  - |
    AC5 — direct reactivation of a Terminated record (not via rehire) returns a clear error
    (`src/domain/employment/stateMachine.test.ts`):
    ```ts
    expect(() => transitionEmploymentStatus(terminatedRecord, 'Active')).toThrow(InvalidTransitionError);
    expect(() => transitionEmploymentStatus(terminatedRecord, 'Active')).toThrow(/rehire/i);
    ```
    and rehire itself refuses to act as a substitute reactivation path when the source record
    isn't Terminated (`src/domain/employment/rehire.test.ts`):
    ```ts
    const stillActive: EmploymentRecord = { ...terminatedRecord, status: 'Active' };
    expect(() => rehireEmployee(stillActive, hrAdmin, 'emp-2')).toThrow(InvalidRehireSourceError);
    ```
assumptions_or_open_questions:
  - |
    The repository has no existing application code, API layer, persistence layer, or auth
    system to integrate with (confirmed via repo-wide search for "employment"/"Candidate"/
    "Terminated"/"rehire"/"Person" — the only match is a stale, unimplemented plan artifact from
    a prior run, and no `package.json` or source tree exists). This plan is therefore scoped to
    domain/state-machine logic and its unit tests only; wiring a real HTTP endpoint, database
    schema, or authentication system is left to a follow-up story.
  - |
    "Authorized HR admin" (AC1) is modeled as an in-memory `Actor.role === 'hr_admin'` check
    rather than integration with a real authorization system, since none exists in the repo yet.
  - |
    `seniority` is modeled as `string | null` and `benefits` as `string[]`; the story does not
    define their concrete shape and no existing model dictates one, so these are the simplest
    types that satisfy "no field carryover" for both.
  - |
    Employment record IDs (e.g. the new rehire record's ID) are assumed to be generated/supplied
    by the caller (a future API/persistence layer) rather than by this domain function, since no
    ID-generation strategy exists anywhere in the codebase.
  - |
    AC4's "same state machine rules as any other employment record" is satisfied by construction:
    `rehireEmployee` returns a plain `EmploymentRecord` with no special flag, so it is
    indistinguishable from any other Candidate record and is exercised through the exact same
    `transitionEmploymentStatus` function used elsewhere — there is no separate "rehire state
    machine" to keep in sync.
package_dependencies:
  - name: vitest
    version: ^2.1.0
    ecosystem: npm
    rationale: |
      No test framework exists in the repository yet; vitest runs the failing-test-first suite
      for the state machine and the rehire operation.
  - name: typescript
    version: ^5.6.0
    ecosystem: npm
    rationale: |
      The domain types rely on a discriminated `EmploymentStatus` union and strict null-checking
      for the reset-to-null carryover fields; no build tooling exists yet to support this.
notes: |
  The repo (branch `TEST-QA-M-STORY-060-rehire-flow`) currently contains only a design-system
  asset bootstrap (`design-system/UI-GUIDELINES.md`, `tokens.css`, `tokens.json`,
  `style-guide.html`) describing an unrelated QA test-console UI (Test Cases/Test Runs/Reports),
  plus an unshipped plan artifact from a prior planning run at
  `.arc/plans/run_b21d7b19cf0d/plan.md` that was never implemented (no corresponding `src/` or
  `package.json` exists). Nothing in the design system references employment/HR/rehire concepts,
  and this story's acceptance criteria are entirely domain/behavioral with no UI described, so
  this plan does not touch `design-system/*`.

  Because there is no prior employment-lifecycle implementation in this repo to extend, the
  transition table and error types were designed directly from the acceptance criteria:
  `Terminated` is modeled as a true terminal state with zero outgoing transitions in
  `ALLOWED_TRANSITIONS`, which is what makes AC5 (no direct reactivation) fall out of the exact
  same table AC4 relies on, rather than requiring a separate special-case check that could drift
  out of sync with it.

  No mermaid diagram is included: this is a purely additive plan into a previously empty
  repository (no existing module is being called into or modified, and the two new domain
  modules — state machine and rehire — are small enough that the file list and `scope`
  descriptions above fully convey the shape of the change).
review_focus: |
  In scope: pure domain logic for rehire (authorization + precondition checks, zero-carryover
  record construction, same-person linking, prior-record immutability) and a state machine where
  `Terminated` is a true terminal state. Out of scope: any HTTP/API layer, persistence/database
  layer, real authentication system, and UI — none exist in the repo yet and the acceptance
  criteria don't describe them. The riskiest area is `src/domain/employment/stateMachine.ts`'s
  transition table: a mistake there could make AC4 and AC5 pass for the wrong reason (e.g. by
  special-casing rehired records instead of relying on the shared transition rules), or could
  reopen an indirect path to reactivate a Terminated record. Reviewers should treat the
  `Actor`/authorization model and caller-supplied ID generation as deliberate, minimal stand-ins
  (see assumptions) since no real auth or persistence layer exists yet — not an oversight to flag.
