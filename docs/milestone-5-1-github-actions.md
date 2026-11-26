# M5.1 — GitHub Actions Pipeline Setup

## Goal

Automatically run the existing Node.js unit/integration tests and the **five clean Playwright core regression tests** on GitHub Actions. This is CI only; deployment, artifact upload/retention, branch protection and additional quality-gate policy are planned for M5.2–M5.4.

## Workflow

File: `.github/workflows/core-qa-ci.yml`

Triggers: push to `feature/m5-1-github-actions` or `main`, all pull requests, and manual `workflow_dispatch`.

- Checkout repository (read-only permission).
- Use Node.js 22 on Ubuntu runner.
- `npm install --no-audit --no-fund`.
- `npx playwright install --with-deps chromium`.
- `npm run test:unit` (`node --test`, which discovers the existing `*.test.cjs` files on Windows and Linux).
- `npm run test:core` (Playwright `--grep "TC-00[1-5]:"`).

The Playwright webServer starts the AUT itself on port 3100. Do not launch the AUT separately in CI. The Node unit tests run directly, not through the Portal.

### Known intentional failures

- **TC-006** remains intentionally FAILING in the AUT for the Controlled Defect Demo. It is **not run in the required CI core regression** and is not marked as skipped or as an expected-failure assertion; it remains a real failure for the local QA Portal workflow.
- **DIAG-001** remains independently selected through the evidence diagnostic mode and does not enter normal Playwright runs.
- For a local demo, `npm test` still runs all normal `events.spec.ts` tests including the intentionally failing TC-006; use `npm run test:core` for clean regression.

## Dependency note

The current source tree does not include `package-lock.json`, so M5.1 deliberately uses `npm install`, **not** `npm ci`. A future follow-up can check in a verified lockfile and switch to `npm ci` for fully reproducible installs; do not assume today's install is perfectly locked.

## Local smoke validation

From a clean working tree with no manually running AUT on port 3100:

```powershell
git fetch origin
git switch --track origin/feature/m5-1-github-actions
npm install
npm run test:unit
npm run test:core
```

If the branch already exists locally, use `git switch feature/m5-1-github-actions` and `git pull origin feature/m5-1-github-actions`. Note that `npm run test:core` may require `npx playwright install chromium` on a fresh machine.

## Acceptance checklist

- [ ] Workflow is present and shown in GitHub Actions for M5.1 branch.
- [ ] A push or PR triggers `M5.1 Core QA CI`, and the `core-tests` job starts.
- [ ] Dependencies and Playwright Chromium install successfully.
- [ ] All existing Node unit/integration tests PASS.
- [ ] Playwright runs **exactly TC-001–TC-005**, all PASS (5/5).
- [ ] TC-006 and DIAG-001 do not enter this core CI run, but remain available for demos.
- [ ] A test failure causes the workflow to show FAIL (validate in a temporary follow-up only if needed; never break the accepted AUT).
- [ ] Local `npm run test:unit` and `npm run test:core` behave consistently with CI.

## Boundaries and status

The user must confirm the actual GitHub Actions execution. Committing a workflow is not evidence that GitHub successfully ran it. No assertion of CI PASS is made before examining the workflow logs or user's acceptance.

M5.2: CI reports and artifact uploading; M5.3: quality-gate refinement and static checks; M5.4: PR validation and branch protection where supported.
