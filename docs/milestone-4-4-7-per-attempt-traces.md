# M4.4.7 Per-Attempt Trace Selection — Development and Acceptance

## Prior milestone
M4.4.7 Identity Hardening **6/6 PASS** reported locally by project owner; see `milestone-4-4-7-identity-acceptance.md`.

## Implemented
- Portal now reads JSON Reporter mapping **before** selecting ZIP traces.
- Only ZIPs with an exact Playwright reporter attachment mapping to an identified test / attempt are parsed into `perAttemptTraces`.
- Each scoped result contains `testKey`, `testId`, zero-based `attempt`, attachment name, safe action types, timeline, correlations, and diagnostics.
- `unmappedTraceCount` records unowned ZIPs: no inference from file name or folder.
- Three unit tests cover distinct attempts, unmapped files, and non-Trace attachment filtering.
- Previously existing summary actions/timeline still appear for compatibility, but are **aggregated across reporter-mapped traces** and should not be interpreted as a single timeline. Use `perAttemptTraces` for accurate scope.
- Legacy `assertionTrace` remains **same-run-only/unverified**. True Assertion callId linking and precise timeline ordering remain future work.

## Local verification (Windows PowerShell)
Stop Portal, then:

```powershell
git pull origin feature/m4-bug-drafts
node --check portal/server.js
node --check portal/trace-selection.js
node --test tests/*.test.cjs
npm.cmd run portal
```

Expected **39 tests** (36 previous + 3 new).

In the previous DIAG-001 run's **Preview Local Evidence**, confirm `perAttemptTraces` holds at least one entry with `testId: DIAG-001`, `attempt: 0`, and corresponding reporter-derived `testKey`. Action `goto` should still be visible if the matching Trace includes it. Check `unmappedTraceCount` and existing Preview/Review features.

### Acceptance checklist
1. All 39 Node tests pass.
2. Real DIAG-001 trace appears in `perAttemptTraces` with correct `testKey` and `attempt`.
3. Unmapped trace ZIP is excluded (unit test) and counted; no guessed ownership.
4. Existing counts/diagnostics and action list still show expected values for mapped traces.
5. Review/Mock AI/Run All not regressed.
6. Only safe metadata is returned, no raw Trace data uploaded.

**Limitation:** This is local developer-tested-by-user acceptance pending; GitHub commit alone does not establish runtime PASS.
