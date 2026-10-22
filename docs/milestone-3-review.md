# Milestone 3 — Final Review

## Acceptance basis

M3.1–M3.5 passed project-owner manual verification on Windows. Normal five-case regression remained 5/5 PASS; DIAG-001 intentionally failed and its PNG, WebM, ZIP and HTML Report were checked.

## Review findings

- Separation: standalone QA Portal on 3200, AUT on 3100 (Playwright webServer lifecycle).
- Invocation: allowlisted test IDs and diagnostic selector; child process spawned without shell.
- Structured reporting: JSON results parsed into UI summaries; raw console output retained.
- Evidence: unique run folders, independent HTML report and artifact links, persisted run metadata.
- Regression isolation: diagnostic file is excluded from normal five-case runs.

## Follow-up items (not blockers for local educational milestone)

- Local-only security posture: no authentication, CSRF token, or production-safe report isolation. Do not expose Portal on public interfaces.
- Evidence artifact size/disk retention is unlimited; implement retention policy before sustained use.
- Run execution is single-process and in-memory; restart during an active run requires interrupted-run reconciliation.
- Path-based report serving needs stronger filesystem and content isolation before multi-user deployment.
- Automated CI, cross-platform execution and synthetic failure regression for the Portal are not yet in place (planned M5).
- Current UI does not distinguish diagnostic expected failures in aggregate historical pass rates; segregate diagnostic runs in future analytics.

## Decision

Accept M3 as a **local educational QA Management Portal**, backed by user-reported manual acceptance. Not a production-ready multi-user system. Merge after repository checks permit.
