# AI Quality Engineering Platform

A local-first quality engineering portfolio project for an event-driven web application, built with **Playwright**, **Node.js**, and an **Express QA Management Portal**. Designed to demonstrate test execution, release-quality review, failure triage, and evidence-based QA workflows.

## What it does

- **Event Monitoring AUT**: an example application under test, started automatically by Playwright during test runs.
- **Test Library and Execution**: browse test specifications, run an individual test or Run All, see run history and the Playwright HTML report.
- **Bug Draft Review**: create review-only bug drafts from unexpected test failures, classify, prioritize and record human review. **No Jira issues or external defects are automatically filed.**
- **Failure Triage**: deterministic low-confidence, rule-based classification suggestions. Test failures are not automatically classified as product bugs.
- **Offline Mock AI**: optional, clearly labeled synthetic fixture workflow for learning and demonstrations. **It is not real AI inference.**
- **Evidence Analysis Dashboard (M4)**: review screenshots/videos/trace counts, reporter-backed test and retry ownership, allowlisted action metadata, safe timeline summaries and conservative failure assessments. Raw Trace files are not uploaded to an AI service.

## Setup — Windows PowerShell

Requires Node.js and npm. From the repository root:

```powershell
npm.cmd install
npx.cmd playwright install chromium
```

If PowerShell execution policy blocks `npm` or `npx`, use the `.cmd` commands above.

Start the **QA Portal**:

```powershell
npm.cmd run portal
```

Open **http://127.0.0.1:3200**. Use *Run Selected* or *Run All* to run tests from the Portal. Playwright automatically launches the AUT at **http://127.0.0.1:3100** during a test run; **do not separately start the AUT on port 3100** when running tests. Run only one execution at once.

Run Node unit/regression tests separately (stop the Portal first if restarting after a code change):

```powershell
node --test tests/*.test.cjs
```

For direct Playwright execution:

```powershell
npx.cmd playwright test
```

## Failure evidence and human review

Click an entry in **Execution History**, then **Preview Local Evidence**. The dashboard shows:

1. Counts for screenshot, video and Trace ZIP artifacts.
2. The Playwright-reporter-backed **testKey and attempt index** associated with an artifact.
3. Allowlisted action names and safe duration/error flags from bounded local trace inspection.
4. Whether evidence belongs to the attempt, **without inventing an assertion/action match or root cause**.
5. Expandable technical diagnostics with sanitized metadata.

For a controlled expected-failure evidence demonstration, use **Evidence Diagnostic (Expected Failure)**. Its **DIAG-001** case is intentionally failing to test evidence capture and **is not a product defect**. It is excluded from regular Run All and bug draft creation.

To create a synthetic failed-run fixture for the Bug Draft Review workflow:

```powershell
node scripts/create-bug-review-fixture.js
```

Then refresh the Portal and open the `fixture-review` item in Execution History. This fixture is **not a real Playwright failure**.

## Optional AI behavior

- The default, free workflow uses deterministic **rule-based** suggestions, with human review.
- For **offline mock AI** on the synthetic fixture only, start the Portal with:

```powershell
$env:QA_AI_MOCK = '1'
npm.cmd run portal
```

Mock output is labeled as a mock, involves no OpenAI API call, and should not be cited as model-generated defect analysis.

- An optional server-side OpenAI adapter exists but requires a separate `OPENAI_API_KEY` environment variable, network access, possible API charges, and explicit opt-in. **Real provider integration has not been end-to-end accepted as part of M4**. No API key is needed for normal testing, review or evidence inspection. Never commit API keys.

## Current limitations

- Exact **assertion-to-trace callId** correlation has not been implemented. Reporter-backed evidence ownership is verified per test attempt, but `assertionActionLink` remains **unverified** and `rootCause` remains **not-established**.
- Trace parsing is deliberately bounded and only supports a subset of ZIP/trace structures; it is **not a production-grade parser for arbitrary untrusted archives**.
- Action/timeline summaries are contextual signals, not proof of causal root cause.
- All data is held locally beneath `data/qa-results/`. Evidence, run output, and review notes may contain sensitive information; handle them accordingly and avoid publishing them.
- This project is a local development/portfolio prototype rather than a production multi-user service.

## Repository guide

| Location | Role |
| --- | --- |
| `backend/` | Event Monitoring application under test |
| `tests/*.spec.ts` | Playwright UI/end-to-end and diagnostic tests |
| `tests/*.test.cjs` | Node unit and regression tests |
| `portal/server.js` | Local QA Portal API |
| `portal/public/index.html` | Portal UI and Evidence Dashboard |
| `portal/bug-review-store.js` | Local human Bug Draft Review state |
| `portal/evidence-intelligence.js` | Bounded local Trace metadata extraction |
| `portal/test-evidence-map.js` | Reporter attachment-to-test identity mapping |
| `portal/attempt-failure-map.js` | Reporter attempt metadata |
| `portal/trace-selection.js` | Reporter-owned per-attempt Trace selection |
| `portal/verified-attempt-summary.js` | Conservative attempt evidence analysis |
| `docs/` | Milestone scope, manual acceptance and reviews |

## Milestone 4 status

M4.1–M4.4.7 have owner-reported acceptance records; the **M4 Evidence Dashboard was reported 6/6 PASS with 50 Node tests**. PR #4 remains in draft until final integration review and merge decision. Manual acceptance does not substitute for an independent CI run.
