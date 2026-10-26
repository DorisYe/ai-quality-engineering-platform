# M4.4 — Local Evidence Intelligence (first increment)

The first version is entirely offline. The Portal adds **Preview Local Evidence** below a selected execution history row. The API `GET /api/runs/:id/evidence-preview` returns:
- Count of available PNG screenshots, WebM videos and ZIP traces
- Limited test ID/status/duration metadata (no raw error descriptions)
- A bounded allowlisted set of trace action names when readable; unsupported ZIP representations are intentionally skipped

The preview does **not** call OpenAI, upload artifacts, read screenshot pixels, inspect video, or claim root-cause conclusions.

## Acceptance (Windows)
1. Stop Portal and update `feature/m4-bug-drafts`, then start `npm.cmd run portal`.
2. Run `node --check portal/server.js` and `node --check portal/evidence-intelligence.js`.
3. Run `node --test tests/*.test.cjs` (19 expected including two new M4.4 unit tests).
4. Open a previous DIAG-001 failed execution with evidence. Click **Preview Local Evidence** beneath that history row.
5. Confirm at least the available screenshot/video/trace counts, test metadata, and **LOCAL ONLY — no AI/network upload** label. Trace action list may be empty when an archive uses unsupported ZIP descriptors.
6. Open a clean Run All; preview should show no failure evidence unless recorded otherwise.
7. Confirm that Bug Draft Review, Report and Execution History still work.

## Review notes and limitations
- Trace ZIP extraction is deliberately conservative (bounded archive size; local ZIP entries without data descriptors only). It does **not** yet extract Playwright traces encoded using every ZIP variant. A more robust parser and controlled safety fixtures are needed before claiming full trace-analysis coverage.
- Only an allowlist of action API names is returned; no selectors, action parameters, URLs, request/response bodies or stack frames are returned. Real traces can still contain sensitive data on disk, so keep the Portal local.
- This remains local metadata analysis, **not** AI, and has not been independently Windows-validated.
