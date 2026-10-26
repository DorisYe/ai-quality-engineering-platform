# M4.4.6 — Test Attempt ↔ Failure Evidence (first increment)

## Acceptance from prior phase
Project owner reported **M4.4.5 6/6 PASS**. Recorded in `docs/milestone-4-4-5-acceptance.md`.

## Implementation
Use Playwright JSON Reporter `spec.tests[].results[]` to identify each **test attempt** (including retries), status, and whether Playwright reported an error. Join evidence ONLY by reporter-confirmed `testId + attempt index` mappings from M4.4.5; do not match by filename or run membership alone.

The Portal Preview shows `Test Attempt failure evidence`, with records such as `testId`, `attempt`, `status`, `hasError`, `failureType`, `evidence`, `assertionMatched`, and `rootCauseConfirmed`.

**Important honesty boundary:** A Playwright result error does not necessarily prove an assertion failure. Therefore `failureType` is `reported-error-unclassified`, `assertionMatched:false`, and `rootCauseConfirmed:false`. Actual assertion-to-trace callId matching remains future work.

No raw error text, absolute paths, tokens, URLs, screenshot pixels, video or trace ZIP contents are returned in the attempt failure mapping. No external AI is called.

## Windows acceptance
Stop Portal, then run:

```powershell
git pull origin feature/m4-bug-drafts
node --check portal/attempt-failure-map.js
node --check portal/server.js
node --test tests/*.test.cjs
npm.cmd run portal
```

Expected **34 Node tests** (previous 31 + 3). In Execution History, open DIAG-001 and **Preview Local Evidence**.

1. `Test Attempt failure evidence` appears, showing `DIAG-001`, `attempt:0`, `status:failed`, and the mapped evidence from the JSON reporter.
2. `hasError` depends on the reporter's error data.
3. `assertionMatched:false` and `rootCauseConfirmed:false` remain.
4. Prior mapping, action timeline, correlations, and Mock AI/Bug Review work.
5. No raw absolute paths, secrets, or error messages are displayed.
6. A passing Run All shows passed attempts and no invented failure associations.

If the DIAG-001 result differs, provide the displayed `Test Attempt failure evidence` section rather than marking the test PASS.

## Later increment
Parse safe error *types* and reporter assertion metadata, if supported; introduce trace callId/attempt mappings with a verifiable matching rule. Do not claim causal root cause from co-occurrence.
