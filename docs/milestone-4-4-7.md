# M4.4.7 — Evidence Mapping Hardening (Identity Increment)

## Implemented
- Exact evidence joins now use a per-reporter test identity (`test.id` when available, otherwise a deterministic reporter traversal index), combined with zero-based attempt index.
- `TC-001` / `DIAG-001` labels remain human-readable but cannot by themselves authorize an evidence join.
- Unknown specs are counted in fallback identity traversal so later specs keep consistent identities.
- Tests cover duplicate TC labels across specs, unknown preceding specs, and original attempt isolation. Prior behavior for reporter-grounded DIAG-001 remains.

## Limits
- This increment corrects **identity and join ambiguity**, not all PR review issues. Trace parsing in the Evidence Preview still reads up to two ZIPs at the run level, and assertion correlation remains unverified. Next: scope trace analysis to reporter-mapped test attempts, harden malformed ZIP handling, and improve the Evidence Dashboard.
- Identity fallback `report-index:N` is valid **only inside the same JSON report**, not across executions. The `pw:` prefix comes from Playwright's own reporter test ID and should not be treated as a security credential.
- No AI provider, external uploads or new package dependency.

## Windows local validation

Stop Portal, then:

```powershell
git pull origin feature/m4-bug-drafts
node --check portal/test-evidence-map.js
node --check portal/attempt-failure-map.js
node --test tests/*.test.cjs
npm.cmd run portal
```

Expected **36 Node tests** (34 previously reported + 2 identity regression tests). Open DIAG-001 and choose Preview Local Evidence; `Test-to-Evidence mapping.mapped` and `Test Attempt failure evidence.attempts` should now include matching `testKey` values for the same reporter test. Confirm other original evidence, timelines and review workflow still work.

## Acceptance checklist
1. 36 Node tests pass.
2. DIAG-001 mapped evidence and attempt share the same `testKey`.
3. Duplicate test labels regression test passes with no cross-assignment.
4. Unknown spec before DIAG-001 preserves fallback index alignment.
5. Legacy evidence preview and QA Review function without regressions.
6. No secrets/absolute local paths or external AI transfer introduced.
