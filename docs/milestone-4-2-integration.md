# M4.2 — Synthetic Bug Draft Review Integration Acceptance

The first-round M4.2 acceptance was user-reported **5/5 PASS**; see `docs/milestone-4-2-first-acceptance.md`.

## Why the fixture exists

The five real business tests currently pass and the intentional DIAG-001 evidence failure is excluded. To validate the **real Portal browser/API/persistence workflow** without breaking the baseline tests, create an explicit **synthetic historical run**. It uses normal persisted run metadata shape, but it **does not execute Playwright**, and it is **not a real product defect**.

## Setup

From the repo root on the `feature/m4-bug-drafts` branch:

```powershell
git pull origin feature/m4-bug-drafts
node --check scripts/create-bug-review-fixture.js
node scripts/create-bug-review-fixture.js
npm.cmd run portal
```

The fixture creates `data/qa-results/<uuid>/run.json` and a clearly labeled `fixture-review` Execution History entry. It does not touch existing runs. Open http://127.0.0.1:3200 and select the fixture entry. **Do not treat the sample as a product defect or include it in real regression metrics.**

## Integration acceptance

1. Confirm a **SYNTHETIC FIXTURE** notice and generated Bug Draft for `FIXTURE-001`.
2. Change classification to `Test automation issue`, priority to `High`, state to `in_review`, and enter notes. Click **Save Review**; expect saved.
3. Refresh the browser and select the fixture again; the values should persist.
4. Try `approved` with empty notes (after clearing the saved notes), and verify the UI shows the server rejection. Then provide classification and substantive notes and save `approved`.
5. Switch to `rejected`, add a note, save, and confirm the status persists after restarting the Portal.
6. Open a normal successful Run All and a DIAG-001 run; both must still have **zero Bug Drafts**.
7. Check `data/qa-results/<fixture-run-id>/bug-draft-reviews.json` has the saved review fields.

You can use the fixture multiple times; the command creates a **new** UUID folder each time. When no longer needed, delete only the specific synthetic UUID directory named by the fixture script, after stopping the Portal. Never delete all of `data/qa-results`.

The sample covers UI -> PATCH API -> review store -> disk -> reloaded UI. It does **not** verify the Playwright JSON parser on a real unexpected production failure or HTML evidence generation; those are already separately covered by M3 components.

## Execution History inline expansion improvement

Execution History now opens a run's HTML Report, evidence, and Bug Draft Review controls immediately **beneath the clicked history row** rather than at the bottom of the full list. Clicking the same row again collapses/reopens its details, and choosing a different row moves the expanded panel. Verify with multiple history items, including the synthetic fixture, and ensure Save Review still functions.
