# M4.2 — Bug Draft Review Workflow

M4.1 manual acceptance was reported **5/5 PASS** by project owner, recorded in `docs/milestone-4-1-acceptance.md`.

## Implemented
- For each **unexpected failure in a non-diagnostic run**, Portal displays a reviewable Bug Draft.
- A reviewer can change **Classification**, **Priority**, **Review status** (`draft`, `in_review`, `approved`, `rejected`) and **Review notes**.
- **Approve** is blocked unless Classification is chosen and nonempty Review Notes are supplied. Approval means QA reviewed the draft, **not** that a GitHub issue was filed.
- A dedicated `PATCH /api/runs/:id/bug-drafts/:draftId` endpoint validates editable fields; existing `GET /api/runs/:id/bug-drafts` merges saved review decisions.
- Review data is persisted per-run as `data/qa-results/<run-id>/bug-draft-reviews.json`, surviving Portal restart.
- No GitHub issue creation, external system writes, or AI service calls.

## Local acceptance
1. Close Portal; update `feature/m4-bug-drafts`, run `node --check portal/server.js`, `node --check portal/bug-review-store.js`.
2. Run `node --test tests/bug-drafts.test.cjs tests/bug-review-store.test.cjs`: expect **7 unit tests PASS**.
3. Start `npm.cmd run portal`; confirm Run All still gives 5/5 PASS and history/reports work.
4. Successful Run All and DIAG-001 should show no reviewable drafts (expected).
5. If a **non-diagnostic failed run** already exists, open that entry, set Classification/Priority/Review Notes, select `in_review`, Save Review, refresh and confirm persistence.
6. For an actual reviewable draft, `approved` without a classification and notes is rejected; valid approval survives server restart.

**Acceptance limitation:** If all five normal tests have always passed, steps 5 and 6 cannot be exercised with existing run history. The four new unit tests cover persistence and approval validation with synthetic failures. A safe controlled integration fixture or dedicated API test can be added next without breaking the baseline regression tests.

## Next
M4.3 AI-assisted triage optional. Human review remains mandatory; approved drafts do not automatically create issues.
