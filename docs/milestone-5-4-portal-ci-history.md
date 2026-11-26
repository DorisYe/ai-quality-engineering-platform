# M5.4 — GitHub Actions Run History in QA Portal

## Objective

Show **local** and **GitHub Actions** execution history from one QA Portal view, without changing the working M3/M4 local execution, Bug Draft, Review, or Export workflows.

This is an **implementation plan**, not a completed feature.

## Design: lean, read-only integration

1. Retain the existing Local Execution History unchanged. Add a source selector: **Local Runs** / **GitHub Actions**, plus a Refresh control for CI runs.
2. Add a Portal backend read-only endpoint, proposed `GET /api/ci/runs`, that queries the GitHub Actions REST API for recent workflow executions and returns normalized fields.
3. For each CI run, show **run number, source, branch, short commit SHA, trigger (push / pull_request / workflow_dispatch), created/started time, workflow status, conclusion, and GitHub Actions run URL**.
4. Display clear labels for `queued`, `in_progress`, `success`, `failure`, `cancelled`; do not equate a green workflow with per-test results unless verified test-level data is available.
5. Provide a **View GitHub Run** link and **View/Download Artifacts** via GitHub (do not proxy ZIP downloads or copy artifacts into local `data/qa-results` in M5.4).
6. Distinguish **controlled defect demo** from regular CI based on trustworthy workflow dispatch inputs / verified metadata, not merely because a run failed. Failed core CI means a real failing quality gate.
7. Show helpful configuration / permission / network / rate-limit / empty-state feedback without breaking Local Runs.

## Access and security

- The repository is private. GitHub REST requests should run **server-side** using a locally configured read-only token (for example `GITHUB_TOKEN`) with minimum Actions-read access to the target repository. Never commit credentials, embed them in frontend JavaScript, expose them through response JSON, or put them in the Run History.
- Store credentials only in a local environment variable or other secure local mechanism; `.env` is ignored by Git, but the app does not automatically load `.env` unless explicitly configured.
- Validate/limit external data, bound request timeouts and result count (e.g. latest 20), and avoid exposing raw GitHub errors with sensitive request headers.
- No workflow-dispatch action, write/delete GitHub operations, Jira integration, or cloud-to-local data sync.

## Proposed API display contract

```json
{
  "status": "available",
  "runs": [
    {
      "source": "github-actions",
      "id": 123,
      "runNumber": 42,
      "branch": "feature/m5-3-quality-gates",
      "commitSha": "abcdef0",
      "event": "push",
      "status": "completed",
      "conclusion": "success",
      "createdAt": "2026-11-26T00:00:00Z",
      "url": "https://github.com/OWNER/REPOSITORY/actions/runs/123",
      "demoMode": "unknown"
    }
  ]
}
```

The JSON is only an illustrative contract, not live repository data. A `demoMode` value must not be inferred from overall `failure` alone. Artifact navigation may simply point to the GitHub run page for MVP; any artifact list requires a separate, authenticated GitHub REST request.

## Acceptance checklist

- [ ] `Local Runs` still shows existing M3/M4 history, evidence, Bug Draft, Review and Export with no regression.
- [ ] `GitHub Actions` shows recent runs with accurate branch, commit, trigger, timestamp and conclusion.
- [ ] Push / PR / manually dispatched events display correct trigger labels.
- [ ] A failed **core** Quality Gate is not mislabelled as an intentionally failing TC-006.
- [ ] The controlled demo run is labelled only where its execution mode can be verified; otherwise show a neutral failure and provide the GitHub run link.
- [ ] **View GitHub Run** leads to the correct run and its available report/artifact downloads.
- [ ] CI history Refresh works; loading/empty/error states render cleanly.
- [ ] Missing token, inadequate permissions, GitHub API downtime and rate limits do not interfere with local runs.
- [ ] The GitHub credential is never exposed in frontend files, API responses or persisted run data.
- [ ] New backend parsing / error-handling tests and regression tests pass.

## Exclusions / future phases

- M5.5: PR branch protection, final integration and complete M5 acceptance.
- M6: release readiness, pass-rate and defect trends, go/no-go.
- M7: QA Portal self-testing E2E automation.
- M8.1: Failure Signatures, deduplication and lightweight Jira integration.

**Status: PLANNED. Do not mark M5.4 accepted until implementation and local verification.**
