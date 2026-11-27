# M5 — Final Integration & Acceptance

## Objective

Integrate automated tests into GitHub Actions to enable reliable CI-based test execution, automated quality gates, and test reporting, independently of the local QA Portal.

**Key objectives**
1. Establish a GitHub Actions CI workflow for automated test execution.
2. Execute Unit, Integration, and Playwright Core Regression tests within the CI pipeline.
3. Generate and preserve test reports and failure evidence.
4. Implement automated quality gates to detect issues early and ensure reliable CI results.

## Accepted implementation

- M5.1 GitHub Actions pipeline setup — owner accepted.
- M5.2 HTML report / failure evidence artifacts — owner accepted; negative TC-006 evidence verified in isolated branch.
- M5.3 static syntax, unit/integration and core Playwright quality gates — owner accepted; static negative check verified in isolated branch.
- The Node command was renamed to `npm run test:unit-integration` after the initial acceptance. **A clean CI run with this exact renamed command remains to be verified.**

## Integration risk and branch plan

As inspected on 2026-11-26:
- `feature/m5-3-quality-gates` is **69 commits ahead / 1 commit behind** `main` (diverged).
- Its M4.4 ancestor `feature/m4-4-integration-acceptance` is in its history; M5.3 is 21 commits ahead of M4.4.
- `main` contains the older M4 evidence-intelligence commit `68cf9d652ac43655bc169a06b3f0190fe2b7b365`, which is **not** incorporated into the accepted rebuild branch.
- Do not blindly merge the obsolete M4 architecture back into the simplified, accepted M4 rebuild. Compare and resolve conflicts carefully; do not merge validation branches.
- This document lives on `feature/m5-final-integration` created from accepted M5.3, and **does not itself merge or change main**.

## Final acceptance checklist

- [ ] Ensure renamed `test:unit-integration` passes locally and in a new green GitHub Actions run.
- [ ] Local static check passes: `npm.cmd run check:static`.
- [ ] Local combined Node tests pass: `npm.cmd run test:unit-integration`.
- [ ] Local Playwright core regression passes: `npm.cmd run test:core`, TC-001–TC-005 all passing; keep port 3100 free before launching Playwright.
- [ ] Validate clean GitHub Actions run on the integration branch. Add that branch to the `push.branches` filter or run a PR CI; confirm all 3 gates pass.
- [ ] Verify HTML artifact downloads, and previously accepted TC-006 failure evidence remains supported.
- [ ] Review divergence and conflicts against `main`; preserve working M3 and rebuilt M4, all local Run History, Bug Draft, Human Review and Evidence.
- [ ] Open a reviewed PR from `feature/m5-final-integration` into `main`; resolve any conflicting changes intentionally.
- [ ] Re-run PR CI and confirm 3 gates green. Do not merge a failing PR.
- [ ] Merge to `main` only after all checks and explicit review; verify `main` workflow runs and default-branch `workflow_dispatch` becomes available.
- [ ] Verify repository branch/ruleset protection feasibility; required status checks may depend on repository settings and account permissions.
- [ ] Mark M5 **CLOSED / ACCEPTED** only after integration and owner confirmation.

## Next milestones

- **M6 — QA Portal Test Execution & Scheduling**: CI test-case results and evidence, manual cloud execution, recurring schedule, one-time schedule (durable cloud scheduler). The previous M5.4 design is superseded; do not merge its proposal-only branch into M5.
- **M7 — Release Quality Dashboard** (former M6).
- **M8 — QA Portal Automated Testing** (former M7).
- **M9 — Bug Management & Jira Integration** (former M8).

**Current status: FINAL INTEGRATION PREPARED — not merged, not formally accepted.**
