# M5.3 — Automated Quality Gates

## Goal

Formalize the existing required CI checks and introduce lightweight static syntax checks, without adding new dependencies or changing the M4 controlled-defect behavior.

## Quality gate contract

On regular pushes, pull requests, and default manual core runs:

1. **Static syntax checks**: `npm run check:static` uses `node --check` on Backend and QA Portal JavaScript files.
2. **Node unit/integration tests**: `npm run test:unit-integration`.
3. **Playwright core regression**: `npm run test:core`, explicitly selecting TC-001–TC-005.

All three checks are **required** to succeed for the GitHub Actions `core-tests` job to succeed. GitHub Actions normally skips downstream test steps after a required step fails; failure-artifact upload still attempts to run. A failure before Playwright starts may produce no Playwright HTML report or failure evidence.

The static check is a **syntax check**, not ESLint, TypeScript type checking, security scanning or code-quality scoring; no such claims are made. Playwright test sources are TypeScript and are validated at execution/discovery time by the existing Playwright run, not by the `node --check` command.

### Intentional controlled failure

- TC-006 remains a real intentionally failing browser test but is **excluded** from the required core quality gate.
- DIAG-001 remains excluded from normal runs.
- Manual `controlled-defect` workflow execution still runs only TC-006 after the shared static and unit checks. It is expected to finish **red** and is not a passing quality gate. No new schedule or runner is added.

## Implementation

- `package.json` adds `check:static` to check the existing Backend and Portal server-side JavaScript.
- `.github/workflows/core-qa-ci.yml` includes `feature/m5-3-quality-gates` in push branches and adds **Static syntax checks (Backend + QA Portal)** ahead of browser installation and unit/core tests.
- The job name is now **Required Quality Gates (Static + Unit/Integration + Core Playwright)**.
- M5.2's HTML report and failure evidence uploads remain unchanged.

## Local verification (Windows)

First ensure your working tree is clean and you are not running the AUT on port 3100 for Playwright:

```powershell
git fetch origin
git switch --track origin/feature/m5-3-quality-gates
npm.cmd run check:static
npm.cmd run test:unit
npm.cmd run test:core
```

If already tracking the branch locally, use `git switch feature/m5-3-quality-gates` then `git pull origin feature/m5-3-quality-gates`.

## M5.3 acceptance checklist

- [ ] Local `npm.cmd run check:static` PASS.
- [ ] Local Node unit/integration tests PASS.
- [ ] Local TC-001–TC-005 regression PASS (5/5).
- [ ] GitHub Actions run on `feature/m5-3-quality-gates` shows all three required steps passing.
- [ ] Regular GitHub Actions run is green; TC-006 and DIAG-001 are absent from the required core suite.
- [ ] Existing M5.2 HTML Report artifact still downloads successfully.
- [ ] A deliberately invalid JavaScript syntax in an **isolated temporary validation branch** causes static checks to fail and the job to show red (negative-path gate verification; do not change main, accepted M5.2, or the permanent controlled defect).
- [ ] The temporary validation branch remains separate and does not get merged.

A red temporary negative-path run is the expected result **only for that isolated verification**. It should never be counted as a successful regular CI run.

## Boundaries

Branch protection / required PR status checks are postponed to M5.5. GitHub Actions test status is not yet enforced as a merge restriction.

**Status: ACCEPTED — owner-confirmed local, GitHub-hosted and negative-path validation (2026-11-26).**

## Final acceptance record — 2026-11-26

**ACCEPTED (project owner confirmed).** The owner confirmed all five normal-path acceptance checks passed, including local static/unit/core commands, successful three-gate GitHub Actions execution on `feature/m5-3-quality-gates`, and downloadable HTML report. The owner also confirmed all four negative-path checks passed on isolated `validation/m5-3-static-gate-failure` (commit `86b6d665ce053692036b2a074a1a4dc950778fe8`): workflow red, static syntax check fails specifically with SyntaxError, downstream Playwright regression skipped, and run belongs to the temporary validation branch.

This documents user-reported execution results, not an independently rerun test from the documentation update. The invalid syntax is **only** on the isolated negative-validation branch and must not be merged. Normal quality gates and the TC-006 controlled defect remain unchanged. Next: M5.4 CI Run History integration in QA Portal.

## Naming clarification (post-acceptance)

The Node test command was renamed from `npm run test:unit` to `npm run test:unit-integration` so its name accurately reflects that `node --test` runs both unit tests and M4 integration-contract tests. The GitHub Actions workflow was updated to call the new name. The underlying tests and Quality Gate criteria are unchanged; the renamed CI run requires a fresh green verification.
