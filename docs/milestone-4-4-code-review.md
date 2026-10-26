# M4.4 Overall Code Review — 2026-10-24

## Acceptance and scope
M4.4.6 local user-reported **6/6 PASS** (34 Node tests). This review is a source inspection, not independent execution on Windows or CI. M4.4 currently provides local file inventory, bounded ZIP/trace action extraction, safe timeline, sequence-based failure hints, reporter attachment mapping, and test-attempt metadata. **It does not yet establish assertion-to-trace callId correlation or root cause.**

## Review findings

### P1 — Correlation not tied to mapped attempt
`portal/assertion-trace-correlation.js` still uses **same-run** heuristics, even though M4.4.5–6 now produce attachment-level mapping. `portal/server.js` extracts the first two ZIP files regardless of test/attempt. UI should label the older assertion assessment as *run-level, unverified* until per-attempt trace selection is connected. Do not market it as exact assertion correlation.

### P1 — Test identity collision for retries and repeated specs
`test-evidence-map.js` derives IDs from the title (TC-001 etc.) and `attempt` from a result's array index. If two tests/specs share the same TC label, `attempt-failure-map.js` could assign attachments from one to the other. Persist a unique Playwright reporter `test.id` / spec identity plus `retry` and use it for joins; keep the human-friendly TC label for display only.

### P1 — Trace ZIP parser is a limited, custom implementation
Current scanner enforces size/count limits, but skips unsupported archives and uses central-directory metadata directly. Hardening is needed for malformed ZIPs, oversized entry names, nested structures, ZIP64, memory limits, and anomalous data; use well-tested ZIP parsing or more extensive fuzz/negative testing before untrusted production input. The Portal remains local-only.

### P2 — Timeline ordering and timestamp interpretation
`timeline` records are in completed-event order and lack normalized timestamps; several `.trace` entries are aggregated. `correlateFailures` currently picks the three previous **completed records**, which may not be causally or temporally adjacent to the failure. Include per-entry scope, monotonic timestamps, and stable ordering before improving correlation confidence.

### P2 — Error classification deliberately conservative
`attempt-failure-map.js` uses `hasError` rather than an assertion-specific classifier; `assertionMatched:false` and `rootCauseConfirmed:false` are correct. Add reliable reporter error-category parsing without ever exposing full error text.

### P2 — UI scalability and observability
Evidence Preview is one long JSON/text output. Replace with sections for Test/Attempt, Evidence, Timeline, Correlations and Diagnostics; preserve clear `unverified` labels and copy/export controls only for sanitized fields. Re-enable full inline-script syntax tests after each change.

## Immediate fixes made in this review
- The trace parser's `ZIP directory not found` and `ZIP exceeds size limit` paths now return the same array/counter keys as successful parses. This prevents malformed archives from causing missing `timeline`/correlation fields.

## Recommended next milestone
**M4.4.7 — Evidence Mapping Hardening**: unique test identity and per-attempt trace selection, safe ZIP negative tests, and improved UI grouping. Then **M4.4.8 — Verified Assertion-to-Trace Correlation**, only when reporter/assertion event IDs or other explicit verifiable linking data exist. Keep all analysis offline; real OpenAI integration remains pending and must be independently opted into.

## Merge recommendation
Keep PR #4 **Draft** pending P1 mapping/correlation fixes and repeat local acceptance; previous passing milestones remain recorded.
