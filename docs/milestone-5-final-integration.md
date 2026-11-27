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
- The Node command was renamed to `npm run test:unit-integration` after the initial acceptance. Owner confirmed the renamed command PASS locally and in green GitHub Actions runs, including the final `main` workflow.

## Final integration record — 2026-11-26 / 2026-11-27 UTC

**FINAL ACCEPTANCE: CLOSED / ACCEPTED (owner-confirmed).**

- Local `npm.cmd run check:static`: **PASS** (owner-confirmed).
- Local `npm.cmd run test:unit-integration`: **PASS** (owner-confirmed).
- Local `npm.cmd run test:core`: **PASS**, core TC-001–TC-005 (owner-confirmed).
- Integration branch `feature/m5-final-integration` Core QA CI: **SUCCESS** (owner-confirmed).
- Older M4 source on `main` was intentionally not reintroduced: commit `8907c8ca9f786df5cdfd1dcb9ea85bf5627acaa7` merged its history using `git merge -s ours origin/main`, retaining the accepted rebuilt M4 + M5 tree.
- Pull Request **#7**, `feature/m5-final-integration` → `main`, was successfully merged; merge commit `986f181b45d91e2fe140b203a852be6fb15b5979`. GitHub returned `merged: true`.
- The GitHub Actions workflow and renamed unit/integration script were independently verified to exist on `main` following the merge.
- The owner confirmed the **latest `main` Core QA CI is green / SUCCESS**, completing post-merge CI acceptance.
- M5.2 report/evidence and M5.3 positive/negative checks were accepted earlier. Intentional TC-006 negative demonstration and isolated validation branches are excluded from the normal required test suite.
- This acceptance records the owner's reported CI outcomes. The repository's branch protection / ruleset policy is **not asserted as configured**, and is not a blocker to accepting M5 CI integration.
- QA Portal cloud execution, CI result display and recurring/one-time scheduling belong to the new **M6**, not M5.

## Next milestones

- **M6 — QA Portal Test Execution & Scheduling**: CI test-case results and evidence, manual cloud execution, recurring schedule, one-time schedule (durable cloud scheduler). The previous M5.4 design is superseded; do not merge its proposal-only branch into M5.
- **M7 — Release Quality Dashboard** (former M6).
- **M8 — QA Portal Automated Testing** (former M7).
- **M9 — Bug Management & Jira Integration** (former M8).

**Final status: CLOSED / ACCEPTED — PR #7 merged and post-merge `main` Core QA CI confirmed green by owner.**
