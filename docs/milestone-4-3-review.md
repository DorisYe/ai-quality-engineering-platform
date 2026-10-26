# M4.3 Review & Next-Phase Decision — 2026-10-24

## Acceptance status
- M4.3 Foundation: user-reported 6/6 PASS.
- M4.3 Portal UI regression retest: user-reported 5/5 PASS after fixing inline-script syntax.
- M4.3 Offline Mock AI Integration: user-reported 6/6 PASS (17 Node tests, mock button/API/display, reviewer fields unchanged, no API key, disabled fallback).
- Real OpenAI Responses API integration: **NOT TESTED**. Do not describe mock acceptance as real AI acceptance.

## Review
1. Mock behavior is behind `QA_AI_MOCK=1` and restricted to runs marked `fixture-review`. The response is labeled `source: mock`, `model: fixture-stub` and clearly described in the UI as not real AI inference.
2. The external LLM route is opt-in per draft, uses a server-side key and structured output, with no automatic classification/approval/issue creation.
3. The failure payload is allowlisted to four textual fields. **Field restriction is not redaction:** the raw error text may still contain secrets/private data. Do not send real corporate logs to a hosted provider before a preview and redaction mechanism is added.
4. A model timeout, quota or malformed response is reported as a failure, not silently converted to a fabricated answer.
5. Evidence files (screenshot/video/trace) are not sent to OpenAI in this increment.

## Next recommended steps

**M4.4 — Evidence Intelligence without external AI** (priority):
- Parse **selected safe Playwright Trace metadata** locally (actions, timestamps, selected non-sensitive errors), with no uploading of ZIP files.
- Expose an evidence inventory and a reviewable analysis context preview before any future model request.
- Continue offline mock integration to validate the frontend/backend schema.
- Add explicit sensitive-field stripping, size limits, and tests for credential/token-like strings.

**M4.5 — Screenshot and trace-assisted optional AI** (later):
- User previews and explicitly selects the exact fields/images for transfer.
- Only after redaction and consent, integrate provider-specific multimodal input under separately gated credentials.
- Keep human review mandatory.

**Milestone 5 — CI/CD**: add Node unit tests, Portal JavaScript parsing tests, Playwright regression and isolated integration checks to GitHub Actions.

## Merge recommendation
PR #4 remains **draft** until the full M4 scope is defined and final cross-component review is complete. Production deployment is out of scope: no authentication, CSRF hardening, retention/deletion or multi-user access yet.
