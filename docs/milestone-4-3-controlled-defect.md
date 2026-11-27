# M4.3 — Persistent Controlled Defect Demo (TC-006)

## Decision

The user explicitly requested that the intentionally introduced Reset Filters defect **not be fixed**. This is a permanent, visible learning/demo exercise, not an accidental regression. Do not quietly change the AUT to pass TC-006.

## Feature and known defect

- AUT URL: http://127.0.0.1:3100
- `web/index.html` adds the **Reset Filters** button.
- **Expected**: Reset Filters sets both Severity and Status to `All`, restoring unfiltered events.
- **Intentional actual behavior**: Severity resets to `All`, **Status remains unchanged**.
- `tests/events.spec.ts` adds `TC-006`, which creates Active and Acknowledged events, applies both filters, clicks Reset Filters and asserts both dropdowns are `All`. The Status assertion should fail.
- POM, Test Library and JSON result-parser recognize TC-006.
- The diagnostic exclusion for DIAG-001 is **unchanged**; TC-006 is a normal Playwright test so it is eligible for M4.1 Detection, M4.2 Bug Drafts and M4.3 Human Review.
- The UI includes a Controlled Defect Demo banner to make the deliberate failure conspicuous.
- Existing TC-001–TC-005 are unchanged.

## Expected run behavior

- **Run Selected: TC-006** — expected **0/1 Passed**, failure in Status reset assertion.
- **Run Selected: TC-001–TC-005** — expected **5/5 Passed**, clean core regression.
- **Run All** — expected **5 Passed / 1 Failed**, **failed overall by design**.
- When TC-006 fails, expect failure Screenshot, Video, Trace, one M4.1 unexpected failure and an M4.2 `needs-review` Bug Draft.
- Open the TC-006 Run in QA Portal Execution History and use M4.3 Review to edit, classify, save, reload and export `.txt` report. Jira Integration stays gray/disabled.
- Historical runs are not retroactively rewritten.
- Running the test creates normal test events in the local AUT database.

## Local verification

Stop any manually running AUT process on port 3100 when testing through the QA Portal (port 3200). From the project repository root:

```powershell
git status
git fetch origin
git switch feature/m4-3-human-review
git pull origin feature/m4-3-human-review
node --test tests/test-selection.test.cjs
node --test tests/bug-review.test.cjs
node --test tests/bug-drafts.test.cjs
node --test tests/failure-detection.test.cjs
npm.cmd run portal
```

If the branch does not yet exist locally: `git switch --track origin/feature/m4-3-human-review`.

### Acceptance checklist

1. The four unit-test files PASS.
2. Open AUT directly with `node backend/server.js`, confirm Reset Filters button exists; if running tests from QA Portal, stop this manual AUT first.
3. The QA Portal Test Library shows six tests, including visibly labeled TC-006; Checkbox selection can run TC-006 alone.
4. TC-006 produces exactly one expected, intentional failed test, with Status remaining `Active` after Reset Filters.
5. Playwright failure artifacts (screenshot, video, trace) are accessible from the run/report when produced.
6. Execution History for TC-006 shows one Bug Draft (not excluded like DIAG-001).
7. M4.3 Human Review can edit Title, Expected, Actual, Steps, Triage Decision, Severity, Priority and Notes; Save persists across refresh.
8. Export Bug Report (.txt) reflects saved review; Jira Integration remains disabled.
9. TC-001–TC-005 can be selected as a group and still pass 5/5.
10. Run All reports five passed and one intentionally failed; evidence and run history remain functional.
11. DIAG-001 still shows excluded status with zero Bug Drafts.
12. Do **not** fix TC-006 after acceptance. Keep the controlled defect available for future demos.

This branch is **implementation only** until the owner confirms local execution and acceptance.
