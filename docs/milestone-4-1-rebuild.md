# M4.1 — Simple Failure Detection

## Objective

Detect **unexpected Playwright test failures** from the structured results already produced by M3. This milestone does **not** generate bug drafts, determine root cause, or create Jira tickets.

## Data flow

1. User runs TC-001–TC-005 through the M3 QA Portal.
2. `portal/test-runner.js` starts Playwright.
3. Playwright writes `results.json`; the existing `portal/result-parser.js` produces `run.summary`.
4. New `portal/failure-detection.js` selects tests whose Playwright final `status` is `unexpected`.
5. The run's `failureDetection` field is stored in `run.json` and returned by `GET /api/runs/:id` and `GET /api/runs/current`.

Each failure contains `testId`, `title`, `status`, `durationMs` and `errorMessage`.

## Failure detection status

- `available`: JSON test results were parsed, including when `count: 0`.
- `unavailable`: JSON test results were missing or could not be parsed. **Not equivalent to passing tests**.
- `excluded`: the intentional diagnostic execution (`selection: evidence-check`). DIAG-001 is an expected demonstration failure, not an AUT bug.

`unexpected` means a Playwright test outcome, **not proof of a product defect**. A flaky test is not selected as an unexpected failure in this stage; flaky outcomes remain visible in the existing summary.

## Verification on Windows

On `feature/m4-rebuild` in the repository root:

```powershell
git pull origin feature/m4-rebuild
node --test tests/failure-detection.test.cjs
npm.cmd run portal
```

Leave the AUT on port 3100 stopped and open http://127.0.0.1:3200.

1. Run All (TC-001–TC-005). Expected: run summary 5/5 PASS; `failureDetection.status: "available"`, `count: 0`.
2. Choose an execution from History and copy its Run ID from the run-specific API/report URL if available. Alternatively use the current execution's URL below.
3. Open http://127.0.0.1:3200/api/runs/current (for the latest run), or `/api/runs/<run-id>` (for saved runs), and inspect `run.failureDetection`.
4. Run Evidence Diagnostic (Expected Failure). Expected: `failureDetection.status: "excluded"`, `count: 0` even though Playwright reports the intentional failure.
5. The unit test fixture verifies an unexpected failure without changing the AUT or intentionally breaking a real product test.

Existing run history saved **before** M4.1 may not contain `failureDetection`. This is expected: M4.1 does not rewrite historical run data.

## Scope boundary

M4.1 is backend-only. A Bug Draft UI, human triage and evidence linking are planned for M4.2/M4.3. No custom Trace ZIP parsing, AI requests, or automatic defect classification.

## Review

Validation from this GitHub commit is limited to code inspection and new unit test definitions until the tests are run locally; the owner should record actual local outcomes.
