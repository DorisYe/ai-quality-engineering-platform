# M5.4 — QA Portal CI Execution & Results Management (Revised Design)

## Status and decision

**DESIGN REVISED — NOT IMPLEMENTED.** Owner-defined goal: QA operates manual execution, recurring and one-time scheduled cloud regression, and views pipeline/test outcomes without having to open GitHub Actions for normal tasks. Build incrementally; do not treat a proposed UI as operational.

## Functional requirements

1. **Manual execution**: preserve existing Local Test Runner; add a separate GitHub Actions manual dispatch (Core TC-001–005; controlled TC-006 demo only via an explicit separate choice).
2. **Recurring schedule**: QA configures e.g. daily at **00:00 America/Toronto**, weekdays or weekly. Store timezone explicitly and handle DST. Cloud scheduling must continue after local PC or Portal shuts down.
3. **One-time schedule**: QA schedules a particular date/time (e.g. this Saturday 22:00), executes once, and sees Pending / Triggered / Completed / Failed-to-dispatch / Cancelled. Must have a **durable, independently hosted scheduler**, or another proven cloud-backed mechanism; GitHub Actions cron alone does not provide a native one-off dispatch. Do not build a local in-process timer and promise offline reliability.
4. **History**: separate Local Runs and GitHub Actions Runs, with branch, commit, trigger, timestamps, overall result, workflow URL, and refresh. Preserve existing local Bug Draft, Review, and Evidence behavior.
5. **Drilldown**: display **whole pipeline**, individual **job/step quality gates**, and **test suites/cases** when structured test data actually exists. Distinguish `failed`, `skipped`, `not_run`, `unavailable` and `pending`. Never turn missing data into PASS or FAIL.

## Result model / failure classification

**Layer 1: Workflow status.** From GitHub Actions API, report queued / in_progress / completed and conclusion (success/failure/cancelled/etc.), branch/SHA/trigger.

**Layer 2: Job and steps.** From GitHub Actions Jobs API, report checkout, Node setup, dependency install, static syntax, Chromium install, Node unit/integration, Playwright core, artifact upload: statuses and failure stage. These are *steps*, not necessarily separate GitHub jobs. A failed environment/setup/static gate may prevent all tests from running. Show **Pipeline/Infrastructure Failure** or **Quality Gate Failure**, not test-case failure, until test-level evidence exists.

**Layer 3: Test outcomes.**
- Node `npm run test:unit-integration`: both Unit and Integration tests. Detailed counts / names require a **structured Node test reporter artifact** (or reliable parser), not merely a successful GitHub step.
- Playwright `npm run test:core`: TC-001–TC-005. Detailed counts and per-test failures require a **Playwright JSON/JUnit report** (or equivalent structured artifact). Existing Playwright HTML artifact and evidence link remain useful, but GitHub's workflow-runs API does not itself contain individual cases.
- `test:unit-integration` currently combines the two kinds under one command; a test category tag or suites split is necessary if Portal must accurately show separate Unit vs Integration totals.

**Examples:** dependency install failure -> workflow FAIL, install step FAIL, all tests NOT RUN; syntax failure -> syntax FAIL, Node/Playwright SKIPPED; Node integration test failure -> Node test failure with structured details (if report available), Playwright SKIPPED; Playwright assertion failure -> Playwright FAIL with failed case and evidence; artifact upload failure -> pipeline/artifact failure even if tests passed. Display last failing or relevant steps, and preserve access to GitHub run logs.

**No test result fabricated from a green/red workflow**. Controlled TC-006 is an expected demo only when dispatch mode is verifiably known; a red run does not prove it was intentional.

## Execution and scheduling architecture

- **Local**: Portal Backend -> existing local Playwright Runner -> local results/evidence.
- **Manual cloud**: Portal Backend -> GitHub Workflow Dispatch API -> cloud runner -> GitHub workflow/job/run metadata + structured test artifacts -> Portal read-only display.
- **Recurring cloud**: GitHub cron on the default branch (or durable dispatcher) configured through secure, auditable authorized changes. GitHub schedules can be delayed; don't claim exact-minute guarantees.
- **One-time cloud**: independent durable cloud scheduler, with persistent job records, idempotent dispatch, retries/errors, user timezone and DST rules, schedules surviving Portal shutdown. Select implementation only after validating hosting/credential approach; no reliance on local Portal availability.
- **Config controls**: separate permissions for viewing Actions and dispatching/editing schedule. Guard minimum permissions, allowlisted workflow, test modes and branches; no GitHub tokens in browser, logs, returned API or local run data. Schedule config changes should have an audit trail and never bypass mandatory PR quality checks.
- GitHub workflow_dispatch has default-branch workflow-registration constraints; full dispatch/scheduling acceptance may depend on M5.5 default-branch integration.

## Phased implementation sequence

**M5.4-A**: CI History + job/step outcomes; validate setup/gate/test failure distinctions.
**M5.4-B**: Structured Node + Playwright reporting with real suite/case counts, without altering required gate semantics.
**M5.4-C**: Secure Manual GitHub Run trigger; existing Local Run remains unchanged.
**M5.4-D**: Recurring schedule management (daily/weekly) with cloud persistence.
**M5.4-E**: One-time scheduled cloud dispatch, **conditional on choosing and provisioning a reliable durable scheduler**; otherwise explicitly defer rather than fake reliability.
**M5.5**: branch/default-workflow integration, permission governance, required checks/merge protection, and cross-cutting acceptance.

## Acceptance

- [ ] Local Execution History and M4 review/export/evidence work unchanged.
- [ ] CI History shows accurate run, branch, trigger, commit, status/conclusion and secure GitHub links.
- [ ] Job/step status shows exactly which setup or quality gate failed; never implies tests ran when they were skipped.
- [ ] Node unit/integration details appear **only** when evidence is available; category totals correctly differentiated or clearly shown combined.
- [ ] Playwright case details and failed evidence accurately reflect structured run data; missing/expired artifact handled explicitly.
- [ ] Manual cloud dispatch works with restricted permissions and safe failure/error messages.
- [ ] Recurring schedule persists and runs without local Portal/PC online; timezone verified.
- [ ] One-time schedule executes once with durable cloud state, or is explicitly marked pending/deferred if cloud scheduler is not provisioned.
- [ ] Failure cases tested for checkout/dependency failure, static gate failure, unit/integration failure, Playwright failure, upload failure, GitHub API unavailable, no token, insufficient permission.
- [ ] Controlled failure is not confused with a genuine CI failure, and normal core CI remains required.
- [ ] Scheduled behavior and configurations are auditable; required branch-protection gates cannot be disabled by ordinary QA.

## Milestone boundaries

M6 retains aggregated quality trends/release readiness. M7 retains Portal self-tests. M8.1 retains failure signatures and Jira-oriented bug tracking. No changes to M3/M4 local execution until explicit implementation review.

**Status: DESIGN READY, implementation and owner acceptance pending.**
