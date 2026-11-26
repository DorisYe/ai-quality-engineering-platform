# M5.2 — CI Test Reports & Artifacts

## Objective

Retain Playwright's generated HTML report for each GitHub Actions core regression execution, and make failure evidence downloadable when a run fails. The test strategy from accepted M5.1 remains unchanged: required tests are Node unit/integration tests and TC-001–TC-005. TC-006 remains an intentional local controlled defect, excluded from normal CI; DIAG-001 remains a separately triggered diagnostic.

## Implementation

Workflow: `.github/workflows/core-qa-ci.yml`

- `actions/upload-artifact@v4` uploads `playwright-report/` as **playwright-html-report**, with seven-day retention and `if: always()`. It can upload a report when the tests fail. When Playwright never starts (e.g. dependency install fails) no report is created, so the step emits a warning rather than pretending a report exists.
- When a job fails, another upload step archives `test-results/` as **playwright-failure-evidence**, also retained for seven days. The configured Playwright policy remains `screenshot: only-on-failure`, `video: retain-on-failure`, `trace: retain-on-failure`.
- The Actions workflow name is now **Core QA CI** to avoid permanently naming the workflow after M5.1, and push triggering includes the new `feature/m5-2-ci-artifacts` branch, while the accepted M5.1 branch and `main` remain listed.
- No separate deployment or Jira integration, no portal workflow change, no additional scheduled triggers.

GitHub Actions artifacts are download bundles, **not automatically hosted web pages**. Download and extract the HTML report artifact and open `index.html` locally. For some browser policies, `npx playwright show-report <extracted-directory>` can serve the extracted report locally.

## Validation

### Happy path — expected success

1. Open GitHub repository > **Actions** > **Core QA CI** and select the latest run for `feature/m5-2-ci-artifacts`.
2. Confirm the Node tests and Playwright core regression have succeeded (TC-001–TC-005, 5/5).
3. Scroll to the **Artifacts** section on the run summary and download **playwright-html-report**.
4. Unzip, open `index.html` and check that all five TC cases are reported as passed.
5. The **playwright-failure-evidence** artifact should **not** normally appear on a green run; failure-only evidence is not expected.

### Failure path — manual controlled-defect validation

The owner confirmed all five normal CI acceptance checks passed on 2026-11-26. The next step is a **deliberately failing, manual-only** run.

Workflow dispatch now supports a `test_mode` choice:

- `core` (default): run standard TC-001–TC-005 regression.
- `controlled-defect` (manual selection only): run **TC-006 alone**, whose Reset Filters failure is intentionally preserved. Pushes and pull requests always use the clean core suite.

Steps:

1. Navigate to GitHub Actions, select the workflow (its displayed name may still be the previous **M5.1 Core QA CI**), click **Run workflow**.
2. Select branch `feature/m5-2-ci-artifacts` and choose **controlled-defect** for the `test_mode` input; trigger it.
3. Confirm the Node tests still pass and Playwright **runs TC-006 alone**. The Playwright step and overall workflow should appear **red/failed by design**, because the failure is genuine rather than suppressed.
4. On the failed Run Summary, download **playwright-html-report** and **playwright-failure-evidence** from **Artifacts**. Confirm the HTML report shows TC-006 failed specifically on Status Filter Reset (not a setup or connection error).
5. Extract the failure evidence archive and confirm that Screenshot (`.png`), Video (`.webm`) and Trace (`.zip`) exist and can be opened. A trace can be viewed with Playwright Trace Viewer; a video can be opened in a compatible browser/media player.
6. Run a normal `core` mode again (or inspect an unaffected push/PR run) to verify CI stays green with TC-001–TC-005.

**Acceptance semantics:** A red manual controlled-defect run is the *expected* result for this special test and does not mean the normal core CI is broken. Do not mark the overall CI policy as successful from a failed run; check that the artifacts and failure reason are correct. If TC-006 unexpectedly passes, or evidence files are missing, investigate rather than treating a red run alone as proof.

Do not infer failure artifact success solely from green runs: failure-only upload is not executed there.

### Optional local smoke checks

```powershell
git fetch origin
git switch --track origin/feature/m5-2-ci-artifacts
npm.cmd run test:unit
npm.cmd run test:core
```

If the branch already exists locally, `git switch feature/m5-2-ci-artifacts` and `git pull origin feature/m5-2-ci-artifacts` instead.

## Acceptance status

**Normal path: ACCEPTED (owner-confirmed, 2026-11-26):** all five checks passed, including a downloadable HTML report showing five passing core tests. **Failure path: PENDING** until the manual controlled-defect run proves Screenshot, Video, Trace and failed HTML report are downloadable. Do not record M5.2 as accepted based on YAML review alone.

M5.3: automated quality gates and static checks. M5.4: final PR validation and branch protection where supported.
