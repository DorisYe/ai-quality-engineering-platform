# M4.3 — Opt-in AI-assisted Failure Analysis

## Acceptance record
M4.3 Foundation manual acceptance **6/6 PASS** was reported by the project owner on 2026-10-24 (see `docs/milestone-4-3-foundation-acceptance.md`).

## Implemented in this increment

A real OpenAI Responses API request is now available for individual non-diagnostic Bug Drafts using a user-initiated **Analyze with AI (opt-in)** button.

- AI **disabled by default**; requires `OPENAI_API_KEY` on the local Portal server.
- HTTP POST `/api/runs/:id/bug-drafts/:draftId/ai-analysis` only accepts existing reviewable drafts. Passing/DIAG-001 runs cannot invoke it.
- API sends **only** test ID, title, actual failure text, and expected result, with size limits; no evidence files/screenshots/trace, saved review notes, secrets from environment, or full run output.
- OpenAI Responses API is called server side, `store: false`, with structured JSON output, timeout and error handling.
- Output contains a suggested category, unverified root-cause hypothesis, and next diagnostic check.
- AI output does **not** overwrite human review fields or approve a defect. Analysis currently is ephemeral; it is not stored.
- Requires network access and API billing separate from ChatGPT subscription; no secret should be committed to GitHub.

## Windows local setup

In a PowerShell terminal for the Portal, after stopping the existing server:

```powershell
git pull origin feature/m4-bug-drafts
node --check portal/server.js
node --check portal/ai-failure-analysis.js
node --test tests/bug-drafts.test.cjs tests/bug-review-store.test.cjs tests/failure-triage.test.cjs tests/ai-failure-analysis.test.cjs
$env:OPENAI_API_KEY = Read-Host 'OpenAI API key'
$env:QA_AI_MODEL = 'gpt-4.1-mini'
npm.cmd run portal
```

Note: `Read-Host` displays the key while typing. To avoid display, use a secure environment-variable injection workflow rather than typing it into command history. Never paste the key into ChatGPT or GitHub. The key is read only by the backend, not embedded in browser JavaScript. Clear the environment variable when done.

## Integration acceptance (requires opt-in API key)

1. Open http://127.0.0.1:3200 and select a synthetic `fixture-review` run.
2. Review its generated Bug Draft. Click **Analyze with AI (opt-in)** only when comfortable sharing the limited synthetic text with OpenAI.
3. Verify AI hypothesis/category/check are displayed and labeled unverified.
4. Verify saved Classification, Priority, State, and Review Notes have **not changed**.
5. Verify DIAG-001 and successful Run All show no AI action because there is no draft.
6. Restart the Portal **without** `OPENAI_API_KEY`. Attempting AI analysis should result in a clear disabled message.
7. Unit tests should succeed **without** any network call or API key.

**Important:** API analysis of real failure logs requires review for credentials, personal information, proprietary system details and confidential data before sending them externally. The current input filter limits fields/length, but does **not** automatically redact arbitrary secrets embedded in error text. For now, use only the synthetic fixture during AI validation.

## Limits and future extensions

No multimodal screenshot / trace upload, no stored AI analysis history, no automated root cause proof, and no GitHub Issue creation. Future work can add a redaction preview, user confirmation of the exact outgoing payload, and evaluation against labeled failures.
