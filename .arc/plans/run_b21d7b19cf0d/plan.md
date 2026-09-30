summary: |
  This plan implements the rehire flow for a previously terminated employee: a domain-level
  operation that creates a brand-new, empty Candidate employment record linked to the same
  person record as a prior Terminated record, while leaving that prior record untouched, and
  that reuses the existing Candidate -> Active -> Terminated state machine rules for the new
  record. It also closes off direct reactivation of a Terminated record (must go through rehire).
  The repository currently contains no application code at all — only a design-system asset
  bootstrap (tokens/CSS/style guide) and an empty README — so there is no existing Person,
  EmploymentRecord, or state-machine implementation to extend. This plan therefore also stands
  up the minimal TypeScript + vitest scaffolding needed to write and run the failing-test-first
  suite for this story's domain logic, scoped strictly to what the five acceptance criteria
  require (no persistence layer, API layer, or UI, since none of that is described by this story
  and none of it exists yet to extend).
scope:
  - description: |
      Bootstrap a minimal Node/TypeScript project so domain code and tests can be written and
      run. Add `package.json` with a `test` script running vitest, `tsconfig.json` targeting a
      modern ES target with strict mode, and `vitest.config.ts` pointing at the `src` tree.
    files:
      - package.json
      - tsconfig.json
      - vitest.config.ts
    rationale: |
      `Glob`/`Grep` across the repo found no `package.json`, no source files, and no test
      runner — the repo is genuinely empty except for `design-system/*` (CSS/token assets) and
      a one-line `README.md`. There is nothing to reuse; this is the smallest scaffold that lets
      the failing tests below actually execute.
  - description: |
      Define the shared domain types for this story: `EmploymentStatus`, `Person`,
      `EmploymentRecord`, and `Actor`.

      ```ts
      export type EmploymentStatus = 'Candidate' | 'Active' | 'Terminated';

      export interface Person {
        id: string;
        name: string;
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
        createdAt: Date;
      }

      export interface Actor {
        id: string;
        role: 'hr_admin' | 'manager' | 'employee';
      }
      ```
    files:
      - src/domain/employment/types.ts
    rationale: |
      Every other file in scope depends on a shared shape for the employment record and the
      acting user, so this is defined once and imported everywhere else.
  - description: |
      Implement the Candidate -> Active -> Terminated state machine as a pure function plus an
      `InvalidTransitionError`, and make it reject any transition out of `Terminated` (this is
      what makes direct reactivation impossible and is reused, unmodified, by rehired records).

      ```ts
      const ALLOWED_TRANSITIONS: Record<EmploymentStatus, EmploymentStatus[]> = {
        Candidate: ['Active'],
        Active: ['Terminated'],
        Terminated: [],
      };

      export function transitionStatus(
        record: EmploymentRecord,
        next: EmploymentStatus
      ): EmploymentRecord { /* ... */ }
      ```
    files:
      - src/domain/employment/stateMachine.ts
      - src/domain/employment/stateMachine.test.ts
    rationale: |
      AC4 requires a rehired record to follow "the same" state machine rules as any other
      record — implemented by having `rehireEmployee` produce a plain `EmploymentRecord` with no
      special-casing, so it flows through this exact function. AC5 requires that a direct
      reactivation attempt (calling `transitionStatus` on a `Terminated` record) returns a clear
      error rather than silently succeeding or being a no-op.
  - description: |
      Implement `rehireEmployee`, the core operation for this story: authorization check,
      precondition check, and construction of the fresh record.

      ```ts
      export function rehireEmployee(
        priorRecord: EmploymentRecord,
        actor: Actor,
        newRecordId: string
      ): EmploymentRecord {
        if (actor.role !== 'hr_admin') {
          throw new UnauthorizedError(`Actor ${actor.id} is not authorized to initiate a rehire.`);
        }
        if (priorRecord.status !== 'Terminated') {
          throw new InvalidRehireError(
            `Employment record ${priorRecord.id} must be Terminated to be rehired (current status: ${priorRecord.status}).`
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
          createdAt: new Date(),
        };
      }
      ```
    files:
      - src/domain/employment/rehire.ts
      - src/domain/employment/rehire.test.ts
    rationale: |
      This is the AC1/AC2/AC3 behavior: no field carryover, same `personId` link, and the prior
      record object is never mutated (the function only reads from `priorRecord` and returns a
      brand-new object), so the caller's reference to the terminated record stays intact.
tests:
  - |
    AC1 — rehire produces a fresh Candidate record with no carried-over fields
    (`src/domain/employment/rehire.test.ts`):
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
    Also covers the "authorized HR admin" precondition:
    ```ts
    const nonAdmin: Actor = { id: 'mgr-1', role: 'manager' };
    expect(() => rehireEmployee(terminatedRecord, nonAdmin, 'emp-2')).toThrow(UnauthorizedError);
    ```
  - |
    AC2 — the new record is linked to the same person as the prior record
    (`src/domain/employment/rehire.test.ts`):
    ```ts
    const rehired = rehireEmployee(terminatedRecord, hrAdmin, 'emp-2');
    expect(rehired.personId).toBe(terminatedRecord.personId);
    ```
  - |
    AC3 — the prior terminated record remains intact and unchanged after rehire
    (`src/domain/employment/rehire.test.ts`):
    ```ts
    const before = { ...terminatedRecord };
    rehireEmployee(terminatedRecord, hrAdmin, 'emp-2');
    expect(terminatedRecord).toEqual(before);
    ```
  - |
    AC4 — a rehired record follows the same Candidate -> Active -> Terminated rules as any
    other record (`src/domain/employment/stateMachine.test.ts`):
    ```ts
    const rehired = rehireEmployee(terminatedRecord, hrAdmin, 'emp-2');
    const active = transitionStatus(rehired, 'Active');
    expect(active.status).toBe('Active');
    const terminated = transitionStatus(active, 'Terminated');
    expect(terminated.status).toBe('Terminated');
    // and it must not be allowed to skip a state, same as any other record:
    expect(() => transitionStatus(rehired, 'Terminated')).toThrow(InvalidTransitionError);
    ```
  - |
    AC5 — direct reactivation of a Terminated record (not via rehire) returns a clear error
    (`src/domain/employment/stateMachine.test.ts`):
    ```ts
    expect(() => transitionStatus(terminatedRecord, 'Active')).toThrow(InvalidTransitionError);
    expect(() => transitionStatus(terminatedRecord, 'Active')).toThrow(/rehire/i);
    ```
    Also verifies rehire is rejected as a substitute path when the prior record is not
    Terminated (`src/domain/employment/rehire.test.ts`):
    ```ts
    const active = { ...terminatedRecord, status: 'Active' as const };
    expect(() => rehireEmployee(active, hrAdmin, 'emp-2')).toThrow(InvalidRehireError);
    ```
assumptions_or_open_questions:
  - |
    The repository has no existing application code, API layer, persistence layer, or auth
    system to integrate with (confirmed via repo-wide search for "employment"/"Candidate"/
    "Terminated"/"rehire" — no matches, and no `package.json` or source tree exists at all).
    This plan is scoped to the domain/state-machine logic and its unit tests only; wiring this
    into a real API endpoint, database schema, and authentication system is left to a follow-up
    story, since none of that exists yet for this plan to extend.
  - |
    "Authorized HR admin" is modeled as an in-memory `Actor.role === 'hr_admin'` check rather
    than integration with a real authorization system, since no such system exists in the repo.
  - |
    `seniority` is modeled as a plain `string | null` and `benefits` as a `string[]`, since the
    story does not define their concrete shape and no existing model dictates one.
  - |
    Employment record and person IDs are assumed to be generated/supplied by the caller (e.g. a
    future API layer) rather than by this domain module, since no ID-generation strategy exists
    anywhere in the codebase yet.
  - |
    The "same state machine rules as any other employment record" (AC4) is satisfied by design:
    `rehireEmployee` returns a plain `EmploymentRecord` with no special flag or bypass, so it is
    indistinguishable from any other Candidate record once created, and is exercised through the
    exact same `transitionStatus` function used elsewhere.
package_dependencies:
  - name: vitest
    version: ^2.1.0
    ecosystem: npm
    rationale: |
      No test framework exists in the repository yet; vitest is the runner used to write and
      execute the failing-test-first unit tests for the state machine and rehire use case.
  - name: typescript
    version: ^5.6.0
    ecosystem: npm
    rationale: |
      The domain types and state machine rely on a discriminated `EmploymentStatus` union and
      strict null-checking for the "no carryover" fields; no build tooling exists in the repo
      yet to support this.
notes: |
  The repo is named/branched for "TEST-QA-M" work items and currently contains only a
  design-system bootstrap (`design-system/UI-GUIDELINES.md`, `tokens.css`, `tokens.json`,
  `style-guide.html`) describing an unrelated QA test-console UI (Test Cases/Test Runs/Reports).
  Nothing in that design system references employment, HR, or rehire concepts, and this story's
  acceptance criteria are entirely domain/behavioral (no UI is described), so this plan does not
  touch `design-system/*`.

  Because there is no prior employment-lifecycle implementation in this repo to mirror, the
  state machine's transition table and error types were designed directly from the acceptance
  criteria: `Terminated` is a true terminal state with zero outgoing transitions, which is what
  makes AC5 (no direct reactivation) fall out of the same table AC4 relies on, rather than
  needing a separate special-case check.

  No mermaid diagram is included: this is a purely additive plan into a previously empty
  repository (no existing module is being called into or modified), so there is no real
  existing call graph to show.
review_focus: |
  In scope: the pure domain logic for rehire (authorization + precondition checks, zero-carryover
  record construction, same-person linking, prior-record immutability) and the state-machine
  change that makes `Terminated` a true terminal state. Out of scope: any HTTP/API layer,
  persistence/database layer, real authentication/authorization system, and UI — none of these
  exist in the repo yet and the acceptance criteria don't describe them. The riskiest area is the
  state-machine transition table (`src/domain/employment/stateMachine.ts`): a mistake there could
  silently make AC4 and AC5 pass for the wrong reason (e.g. by special-casing rehired records
  instead of relying on the shared transition rules) or reopen a path to reactivate a Terminated
  record indirectly. Reviewers should note that `Actor`/authorization and ID generation are
  intentionally minimal stand-ins (see assumptions) since no real auth or persistence layer
  exists yet — that is deliberate scope-limiting, not an oversight.
