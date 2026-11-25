# M3.6 — Light Hybrid Enterprise Portal UI

## Scope

Visual refresh of the existing local QA Portal, without changing test execution behavior or M4.1 failure detection.

1. Light Enterprise shell: white sidebar, soft-blue active navigation, off-white workspace, white summary cards, unified buttons and badges.
2. Execution History inline accordion: clicking a run shows its details **directly beneath that run**, instead of a shared details area after the entire list.
3. The expanded run includes the existing Test Summary, a basic per-test Result/Duration table, HTML Report link and existing evidence links.
4. At most one run stays expanded; click the same run to collapse. Polling preserves expansion when history changes.
5. Existing Playwright execution and reporters remain unchanged.

## Files changed

- `portal/public/index.html` only. No new framework or dependencies.
- Backend files, test scripts, `playwright.config.ts` and M4.1 `failureDetection` remain unchanged.

## Windows validation

From repository root:

```powershell
git status
git fetch origin
git switch --track origin/feature/m3-6-portal-ui
npm.cmd run portal
```

If this branch already exists locally, use `git switch feature/m3-6-portal-ui` and `git pull`. Do not switch branches while having uncommitted changes.

Open http://127.0.0.1:3200; refresh the page with Ctrl+F5 if the old UI is cached.

### Acceptance checklist

1. Sidebar and overview: light design loads correctly on desktop and narrow browser width; navigation scrolls to the corresponding section.
2. Test Library: all five cases show and search/filter/selection works; selecting a case updates its Test Specification.
3. Test execution: Run Selected TC-003 passes, Run All passes 5/5; results, console output and live status still update.
4. History: click a historical Run All; its details appear immediately below it, including individual test results, and not below the full history list.
5. Accordion: click another run and confirm the first closes; click the currently open run to collapse it.
6. Report: expanded run's Playwright HTML Report opens correctly.
7. Evidence: DIAG-001 still shows its diagnostic report and screenshot/video/trace links under the expanded run. This intentional failure is not a product defect.
8. Regression safety: `http://127.0.0.1:3200/api/runs/current` still includes `failureDetection` as implemented in M4.1.

### Known scope boundaries

- Existing past runs are not migrated or rewritten.
- Failed-test evidence is still captured by Playwright; passing tests do not retain screenshot/video/trace by default.
- This UI does not create Bug Drafts. M4.2 remains separate.
- This is a local educational prototype, not a publicly accessible or production-ready multi-user service.

## Verification status

Source changes have been inspected after commit. Browser and Playwright runtime acceptance must be performed by the project owner on Windows before M3.6 is marked Accepted.
