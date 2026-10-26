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
M5.2: consistent artifact collection and test report summary.
M5.3: scripted quality threshold policy, quality gate tests, and GitHub summary.
M5.4: branch protection instructions, final README and acceptance.

**No external AI provider or API key is necessary.**
