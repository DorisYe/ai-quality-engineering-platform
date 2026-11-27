# M4.3 — Human Review & Triage

## Scope

M4.3 extends accepted M4.2 Bug Drafts with a human review workflow while keeping the lean architecture. No Jira API calls, AI integrations or defect filing.

- **Review Panel:** Each M4.2 Bug Draft in Execution History exposes an editable review form.
- **Editable fields:** Title, Expected, Actual, Steps to Reproduce.
- **Independent review states:** Review Status (`needs-review` / `reviewed`) and Triage Decision (`needs-investigation`, `confirmed-bug`, `not-a-bug`).
- **Classification:** Severity (`unassigned`, `critical`, `high`, `medium`, `low`) and Priority (`unassigned`, `p0`–`p3`).
- **Review Notes:** Editable text; required if a user marks a still-unresolved case as reviewed.
- **Save Review:** Local persistent review records; refresh/restart/reopen recovers saved values.
- **Export Bug Report:** Download a plain-text `.txt` report based on the latest **saved** review, with Run ID, selected field values and Run-level evidence links.
- **Jira Integration:** Visible disabled button **“Jira Integration (Coming Soon)”**; no endpoint or integration is implemented.

## Architecture

Generated M4.2 `run.json` Bug Drafts are immutable under the review API. User-entered review state is stored separately at:

`data/qa-results/<run-id>/reviews.json`

New local HTTP endpoints:

- `GET /api/runs/:id/drafts/:index/review`
- `PUT /api/runs/:id/drafts/:index/review`

The draft index is 1-based. An invalid Run ID or draft index returns 404; invalid field values return 400. A revision mismatch returns 409 and the reviewer must reload rather than overwrite newer content. The backend checks the allowed enum values and field sizes, and writes saved records atomically using a temporary file and rename. The origin rule for state-changing requests covers both POST and PUT.

**Important:** `confirmed-bug` is a **human decision**, not an automatically inferred classification. Evidence links are still **Run-level** and not guaranteed to belong to the specific failing test.

## Acceptance — Windows

With a clean working tree and stopped Portal:

```powershell
git fetch origin
git switch --track origin/feature/m4-3-human-review
node --test tests/bug-review.test.cjs
node --test tests/bug-drafts.test.cjs
node --test tests/failure-detection.test.cjs
node --test tests/test-selection.test.cjs
npm.cmd run portal
```

If the branch already exists locally, `git switch feature/m4-3-human-review` and `git pull origin feature/m4-3-human-review`. Keep port 3100 free; refresh the UI at http://127.0.0.1:3200 with Ctrl+F5.

### Checks

1. All new review unit tests PASS (validation, persistence, revision conflict, missing draft and unresolved-note validation).
2. Previous M4.2/M4.1/M3.6 Node tests remain PASS.
3. Run All with 5 PASS: no new Bug Draft or review form; existing results remain visible.
4. DIAG-001 intentional failure: still excluded from Bug Draft/Review.
5. The test fixture verifies saving and reloading edited Expected/Actual/Steps, Triage Decision, Severity, Priority and Review Notes.
6. The unit test verifies a stale revision is rejected (409), leaving prior saved review intact.
7. For an **actual unexpected failure** (when one is available), expand the historical Run's Bug Draft, edit and save, refresh the page and confirm data persists.
8. After saving a real draft, export the `.txt` file and verify its fields and Run-level evidence disclaimer. Changing a field disables export until another successful save.
9. Jira Integration is gray/disabled; no Jira action can be triggered.
10. Test Library checkbox selection and History inline expansion remain usable.

### Testing caveat

The normal five tests all passing **cannot demonstrate the review form**. The controlled DIAG-001 is deliberately excluded, so it also does not produce a draft. The new unit tests cover persistence without intentionally breaking a valid product test. Full browser review/export acceptance requires an unexpected failure from a normal test or an explicitly approved isolated demo fixture; it cannot honestly be marked browser-validated from a 5/5 PASS run alone.

## Boundaries

- Single local reviewer workflow; no user accounts, authentication, Jira, or synchronized team edits.
- Revision check prevents straightforward stale overwrites; this is not a production-grade multi-user transaction system.
- No changes to the Playwright evidence generation policy.
- Keep M4.3 branch separate from accepted M4.2 until the user validates it.
