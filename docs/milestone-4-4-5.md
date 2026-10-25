# M4.4.5 — Test-to-Evidence Mapping

M4.4.4 user-reported **6/6 PASS**, recorded at `docs/milestone-4-4-4-acceptance.md`.

## Implementation
The QA Portal now maps Playwright JSON reporter `test.results[].attachments[].path` to an exact file inside the same run's allowlisted artifacts directory. Each matched entry identifies `testId`, `attempt` (zero-based), `kind`, `evidenceName`, `evidenceUrl`, and `association: playwright-json-attachment`.

**No guessing by filename, folder ordering, or shared run alone.** Unmapped items are listed with safe reasons, without returning raw attachment paths. Synthetic fixtures and older runs lacking `results.json` display an explicit unavailable status. The existing `assertionTrace` assessment is still conservative; this first increment does not yet bind assertion callIds to trace action callIds.

No API key, internet upload, new dependency, or provider costs.

## Acceptance — Windows

Stop the Portal, run:
```powershell
git pull origin feature/m4-bug-drafts
node --check portal/server.js
node --check portal/test-evidence-map.js
node --test tests/*.test.cjs
npm.cmd run portal
```

Expected **31 unit tests** (28 previously + 3).

1. Open historical DIAG-001; choose Preview Local Evidence.
2. Under `Test-to-Evidence mapping`, check for `mapped` entries with `testId: DIAG-001`, `attempt: 0`, and screenshot/trace/video names. Actual count depends on Playwright attachment report.
3. For an older fixture without results.json, mapping reports `verifiedOwnership: false`, without invented matches.
4. Confirm existing preview and Bug Draft UI behave as before.
5. Confirm no raw absolute filesystem paths or credentials are displayed.
6. Confirm the mapping is labeled reporter-based, not a root-cause determination.

**Limitation:** Exact attachment matching depends on the JSON reporter's attachment paths and the actual stored artifacts. If a real DIAG run shows zero mappings despite evidence, investigate the reporter paths and relative-path resolution; do not mark this acceptance PASS until reconciled.
