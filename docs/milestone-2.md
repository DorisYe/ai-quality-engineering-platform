# Milestone 2 — Playwright E2E Automation

## Purpose
Convert the five existing test scenarios from `docs/test-specification.md` into executable tests.

## Getting started (Windows)
From the repository root:

```powershell
npm.cmd install
npx.cmd playwright install chromium
npx.cmd playwright test
npx.cmd playwright show-report
```

**Important:** Shut down any existing application process listening on port 3100 before running the tests. Playwright's `webServer` starts a separate backend automatically, and deliberately does not reuse an unknown old server.

To watch browser execution: `npx.cmd playwright test --headed`

To run only TC-001: `npx.cmd playwright test -g "TC-001"`

To use UI mode: `npx.cmd playwright test --ui`

## What to expect

- TC-001 invokes the trusted local PowerShell (Windows) or Bash (Linux) event generation script, queries the backend, and verifies that the generated event reaches the dashboard.
- TC-002 compares a database-backed API record to UI text.
- TC-003 acknowledges an event in the browser and then verifies the API state.
- TC-004 checks positive and negative Severity/Status filter assertions and status changes.
- TC-005 sends invalid input and confirms rejection and no persisted record.

## Design choices
- Page Object Model in `pages/EventsPage.ts` centralizes UI interactions.
- One worker avoids shared local SQLite state races in this teaching demo.
- Real API calls generate test data; browser waits rely on Playwright's retrying assertions, not fixed sleeps.
- Each generated event has a unique ID assigned by the backend. TC-001 uses a distinct source to match its scripted event.
- HTML reports, traces, screenshots and test result files are ignored by Git.
- On Windows, the PowerShell subprocess uses a process-scoped `-ExecutionPolicy Bypass` to run only the repository's reviewed local script; do not use this for untrusted scripts. Group Policy may prevent this on managed systems.
- This is an educational test suite, not a production-hardened environment. Linux CI requires Bash, curl and Node.js; Windows requires PowerShell.
- No tests have been verified on your local computer until you run them and share their results.

## Interview reflection
Explain the difference between using a real event-generation script for end-to-end coverage and directly creating events via API for faster test-data setup.
