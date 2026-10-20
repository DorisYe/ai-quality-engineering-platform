# Milestone 2 — First Playwright Execution

Date: 2026-10-20
Environment: Windows local machine; Chromium (Playwright configuration); 1 worker
Command: `npx.cmd playwright test`

| ID | Test case | Result | Duration |
| --- | --- | --- | --- |
| TC-001 | PowerShell event is processed and displayed in UI | PASS | 3.4 s |
| TC-002 | UI event details match backend record | PASS | 168 ms |
| TC-003 | UI acknowledgement updates backend status | PASS | 227 ms |
| TC-004 | Severity and status filters show matching events | PASS | 194 ms |
| TC-005 | Invalid event payload is rejected without being stored | PASS | 9 ms |

**Summary:** 5 passed / 0 failed (7.0 s total), as reported by the project owner from local terminal output.

**Follow-up checks:** repeated execution, HTML report review, failure evidence capture, script portability for CI. Current TC-001 requires Windows PowerShell, so Linux-hosted GitHub Actions needs a Bash-compatible variant or Windows runner.

**Scope note:** passing checks demonstrate covered workflows; not exhaustive product validation.

## Stability validation — 2026-10-20

Command: `npx.cmd playwright test --repeat-each=3`

**User-reported result:** 15 passed, 0 failed, 15.0 seconds, 1 worker. Each of TC-001–TC-005 passed all three repetitions in the same local Windows environment.

This is a successful local repeatability check; cross-browser, parallel, CI and environment portability checks remain outstanding.
