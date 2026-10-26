# M4.4.8 — Verified Assertion-to-Trace Correlation: Implementation Plan

Date: 2026-10-24. Status: **PLANNED, NOT IMPLEMENTED / NOT ACCEPTED**. M4.4.7 Trace Parser Hardening has owner-reported 6/6 PASS (44 tests), recorded separately.

## Goal
Link a Playwright test-attempt failure to the **correct trace and the precise failing assertion/action, only where reporter and trace share verifiable identifiers**. Do not infer root cause from temporal proximity, action sequence, or having files in the same run.

## Existing foundation
- M4.4.5–7: reporter attachment path → unique testKey → attempt index → trace ZIP.
- M4.4.2–3: allowlisted action names, begin/end pairing via trace callId, duration and failure flag.
- M4.4.6: reporter error presence and attempt status; assertion type remains *unclassified*.
- Existing `assertionTrace` is only run-level and explicitly unverified.

## Proposed increments
**8.1 — Schema discovery & fixtures**
- Check Playwright JSON reporter and real trace event shapes for recorded `error`, `errors`, assertion steps, `callId`, parentId and timing.
- Use synthetic de-identified fixtures first; avoid dumping raw error messages, URL, selectors or source excerpts.
- Create explicit capability matrix for reporter versions; if unique IDs are unavailable, return a documented unsupported status.

**8.2 — Exact attempt-scoped correlation**
- Start from a reporter-mapped ZIP attached to a **unique reporter testKey and attempt**.
- Within its `.trace` entry, correlate before/after using matching callId, preserving entry boundaries and action timestamp.
- Match an assertion to an actual trace event only where there is a defensible shared identifier or structured, validated link. If the reporter has only error text / stack and no compatible ID, return `unverified-assertion-link` (never guess).
- Distinguish reporter `failed`, `timedOut`, `interrupted` from assertion-specific evidence.

**8.3 — Portal presentation**
- Show separate panels: Test Attempt, Reporter Error (safe category only), Matched Trace Action (when verified), Unmatched Evidence, and Trace Diagnostics.
- Use three distinct labels: `verified-attempt-ownership`, `verified-action-link`, `root-cause-not-established`.
- Do not display secrets, raw exception text or source, selectors, URLs or file system paths.

**8.4 — Regression and integration acceptance**
- Positive: known matching reporter testKey/attempt + trace callId (if real schema supports this).
- Negative: duplicate test labels, retries, wrong attempt, multiple trace entries, missing callId, mismatched IDs, non-assertion timeout, intentionally failing DIAG-001.
- Enforce no speculative matches. Corrupt archives and oversized evidence must fail gracefully.
- Manual Windows check with DIAG-001 and at least one non-diagnostic controlled test failure (without treating it as a product bug); normal Run All remains green.

## Definition of done
1. Evidence association remains exact to reporter testKey and attempt.
2. Assertion/action link marked verified **only with explicit supported structured linkage**; otherwise clearly unmatched.
3. Parser is bounded and safe; no network AI or evidence uploads.
4. CI/Node tests and Windows Portal regressions pass; owner explicitly accepts results.
5. Existing Bug Review / Mock AI behavior unchanged.
6. Detailed evidence-based review and documented limitations recorded in PR #4.

## Risk / dependency
Playwright JSON reports and Trace archives may not expose a shared assertion identifier. In that case the honest deliverable is a **verified test-attempt→trace link plus an unverified assertion association**, not a made-up exact callId match. If this limitation is confirmed, schedule optional instrumentation using an explicit test step/correlation ID for a later milestone.

## Suggested first engineering step
Inspect Playwright's reporter and Trace event format in the repository's pinned version, then add sanitized schema fixtures and tests. Do not alter product tests or enable API-based AI for schema discovery.
