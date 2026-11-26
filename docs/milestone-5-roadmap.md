# M5 — CI/CD Integration & Quality Gates (Updated Roadmap)

## Overall objective

Run core Playwright and Node tests automatically in GitHub Actions, retain CI test reports and evidence, and make CI execution history visible from the existing local QA Portal. Finish with quality checks and a reviewed PR workflow.

**Scope rule:** M5 integrates test execution and CI visibility. M6 still owns aggregated Release Quality Dashboard metrics, historical quality trends and Go/No-Go decisions. M7 owns QA Portal self-testing automation. M8.1 owns future Failure Signature and lightweight Jira-linked Bug Management enhancements.

## M5.1 — GitHub Actions Pipeline Setup — ACCEPTED

- Run Node unit/integration tests.
- Run clean Playwright Core Regression TC-001–TC-005.
- Trigger from push, PR and manual dispatch.
- Keep TC-006 intentional defect and DIAG-001 diagnostic outside normal CI.

Owner confirmed local test commands and GitHub Actions success.

## M5.2 — CI Test Reports & Artifacts — IN PROGRESS

- Upload the Playwright HTML Report for normal and failed executions when generated.
- Upload screenshots, videos and traces when failures produce evidence.
- 7-day artifact retention.
- Owner confirmed **all five happy-path checks PASS**.
- **Remaining acceptance:** manually run `controlled-defect` TC-006 and verify downloadable HTML Report, Screenshot, Video and Trace from a deliberately failed Actions run. Normal CI must remain green.

## M5.3 — GitHub Actions Run History in QA Portal — NEW

**Goal:** Display local and GitHub Actions executions in QA Portal so QA can track both in one place, without pretending a cloud run was executed locally.

Proposed lean MVP:

1. Add a clear execution source distinction (e.g. **Local** / **GitHub Actions**) in or alongside the existing Execution History. Do not rewrite existing local history.
2. Read **recent CI workflow runs** for this repository, showing commit/branch, trigger, started time, status/conclusion, and workflow run ID.
3. Offer direct **Open GitHub Run** and **Download Artifacts** links for CI runs. Where available, show a useful test summary without confusing job-level success with individual test results.
4. Provide a Refresh action and useful empty/error states, including GitHub API not configured and API rate limits.
5. Keep manually dispatched `controlled-defect` CI runs visibly labeled as **intentional demo failure**, distinct from actual core CI regressions.
6. Fetch CI history using a **read-only GitHub API integration through the Portal backend**. For private repositories, configure credentials locally via environment variables or another secure mechanism; never place a GitHub token in the browser, frontend bundle, Git or saved run records.
7. Do not synchronize CI artifacts into `data/qa-results` in the MVP, and do not trigger remote workflows from the Portal. The original local M4 Bug Draft and Human Review flow remains local-only.

Acceptance criteria:

- Local execution history and its evidence/review/export features remain unchanged.
- Recent GitHub Actions runs load in the Portal with correct source, branch, conclusion and links.
- A successful core run and an intentionally failed manual TC-006 run are distinguishable.
- The user can navigate from a CI run to its GitHub Actions page and downloadable artifacts.
- Missing credentials/network failures are handled safely and do not block local Portal operation.
- Read-only access; no automatic Jira tickets, CI mutations or premature release metrics.

Design validation must happen before implementation, especially repository access and the minimum GitHub authentication permissions needed.

## M5.4 — Automated Quality Gates — PREVIOUSLY M5.3

- Required Node unit/integration and clean core Playwright tests.
- Basic static checks and CI failure semantics.
- TC-006 continues excluded from required gates.

## M5.5 — Final Integration & PR / Branch Protection — PREVIOUSLY M5.4

- Verify the full CI pipeline and Portal CI visibility.
- Validate PR test results.
- Configure required status checks/branch protection where account and repository settings permit.
- Final M5 acceptance and documentation.

## Development sequence

Complete M5.2 failure-evidence acceptance first. Then design and implement M5.3 on a fresh feature branch based on the accepted M5.2 branch. Do not modify working CI/test execution while merely revising this roadmap.

## Non-goals

No scheduled nightly test run for now; no release readiness scoring (M6), no standalone Portal smoke suite (M7), no automatic defect deduplication or Jira integration (M8.1).
