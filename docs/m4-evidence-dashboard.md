# M4 Evidence Analysis Dashboard — Closing Increment

Status: Implemented on **draft PR #4**, awaiting user Windows regression.

## What changed
- Replaced the full raw JSON Preview Local Evidence body with a clean local dashboard:
  - Screenshot/video/trace/unmapped ZIP counts.
  - Test Attempts summary with reporter-mapped trace ownership.
  - Scoped evidence and safe action timeline summary.
  - Failure assessment with explicit **unverified assertion link** and **root cause not established**.
  - Expandable Technical diagnostics retains existing mapping, per-attempt trace, reporter metadata, and parser diagnostics in sanitized JSON.
- Existing Evidence Preview API and backend logic are unchanged. Existing Bug Draft Review, Mock AI, and run workflow remain untouched.
- Render all dynamic text through `textContent`; no untrusted HTML insertion or remote AI request.
- Three frontend static regression checks added. Frontend JS syntax checked during implementation, but local Windows tests remain pending.

## One-pass acceptance on Windows
Close Portal; run:

```powershell
git pull origin feature/m4-bug-drafts
node --test tests/*.test.cjs
npm.cmd run portal
```

Expected **50 Node tests** (44 accepted before M4.4.8, 3 in M4.4.8, 3 dashboard tests). **Not independently run in this environment.**

Portal → Execution History → DIAG-001 → Preview Local Evidence:
1. Summary counts appear in four cards.
2. Test attempts shows DIAG-001 / Attempt 0 and mapped traces.
3. Evidence and timeline displays allowlisted actions where available.
4. Failure assessment states assertion link unverified, root cause not established.
5. Technical diagnostics expands to display safe structured data.
6. Run All, Bug Draft Review, Mock AI remain unaffected.

## Known limits and next step
Exact assertion callId matching remains out of scope by user choice. Verify 50 tests and perform final M4 integration review/documentation before merging PR #4 (merge is not authorized in this increment).
