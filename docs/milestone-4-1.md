# Milestone 4.1 — Rule-based Bug Draft Generation

This phase adds read-only Bug Drafts to the QA Portal **without** automatically creating GitHub issues.

## Design

- `GET /api/runs/:id/bug-drafts` returns proposed bug drafts for **unexpected** Playwright test outcomes in a completed, non-diagnostic run.
- `evidence-check` (DIAG-001) is excluded because its assertion failure is intentional.
- The draft includes title, test ID, raw failure error, cautious expected outcome, suggested manual investigation/reproduction steps, links to available evidence and HTML report.
- Drafts are **not confirmed defects**. A QA reviewer must independently check whether failure comes from the AUT, environment, test automation or flaky behavior.
- The current implementation generates drafts on demand; it does **not** persist edited drafts, create tickets, infer exact UI reproduction steps, or call an AI service.

## Local acceptance

1. In project root, stop Portal port 3200; pull `feature/m4-bug-drafts`, run `node --check portal/server.js`, `node --check portal/bug-drafts.js`, and `node --test tests/bug-drafts.test.cjs`.
2. Run `npm.cmd run portal` and open http://127.0.0.1:3200.
3. In Execution History, click a successful Run All. Expect **No unexpected test failures in this run**.
4. Click a DIAG-001 `evidence-check` historical run. Expect **Diagnostic failures are intentionally excluded**.
5. For actual failed regular tests (if any), open the associated run to view a Bug Draft and click **Copy Bug Draft**. Never deliberately break the 5 baseline business tests just to pass this check.
6. Check `GET /api/runs/<run-id>/bug-drafts`: successful/diagnostic runs return `{"drafts":[]}`.

### Planned follow-up

M4.2: Persistent draft review workflow (status, editable classification/priority, approval) with safely stored records. M4.3: optional AI-assisted triage after a rule-based baseline is validated; no automatic issue creation without user approval.
