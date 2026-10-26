# M4.4.3 Failure Correlation — First Increment

## Prior acceptance
Project owner reported M4.4.2 Execution Timeline **6/6 PASS** on 2026-10-24; recorded in `docs/milestone-4-4-2-acceptance.md`.

## Implemented
- Analyze bounded, allowlisted, local Trace action timeline records; flag `failed: true` from trace `after.error` only.
- For each failed matched action, return up to three preceding action **types** as context.
- Each correlation is labeled `relation: preceded-in-trace` and `conclusion: unverified`. Temporal proximity does **not** establish causation.
- Expose `failureCorrelations` and `correlationStatus` via local Evidence Preview; UI renders both.
- A failing DIAG-001 test can legitimately show **no-matched-trace-failure** when the assertion failure is not represented as a matched Trace action. This is correct—not a test failure.
- Strictly no selectors, arguments, URLs, errors, screenshots, videos, or trace ZIP content sent to models.
- Three new unit tests cover association, no fabricated correlation, and field exclusion.

## Windows acceptance
Stop Portal and run:

```powershell
git pull origin feature/m4-bug-drafts
node --check portal/server.js
node --check portal/evidence-intelligence.js
node --test tests/*.test.cjs
npm.cmd run portal
```

Expected **24 Node tests** (21 previous + 3 new), subject to user verification.

Open DIAG-001 history, choose **Preview Local Evidence** and check:
1. Counts and `Safe trace actions` still display.
2. `Action timeline` and trace diagnostics still display.
3. `Failure correlations (unverified)` and `Correlation status` appear.
4. Correlation is either a real flagged action + preceding action types, or an empty array with a justified status; do not invent actions.
5. No raw secrets, selectors, URLs or error messages displayed.
6. Existing Run All, Bug Review, and Mock AI are unaffected.

## Not yet done
Assertion-to-trace correlation across attachments, cross-trace temporal ordering, and complete root-cause identification are not supported. Later phases need clean timestamp normalization and test-to-artifact association.
