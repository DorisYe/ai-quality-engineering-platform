# M4.4.4 Assertion-to-Trace Correlation — design and first implementation

M4.4.3: **6/6 PASS**, reported by project owner; see `milestone-4-4-3-acceptance.md`.

## Design principle
An unexpected Playwright assertion and an action in the same run are not necessarily causally related. Until test-to-artifact and assertion callId links exist, the first implementation returns a **conservative association assessment** instead of fabricating a confirmed correlation.

Status conditions:
- `diagnostic-only`: DIAG-001 evidence check. No product defect inference.
- `no-assertion-failure`: all tests passed.
- `ambiguous-test-ownership`: multiple unexpected tests.
- `ambiguous-trace-ownership`: none or multiple ZIP traces.
- `insufficient-trace-data`: matched action timeline absent.
- `candidate-context-only`: one unexpected test, one ZIP, timeline present; report only allowlisted last five action types as **same-run** context.

For candidate context, `assertionMatched: false`, `rootCauseConfirmed: false`. No raw errors, selectors, URLs, screenshots, or trace files are uploaded. No AI calls.

## Future stronger correlation
1. Persist stable Playwright test ID ↔ attachment path ↔ test attempt index.
2. Extract assertion event metadata and call IDs from trace and test results.
3. Normalize clocks and identify nearest events within the **same test attempt**; do not conflate time proximity with causation.
4. Require a concrete matching criterion, and distinguish evidence-backed association from a plausible hypothesis.
5. Keep explicit review and privacy boundaries.

## Acceptance on Windows
Stop Portal, pull `feature/m4-bug-drafts`, run `node --test tests/*.test.cjs` (expected **28 tests**, previously 24 + 4), then `npm.cmd run portal`.

Open DIAG-001 and Preview Local Evidence:
- `Assertion-to-Trace assessment.status` should be `diagnostic-only`.
- `matches` should be empty and no root cause asserted.
- The previous action timeline, trace diagnostic, and failure correlations still appear.
- A passing Run All should show `no-assertion-failure`.
- All previous Bug Review and Mock AI functionality must remain intact.

This is a design increment; real assertion-to-action linkage is **NOT** yet implemented or acceptance-tested.
