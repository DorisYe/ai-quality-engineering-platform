# M4.4 — End-to-End Integration & Acceptance

## Goal

Verify the complete accepted M4 workflow without adding product features:

Playwright -> M4.1 Failure Detection -> M4.2 Bug Draft Generation -> M4.3 Human Review & Triage -> Save / Export.

M4.4 is **not** Jira Integration, AI Failure Signature Analysis, Bug Deduplication, or a new Bug Management UI; those are later enhancements (M8.1). QA Portal self-testing automation is planned for M7, not expanded here.

## Baseline

M4.3 was confirmed by the owner as locally accepted, including TC-006 controlled defect, review persistence, TXT export, video serving and the relocated TC-006 Test Specification note. TC-006 remains deliberately broken in the AUT for future demonstrations. M4.4 branches from `feature/m4-3-human-review`, preserving all those changes. Do not merge M4.4 into `main`, where older M4 code exists, without first reconciling the accepted rebuild branch.

## M4.4 usability fix: human-readable Actual Result

Bug Draft generation now formats Playwright locator assertion errors into concise descriptions (for example `Element '#status-filter': expected "All", but received "Active".`). This removes ANSI color escapes and repetitive Call Log text from the newly generated draft's editable `Actual Result`.

The original Playwright error remains unchanged in `failureDetection.failures[].errorMessage`, the test result summary and HTML report for technical troubleshooting. This is presentation formatting, **not** root-cause analysis or failure-signature detection (M8.1).

**Existing historical Bug Drafts and saved Reviews are not retroactively edited.** Rerun TC-006 after pulling M4.4 to see the new default Actual Result. For older saved reviews, QA can edit the Actual Result manually.

## Integration tests

`tests/m4-integration.test.cjs` adds four contract-level scenarios:

1. One unexpected TC-006 failure feeds M4.1 and generates one M4.2 review-only draft with run-scoped evidence, whose M4.3 review can be saved and reloaded independently of immutable run.json.
2. Two runs with the same failure keep **separate run-specific drafts and reviews**; M4.4 performs no automatic deduplication.
3. Five ordinary passing cases generate no drafts; DIAG-001 remains excluded.
4. Missing/unparseable Playwright result cannot be mistaken for a passing run with zero failures.

These contract tests use isolated synthetic `data/qa-results/<uuid>` records and clean up after themselves. They **do not** replace running TC-006 end-to-end in the real Playwright + Portal UI.

## Local testing (Windows)

Before starting a Portal-driven Playwright run, stop any AUT manually launched on port 3100. The Portal can remain on port 3200.

```powershell
git status
git fetch origin
git switch --track origin/feature/m4-4-integration-acceptance
node --test tests/m4-integration.test.cjs
node --test tests/failure-detection.test.cjs
node --test tests/bug-drafts.test.cjs
node --test tests/bug-review.test.cjs
node --test tests/test-selection.test.cjs
node --test tests/evidence-serving.test.cjs
npm.cmd run portal
```

If the branch already exists, `git switch feature/m4-4-integration-acceptance` and `git pull origin feature/m4-4-integration-acceptance` instead.

## Final M4.4 UI acceptance checklist

- [ ] M4.4 integration test (4 scenarios) PASS and all existing M4 regression tests PASS.
- [ ] Test Library and Test Specification show TC-001–TC-006; demo notice appears only on TC-006 specification.
- [ ] Select TC-001–TC-005: Run Selected produces five PASS and no Bug Drafts.
- [ ] Select TC-006: test actually executes and fails on Status Reset (not infrastructure/port/grep error).
- [ ] TC-006 Run History contains one correct M4.1 unexpected failure and one M4.2 Bug Draft with correct expected/actual/run ID; new Actual Result is human readable, free of ANSI color escapes and repetitive Call Log lines.
- [ ] TC-006 Evidence screenshot/video/trace and HTML Report links work; WebM video plays in browser.
- [ ] Edit TC-006 review (title, expected, actual, steps, triage, severity, priority, notes), save successfully, refresh/restart Portal and verify data persists.
- [ ] Export TXT is disabled before first save or when unsaved edits exist; after saving it downloads correct content. Jira Integration remains disabled.
- [ ] Repeat TC-006: a second failed Run and separate Bug Draft are recorded; first Run's review remains unchanged. This is **intentional** until future M8.1.
- [ ] DIAG-001 expected failure still captures evidence but is explicitly excluded from Bug Drafts.
- [ ] Run All produces 5 PASS / 1 expected controlled-demo FAIL; Run History and selected runs remain usable.
- [ ] New and historical Runs can be expanded; old Runs without Bug Drafts are handled gracefully.

## Completion gate

M4.4 is **not accepted** until the owner reports passing integration tests and the final UI checklist. No changes are made to M5/M6/M7/M8 milestone scopes.

## Known design constraints

- Controlled defect TC-006 is expected to fail indefinitely and must be excluded from clean CI quality-gate runs in M5.
- Run-level evidence is not guaranteed to belong to a specific test.
- Distinct runs do not share deduplication state; no Jira defect is created.
- Review persistence uses `reviews.json` separately from immutable generated `run.json` drafts.
