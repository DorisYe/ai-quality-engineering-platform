# M4.3 — Offline Mock AI Integration

Use a deterministic mock to verify **browser → Portal API → response → browser** with no OpenAI account, API key, network request, or API billing. This does **not** verify the actual external OpenAI integration.

## Start (Windows PowerShell)

Stop the old Portal, then:

```powershell
git pull origin feature/m4-bug-drafts
node --test tests/*.test.cjs
Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
$env:QA_AI_MOCK = '1'
npm.cmd run portal
```

Open http://127.0.0.1:3200, expand an existing `fixture-review` execution, and click **Analyze with AI (opt-in)**. Expect **OFFLINE MOCK RESPONSE — NOT REAL AI ANALYSIS** followed by a simulated hypothesis/category/next check. Saved human-review fields must not change.

Mock is allowed **only** when `QA_AI_MOCK=1` **and** the run selection equals `fixture-review`; all other runs retain normal API-key gating. The stub never calls a model or the internet. Run All regression and DIAG-001 remain excluded from Bug Draft generation.

To confirm disabled behavior, stop Portal and run:

```powershell
Remove-Item Env:QA_AI_MOCK -ErrorAction SilentlyContinue
npm.cmd run portal
```

Click the fixture analysis button again: expect `AI disabled: configure OPENAI_API_KEY locally`. A real model request remains **PENDING** until the user decides to configure an API key.

## Acceptance checks

1. Node test suite passes (17 tests including the new mock unit test and inline script syntax regression test).
2. Opt-in local mock works from the Portal for `fixture-review`.
3. Output prominently identifies a non-AI mock.
4. Human review classification, priority, notes and approval state remain untouched.
5. No API key or external network call required.
6. With mock flag off, analysis is disabled as before.
