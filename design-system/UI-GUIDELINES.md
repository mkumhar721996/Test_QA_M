# UI Guidelines

## Navigation
Left sidebar with three sections — Test Cases, Test Runs, Reports — because QA work is organized around these three persistent objects and users pivot between them constantly during a session. No top bar beyond a slim header for account/workspace switching, since it would compete with the sidebar for the same job.

## Layout and density
Data-dense console layout: tables and lists are the default surface, with generous use of `chip` for statuses (pass/fail/blocked) so a screen can convey many results at a glance. Below 960px, the sidebar collapses to icons-only, since QA engineers primarily work on wide monitors and mobile is a secondary, glance-only context.

## Component usage
- Use `card` for a single test case's detail view or a run summary — one focal record, not a collection.
- Use a table for any list of test cases, runs, or results — these are inherently tabular and benefit from column scanning.
- Use `chip` strictly for status/state labels (pass, fail, skipped, flaky), never for navigation or actions, so status meaning stays unambiguous.
- Use `btn-primary` for the single most important action per screen (e.g. "Run tests"); every other action is `btn-secondary`, so users always know the one recommended next step.
- Use `input`/`label` pairs for all filters and forms rather than ad hoc controls, so filtering behaves identically everywhere.

## Theme
Light theme only, by default. QA dashboards are typically viewed on shared monitors during standups and in screenshots pasted into tickets, where a consistent light background reads clearly regardless of the room or player.

## Voice and tone
Direct and factual, like a test log: state what happened ("3 tests failed", "Run completed"), not how the user should feel about it. Avoid exclamation points and celebratory copy — a QA tool reports status, it doesn't cheer.
