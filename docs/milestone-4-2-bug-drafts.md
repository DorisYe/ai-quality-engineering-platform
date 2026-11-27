# M4.2 — Automated Bug Draft Generation (Lean)

## Goal
Generate **candidate Bug Drafts** from M4.1 unexpected failures for **human review**. No AI, no Jira integrations, no automatic ticket filing, no automatic root-cause/product-bug classification.

## Flow
1. A normal Playwright run finishes and JSON Reporter results are parsed into `run.summary`.
2. M4.1 `detectFailures` identifies unexpected failures; DIAG-001 is excluded.
3. New `portal/bug-drafts.js` combines each failure's ID/message with existing Test Library specification (expected result and test steps).
4. `portal/test-runner.js` stores `run.bugDrafts` in that run's `run.json`, accessible through the existing `GET /api/runs/:id` and `GET /api/runs/current`.
5. Open Execution History and expand the run to see **Bug Drafts — Review Required** cards.

## Draft fields
`id`, `reviewStatus: needs-review`, `title`, `testId`, `testTitle`, `expected`, `actual`, `stepsToReproduce`, `runId`, `reportUrl`, `evidenceScope: run-level`, `evidenceLinks`.

**Evidence scope caution:** Evidence lists are currently attached at **run-level**. An artifact displayed with a draft is **not guaranteed** to belong to that exact test when a run contains multiple failures. M4.2 intentionally avoids filename-based guesses.

## Handling exclusions and unknown results
- `available` + zero failures ⇒ zero drafts.
- `excluded` ⇒ zero drafts for DIAG-001 despite Playwright's intentional failure.
- `unavailable` ⇒ no drafts; **not** evidence of zero failures.
- Old historical runs without `bugDrafts` stay unchanged.
- Flaky outcomes are not auto-classified as unexpected failures.

## Windows validation
From the repository root, with a clean working tree, switch to `feature/m4-2-bug-drafts`, then:

```powershell
git fetch origin
git switch --track origin/feature/m4-2-bug-drafts
node --test tests/bug-drafts.test.cjs
node --test tests/failure-detection.test.cjs
node --test tests/test-selection.test.cjs
npm.cmd run portal
```

If the branch is already local, use `git switch feature/m4-2-bug-drafts` and `git pull origin feature/m4-2-bug-drafts`. Keep the AUT on port 3100 stopped.

### Acceptance checklist
1. Five new Bug Draft unit tests pass, including a fabricated unexpected TC-003 error; no AUT code is intentionally broken.
2. Existing M4.1 and M3.6 unit tests still pass.
3. Run All (5/5 Passed), open its run in Execution History: “No unexpected failures detected. No Bug Drafts generated.”
4. Run Evidence Diagnostic (Expected Failure) and expand its historical run: shows “Diagnostic run excluded,” no Bug Drafts.
5. Expand an older pre-M4.2 run: shows “not enabled for this historical run”; run history and existing reports still work.
6. Open `/api/runs/current` for a new run; inspect `run.bugDrafts.status` and `count`.
7. Run Selected (one or multiple) and confirm it continues to work. HTML Reports and existing evidence links open.
8. Verify the Bug Draft unit test fixture creates the proper Expected/Actual/Steps/Report fields and leaves `reviewStatus` as `needs-review`.

## Boundaries
- Manual edits, triage decisions and draft-to-defect workflow belong to **M4.3**, not M4.2.
- The generated draft may describe test, environment, timing, or product issues; a QA reviewer must investigate before filing.
- No additional third-party dependencies.
- M4.2 was **accepted on 2026-11-25** after owner-confirmed local acceptance. See below.

## Acceptance record — 2026-11-25

**Status: ACCEPTED (owner-reported local validation: 8/8 PASS).**

The project owner confirmed all eight local acceptance checks above passed in their Windows environment. This confirms the unit tests, unchanged M4.1/M3.6 workflows, clean Run All, excluded intentional DIAG-001 run, historical-run handling, run API draft fields, test selection, HTML Reports and draft metadata checks according to the user's report.

This acceptance record reflects the owner's reported testing; it is not a claim that GitHub/CI independently executed the tests. The M4.2 branch remains separate from `feature/m4-rebuild` until an explicit merge step.

**Next milestone (proposed): M4.3 — Human Review & Triage.** Design and acceptance criteria to be agreed before implementation.
