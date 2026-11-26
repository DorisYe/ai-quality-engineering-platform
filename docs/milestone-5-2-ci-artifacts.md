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

### Failure path — verification required before final M5.2 acceptance

1. In a temporary test-only branch or approved isolated fixture, cause a **core** Playwright test to fail without changing the permanent TC-006 demo. A real unexpected failure may also be used.
2. Confirm the workflow is red and the artifact upload steps still run.
3. Confirm the HTML report downloads and describes the failure.
4. Confirm `playwright-failure-evidence` can be downloaded and contains Playwright failure artifacts (when generated), including Screenshot, Video and Trace.
5. Restore/discard the temporary change so clean CI remains passing.

Do not infer failure artifact success solely from green runs: the failure-only upload is not executed there. Also note that Node unit test failures can prevent Playwright from running, so there may be no Playwright evidence in that case.

### Optional local smoke checks

```powershell
git fetch origin
git switch --track origin/feature/m5-2-ci-artifacts
npm.cmd run test:unit
npm.cmd run test:core
```

If the branch already exists locally, `git switch feature/m5-2-ci-artifacts` and `git pull origin feature/m5-2-ci-artifacts` instead.

## Acceptance status

**Pending:** workflow committed; artifact presence, report readability and fail-path evidence must be confirmed from actual GitHub Actions executions. Do not record M5.2 as accepted based on YAML review alone.

M5.3: automated quality gates and static checks. M5.4: final PR validation and branch protection where supported.
