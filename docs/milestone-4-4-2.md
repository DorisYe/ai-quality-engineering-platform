# M4.4.2 — Offline Trace Action Timeline (First Increment)

## Delivered
- Match allowlisted Playwright `before` and `after` events using `callId` within local Trace ZIP entries.
- Produce bounded `timeline` records with sanitized `action`, `durationMs` (or null when unavailable), and `failed` boolean.
- Expose parsed `completedEvents` and `failedEvents` counts in diagnostics.
- Browser Preview displays action timeline after safe action names.
- No raw arguments, selectors, URLs, network requests, screenshots, video, error messages, secrets, or ZIP contents are sent outside the local Portal.
- A failed action is **not** proof of product root cause. Unmatched actions or unavailable timestamps are omitted.

## Windows acceptance
Stop Portal; run:

```powershell
git pull origin feature/m4-bug-drafts
node --check portal/server.js
node --check portal/evidence-intelligence.js
node --test tests/*.test.cjs
npm.cmd run portal
```

**Expected: 21 Node tests** (previous 20 + one new timeline unit test).

In Portal, expand the prior DIAG-001 and click `Preview Local Evidence`. Confirm:
1. Existing screenshot/video/trace counts still match the run.
2. `Safe trace actions` still shows `goto`.
3. `Action timeline (safe metadata)` appears, even if empty for missing after-events.
4. `Trace parser diagnostics` includes completed/failed event counters.
5. No raw URL, selector or secret data appears; UI and Bug Draft Review still work.

**Limit:** A DIAG-001 failure is intentionally synthetic; timeline association via callId is partial and should not be represented as confirmed Root Cause Correlation. Full timeline coverage and evidence-level failure correlation are next.
