# M4.2 Final Review and M4.3 Triage Foundation

## M4.2 acceptance
Owner reported **6/6 PASS** for the synthetic-fixture integration workflow, on top of the earlier **5/5 PASS** unit/regression acceptance. See `milestone-4-2-integration-acceptance.md`.

## Code review summary
- Validated editable fields and allowed review state/category/priority values.
- Approval is blocked unless classification and review notes are provided.
- Review metadata is stored per run; reload/restart persistence was validated.
- Synthetic fixture is labeled and is not a real defect; DIAG-001 is excluded.
- History expands details directly under the selected entry.

## M4.3 foundation (pending local verification)
- Added `portal/failure-triage.js` to produce **suggestions**, not conclusions, from known error text patterns.
- Categories include `Flaky test`, `Environment issue`, `Test automation issue`, or `Unclassified test failure`.
- All suggestions explicitly identify `source: rule-based`, `confidence: low`, and `requiresHumanReview: true`.
- Suggestion displayed next to each Bug Draft; it does **not** modify reviewer classification, approval state, or create GitHub issues.
- This phase does **not yet call an LLM**. Actual optional LLM integration should be separate, with privacy/consent, configurable model and external API handling.

## Acceptance
1. Stop Portal; pull `feature/m4-bug-drafts`.
2. Run `node --check portal/server.js`, `node --check portal/failure-triage.js`.
3. Run `node --test tests/bug-drafts.test.cjs tests/bug-review-store.test.cjs tests/failure-triage.test.cjs`. Expect **11 PASS**.
4. Start `npm.cmd run portal` and select existing `fixture-review` run in Execution History.
5. Verify the Bug Draft shows `Triage suggestion (rule-based, low confidence)`, and classification/review fields remain editable.
6. Verify the synthetic fixture is still clearly labeled and normal Run All / DIAG-001 create no Bug Draft.
7. Ensure no GitHub Issue is created and prior review notes survive reload.

## Follow-ups
- Replace heuristic-only triage with optional actual AI-assisted analysis behind explicit opt-in if desired.
- Prevent classification drift by using reviewer-confirmed fields as authoritative, not automated suggestions.
- Security hardening, audit log, optimistic concurrency and retention limits are still required for production use.
