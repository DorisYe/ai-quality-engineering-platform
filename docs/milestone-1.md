# Milestone 1 — Backend event pipeline

This pull request adds an initial local-only Node.js API and a file-backed SQLite database using `sql.js` (SQLite compiled to WebAssembly). The database is stored in `data/events.sqlite` and excluded from Git.

## Start on Windows

```powershell
npm.cmd install
npm.cmd start
```

Keep this terminal running. Open a second VS Code terminal:

```powershell
powershell.exe -NoProfile -File .\scripts\generate-event.ps1
Invoke-RestMethod http://127.0.0.1:3100/api/events
```

If you use PowerShell 7, `pwsh -NoProfile -File .\scripts\generate-event.ps1` also works.

## Start on Linux/macOS

```bash
npm install
npm start
# second terminal:
bash scripts/generate-event.sh
curl http://127.0.0.1:3100/api/events
```

## API examples

- `GET /health`: server health
- `POST /api/events`: create event (type, severity, source)
- `GET /api/events`: list events
- `GET /api/events/:id`: fetch a specific event
- `POST /api/events/:id/acknowledge`: acknowledge an event

Example valid POST body:

```json
{"type":"StorageCapacityWarning","severity":"Warning","source":"TestStorage01"}
```

Expected response: HTTP 201 with a generated ID, Active status and timestamp.

Invalid event payloads return HTTP 400. Database contents persist across process restarts.

## Current limitations

- Local learning application only; no authentication, concurrency management, network exposure, or production hardening.
- Database export rewrites a small SQLite file after changes. Suitable for a local demo, not a production database service.
- Event generator scripts send HTTP POST; they do not insert SQL rows directly.
- No web UI or Playwright tests yet. Those are upcoming milestones.
