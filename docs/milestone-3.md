# Milestone 3 — QA Management Portal

## M3.1: Read-only Test Library

This standalone local portal lists five allowlisted Playwright test cases and displays their specifications. The Event Monitoring AUT continues independently on port 3100.

### Start on Windows

From repository root, in a terminal:

```powershell
npm.cmd install
npm.cmd run portal
```

Open **http://127.0.0.1:3200**. The portal works without the AUT server running; the optional AUT link requires starting `npm.cmd start` in a different terminal.

Portal endpoints: `GET /health`, `GET /api/test-cases` and `GET /api/test-cases/:id`.

### M3.1 manual acceptance

- QA Portal loads on port 3200, separately from AUT on 3100.
- Five test cases display; each has steps and expected results.
- Search filters the library.
- Selecting a different case updates the detail pane.
- Run Test is intentionally disabled until M3.2.

### Roadmap

- **M3.2:** isolated allowlisted execution runner and Run Test / Run All controls.
- **M3.3:** parse Playwright JSON reporter output.
- **M3.4:** persistent execution history and versioned HTML report/evidence links.
- **M3.5:** integration validation and review.

Security: M3.1 does **not** accept commands, run subprocesses or expose a public network interface. Bind address is `127.0.0.1` only. Do not deploy this teaching portal as-is to an untrusted network.

## M3.2: Run Selected / Run All (implemented; local acceptance pending)

Restart the Portal after pulling code: `npm.cmd run portal`. Make sure the Event Monitoring AUT server at **3100 is stopped**, because the Playwright config starts its own AUT during execution. The optional Playwright HTML Report viewer may also be stopped before test runs to avoid confusion over report files.

Select a test and press **Run Selected** or **Run All** on http://127.0.0.1:3200. The page polls `GET /api/runs/current` and shows live status and recent console output. Backend endpoint: `POST /api/runs` with JSON `{ "selection": "TC-003" }` or `{ "selection": "all" }`.

Only five known IDs or `all` are accepted. No caller-supplied command arguments. Only one process at once. The server is bound to loopback, but this is a local demo and not an authenticated production service. Cross-site access requires further hardening before deployment.

**Limitations:** execution state is in-memory and only the current run is visible. Detailed Playwright JSON result parsing, history persistence and dedicated evidence links are M3.3–M3.4. This implementation has not been run on the user's Windows machine yet.

### M3.2 acceptance

1. Stop port 3100 and refresh the portal on port 3200.
2. Select TC-003 and click Run Selected; verify status transitions running → passed, and the output indicates one test passed.
3. Click Run All; verify the output indicates five tests passed.
4. While running, buttons are disabled; backend rejects concurrent requests with HTTP 409.
5. Review the result after completion and verify unknown test IDs are rejected with HTTP 400 (optional API test).

## M3.2 user acceptance — 2026-10-21

The project owner confirmed all M3.2 manual acceptance checks passed in the local Windows environment after the Playwright `--grep` correction. This includes running a selected test and running the full suite through the Portal, with execution results displayed. This is user-reported manual acceptance, not independent CI verification.

The AUT on port 3100 is started and stopped by the Playwright `webServer` configuration for each test invocation; the independent Portal on port 3200 remains available.

## M3.3: Structured Playwright Results (implementation pending local acceptance)

Playwright now writes one JSON reporter file per Portal-triggered run to `data/qa-results/<run-id>.json`. The Test Execution Service parses the JSON and exposes `summary` in `GET /api/runs/current`.

The Portal shows total, passed, failed, flaky and skipped counts, plus a per-test status/duration table, alongside the existing console output. No new dependencies are required.

### Local acceptance

1. Stop Port 3200, then run `git pull origin feature/qa-portal-m3-1` and `npm.cmd run portal`.
2. Leave Port 3100 stopped. Run Selected on TC-003 and check **Total: 1 · Passed: 1** and a TC-003 results row.
3. Run All and check **Total: 5 · Passed: 5** and five results rows.
4. Confirm that a new JSON file is saved inside `data/qa-results/`.
5. Confirm the previous M3.2 live output still works. A Playwright execution failure should show a failed run and, when reporter output exists, structured failure results.

**Known scope limits:** Only the most recent run is exposed by the Portal API, even though JSON files are kept locally. Historical API / persistent run metadata are part of M3.4. Automated execution of M3.3 has not yet been validated on the project owner's Windows installation.
