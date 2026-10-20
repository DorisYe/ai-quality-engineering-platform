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
