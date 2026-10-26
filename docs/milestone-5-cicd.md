# M5 — CI/CD & Automated Quality Gates

Status: **first implementation on feature branch**, pending GitHub Actions run and owner acceptance.

## M5.1 — GitHub Actions baseline (implemented)
Workflow: `.github/workflows/m5-quality-gates.yml`.

Triggers: pull requests targeting `main`, pushes to `main`, and manual runs. Jobs execute on Ubuntu with Node.js 22 and Chromium:
1. Checkout and install dependencies.
2. Backend static syntax checks: `npm run check`.
3. Node unit/regression suite: `node --test tests/*.test.cjs`.
4. Playwright functional E2E regression: `npx playwright test`.

A failed step fails the `Quality Gate / Unit + Playwright` job; on failure, Playwright report/test-results files are uploaded for seven days where available. **No intentional DIAG-001 failure is included**, since `QA_EVIDENCE_CHECK=0`.

## Dependencies / constraints
The existing repository has no `package-lock.json`; therefore the initial workflow uses `npm install --no-package-lock`. This is suitable for the first CI baseline but **not a fully reproducible dependency installation**. Follow-up M5 work should commit a lockfile and switch to `npm ci` plus npm cache.

PR check status alone does not enforce branch protection. To prevent merging failed PRs via GitHub UI, configure a required status check for `Quality Gate / Unit + Playwright` in `main` branch rulesets or branch protection. This may require repository admin permissions; no settings were changed automatically.

## Acceptance
- GitHub Actions actually executes on the M5 PR.
- Static checks pass.
- All Node tests pass.
- Five normal Playwright tests pass; DIAG-001 is excluded.
- A deliberately failing branch change would block the workflow (without changing `main`).
- Failure artifacts/diagnostics are retained appropriately.

## Next increments
M5.2: CI artifact collection and test report summary **implemented, pending GitHub Actions acceptance**. Every run uploads `m5-ci-test-reports` (Node test log, Playwright JSON/HTML where available), produces an Actions step summary, and failed runs additionally upload `playwright-quality-gate-failure` containing `test-results/` (screenshots, video and traces where retained). Four unit tests cover summary aggregation, empty input and safe output.
M5.3: scripted quality threshold policy, quality gate tests, and GitHub summary.
M5.4: branch protection instructions, final README and acceptance.

**No external AI provider or API key is necessary.**


## M5.2 Acceptance checklist (pending)
1. Open PR #5 → Checks → M5 Quality Gates → Summary; verify Playwright counts and total.
2. Download `m5-ci-test-reports`; confirm unit log, JSON and HTML report are present after successful execution.
3. Confirm an intentional E2E failure uploads `playwright-quality-gate-failure` with available screenshots, videos or trace ZIPs; do not introduce a failing test into main.
4. Confirm no raw stack traces or secrets appear in the Step Summary.
5. Check `node --test tests/*.test.cjs` passes (expected 54 tests, based on owner-reported M4 50 plus four new cases).
6. Confirm DIAG-001 remains excluded from the default Playwright CI suite.

**Note:** M5.2 has been committed to Draft PR #5; CI run results have not been verified in this session.
