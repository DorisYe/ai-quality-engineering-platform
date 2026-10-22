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

## M3.3 local acceptance — 2026-10-21

Project owner reported **5/5 PASS**: selected and all-tests summaries, per-case details, retained console output and JSON output files. See `docs/milestone-3-3-acceptance.md`.

## M3.4: Execution History, HTML Reports & Evidence (implementation pending local validation)

- Every Portal-triggered test run now has a unique UUID and folder `data/qa-results/<run-id>/`.
- `run.json` stores execution metadata and parsed results for display after the Portal restarts.
- Each run keeps an independent `results.json`, `report/` HTML report and `artifacts/` Playwright test evidence.
- `GET /api/runs` provides up to 100 recent saved executions, `GET /api/runs/:id` provides one run, and `GET /api/runs/:id/evidence` lists evidence.
- The UI has an **Execution History** section; select a run to open its Playwright HTML Report or individual evidence files.
- The browser receives only files from allowlisted local report and artifact directories. This is still a local-only demo without authentication.

### Evidence strategy

The Playwright config now records **failure-only screenshots**, **failure-only videos** and **failure-retained traces**. Therefore a successful test run often has **zero evidence files**; its HTML Report is still available. Evidence links should be tested with a controlled intentionally failing test in M3.5, not by damaging production-like test code.

### M3.4 manual acceptance

1. Stop the existing Portal server on port 3200 and the AUT on port 3100.
2. Pull branch updates; start `npm.cmd run portal`; open http://127.0.0.1:3200.
3. Run Selected TC-003, then Run All. Both should complete successfully and create two history entries.
4. Select the older run and open its HTML Report. Verify it corresponds to one test rather than the newer full-suite run.
5. Restart the Portal server: the two previous runs should remain visible in Execution History.
6. Inspect `data/qa-results`: each run must have its own `run.json`, `results.json` and `report/index.html`.

**Known limitations:** existing executions created before M3.4 have no run metadata/history folder, and won't automatically appear. History keeps run files indefinitely (disk cleanup/retention policy will follow). A successful run may have no screenshots/videos/traces. This version is unverified until user local acceptance.

## M3.4 acceptance and M3.5 integration / evidence validation

On 2026-10-21 the project owner reported **5/5 PASS** for M3.4 manual acceptance (see `docs/milestone-3-4-acceptance.md`).

M3.5 adds a controlled, opt-in **Evidence Diagnostic (Expected Failure)** button. It selects `evidence-check`, which launches only `tests/evidence-diagnostic.spec.ts`. That test loads the AUT, records a deliberate attached screenshot, and intentionally fails an assertion so Playwright retains the failure screenshot, video, and trace. **A Failed status for this diagnostic is expected, not a product defect.**

Normal Run Selected and Run All explicitly exclude this diagnostic file; the normal five business tests are unchanged.

### Manual acceptance procedure

1. Stop Port 3100 (AUT) and Port 3200 (old Portal), then `git pull origin feature/qa-portal-m3-1`.
2. Run `node --check portal/server.js` and `node --check portal/test-runner.js`; restart `npm.cmd run portal` and open http://127.0.0.1:3200.
3. Run All: expect 5 passed. This confirms the diagnostic is not part of normal regression.
4. Click **Evidence Diagnostic (Expected Failure)**. The run should finish as **FAILED**, with one unexpected test; this result is intentional.
5. In Execution History, select the diagnostic run. Verify HTML Report opens and Evidence links include PNG screenshot, WebM video and ZIP trace (depending on Playwright artifact generation).
6. Restart Portal; verify both normal and diagnostic runs remain in history and their reports still open.
7. Do not merge PR #3 until the local execution and links are verified.

### Design notes

Failure-only evidence remains the default for the normal suite. The diagnostic is intentionally separate from the five business test cases, so no false regression failures are introduced. HTML reports and evidence files remain inside their unique run folders. A future improvement is automated server-side integration testing of file serving, safer network exposure, and artifact retention/deletion policies.
