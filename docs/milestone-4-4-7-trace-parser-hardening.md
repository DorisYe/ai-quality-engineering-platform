# M4.4.7 Trace Parser Hardening — First Increment

Prior **Per-Attempt Trace Selection 6/6 PASS** recorded as user-reported local acceptance in `milestone-4-4-7-per-attempt-acceptance.md`.

## Changes
- Check ZIP file size using `statSync` before reading ZIP bytes.
- Return a complete empty parser result for unreadable or invalid inputs.
- Reject ZIP64 / unsupported oversized directory metadata, and reject out-of-bounds central-directory and entry records.
- Bound entry offsets, compressed entry sizes, uncompressed totals, and deflate output.
- Add five negative tests: truncated ZIP, ZIP64 sentinel values, invalid central directory offsets, oversized ZIP, and unreadable file.
- Continue parsing **only reporter-mapped test-attempt traces**, fully offline.

**Scope / limitation:** The ZIP parser remains minimal; it is not a replacement for a mature, audited ZIP library, and no claim is made of production-grade ZIP security. Real Playwright trace compatibility and UI regression must be verified on Windows after these changes.

## Acceptance (Windows PowerShell)
Stop Portal, then:

```powershell
git pull origin feature/m4-bug-drafts
node --check portal/evidence-intelligence.js
node --test tests/*.test.cjs
npm.cmd run portal
```

Expected **44 Node tests** (39 previously accepted + 5 new). Open the existing DIAG-001 History > Preview Local Evidence, ensure real Trace is still parsed, with `goto` where previously shown, a nonempty mapped `perAttemptTraces` result, and no raw data leaks.

Checklist:
1. All 44 Node tests pass.
2. Truncated ZIP / invalid directory / ZIP64 negative tests pass.
3. Oversized ZIP and missing path safely return a reason.
4. Real DIAG-001 trace remains readable and scoped to its mapped attempt.
5. Run All, Mock AI, Bug Review and Portal remain unaffected.
6. No raw Trace, parameters or errors sent off device.

Potential follow-up: investigate supported ZIP features and replace custom ZIP parsing with a well-maintained dependency before any deployment with untrusted inputs.
