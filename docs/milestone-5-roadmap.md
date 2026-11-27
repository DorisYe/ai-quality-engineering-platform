# M5 — CI/CD Integration & Automated Quality Gates (Final Scope)

## Overall objective

Integrate automated tests into GitHub Actions to enable reliable CI-based test execution, automated quality gates, and test reporting, independently of the local QA Portal.

## Milestones

- **M5.1 — GitHub Actions Pipeline Setup — ACCEPTED**. Cloud Ubuntu + Node.js 22, unit/integration and Playwright core regression, push/PR/manual triggers.
- **M5.2 — CI Reports & Artifacts — ACCEPTED**. HTML report and fail-only screenshot/video/trace evidence, with intentional TC-006 validation isolated from required CI.
- **M5.3 — Automated Quality Gates — ACCEPTED**. Static syntax checks, Node unit/integration, and Playwright core regression; positive and negative-path validation documented.
- **M5 Final Integration & Acceptance — IN PROGRESS**. Verify the renamed `test:unit-integration` command on the final branch, resolve divergence with `main`, integrate safely through reviewed PR and verify required CI on the default branch. See `docs/milestone-5-final-integration.md`.

## Scope boundary

The former **M5.4 — QA Portal CI Integration** is moved **in full to M6 — QA Portal Test Execution & Scheduling**:
1. CI Playwright test-case results, failure evidence and a minimal *Tests Not Run* / pipeline failure indication; no DevOps step dashboard.
2. Manual GitHub Actions test execution from Portal, alongside existing Local Runs.
3. Recurring GitHub-based schedules.
4. One-time scheduled CI runs using a reliable cloud-persistent mechanism (not a local Portal timer).

The former M5.4 planning document on its isolated branch remains historical planning only; it is **not** a completed M5 feature.

## Later roadmap

- **M7 — Release Quality Dashboard** (formerly M6).
- **M8 — QA Portal Automated Testing** (formerly M7).
- **M9 — Bug Management & Jira Integration** (formerly M8).

**Status: M5.1–M5.3 accepted; M5 final integration and main-branch verification pending.**
