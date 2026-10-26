# M4.4.8 Simplified implementation — attempt-scoped evidence (2026-10-24)

Status: **Implemented on Draft PR #4; local Windows acceptance pending**.

The owner requested skipping the more complex schema discovery and exact assertion-callId engineering. We implemented the safe and useful portion immediately:

- A new `portal/verified-attempt-summary.js` correlates parsed trace summaries only by **Playwright reporter testKey + retry/attempt**.
- Preview API now returns `verifiedAttemptSummary`: test ID, attempt, status, matched trace count, allowlisted failed action types, and conservative result flags.
- UI puts the new summary first in the existing Preview Local Evidence output (the other diagnostic sections remain available).
- Three Node tests cover duplicate TC labels, retry isolation and DIAG-001 privacy/diagnostic isolation.
- The summary explicitly says `assertionActionLink: unverified-no-shared-call-id` and `rootCause: not-established`. **It is NOT exact assertion-to-trace correlation.** We do not invent an assertion callId shared by JSON reporter and Trace.
- No external AI calls, screenshots, raw messages, URLs or trace payloads sent remotely; original Mock AI and Bug Review remain unchanged.

## One-pass acceptance (Windows)
Stop Portal and run:

```powershell
git pull origin feature/m4-bug-drafts
node --check portal/verified-attempt-summary.js
node --check portal/server.js
node --test tests/*.test.cjs
npm.cmd run portal
```

Expected **47 Node tests**, based on the previously accepted 44 plus three new tests. The repository changes have not been executed on the owner's machine or verified by CI.

Open the previous DIAG-001 in Execution History → Preview Local Evidence. Check `M4.4.8 ATTEMPT EVIDENCE SUMMARY`:
- `status: diagnostic-only`
- DIAG-001 Attempt 0, with `evidenceOwnership: verified-reporter-attachment` and `traceCount >= 1`, if its reporter mapping still exists
- `assertionActionLink: unverified-no-shared-call-id`
- `rootCause: not-established`

Confirm Run All / Bug Review / Mock AI remain functional. No additional per-stage acceptance needed. PR #4 remains Draft.
