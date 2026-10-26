# M4 Final Integration Review & PR #4 Merge Preparation

Date: 2026-10-26. **Review status: CONDITIONAL — final independent regression not run.** PR #4 stays **Draft** and is **not merged**.

## Accepted evidence
Owner reports M4 Evidence Analysis Dashboard **6/6 PASS**, including **50/50 local Node tests**, DIAG evidence count cards, attempt/evidence timeline, explicit unverified assertion and unconfirmed root cause, expandable diagnostics, and Run All / Bug Review / Mock AI regression. This report is based on user-performed Windows tests, not on independently reproduced execution here.

Previous M4.1–M4.4.7 checkpoints and reviews are retained in `docs/`.

## Source integration review
- Compared `main...feature/m4-bug-drafts`: **ahead by 115 commits, behind by 0** at review snapshot. No branch divergence, but numerous iterative commits and numerous acceptance documents; squash merge is preferable if authorized later.
- Relevant changes are inside the Portal, support scripts, Node regression tests, documentation, and README.
- Updated root `README.md` with Windows setup, Portal workflow, diagnostic run, rule-based review, offline Mock AI, limitation disclosure, and repository guide.
- Preview API uses reporter attachment path, unique per-report test key and attempt, and scoped Trace selection. DIAG remains explicitly diagnostic-only in summary and excluded from bug drafts.
- The M4.4.8 summary intentionally **does not** prove exact assertion-to-trace callId correspondence; `rootCause` is `not-established`.
- No new API key is required for local acceptance. An optional OpenAI adapter exists but is **not** included in an end-to-end accepted real provider integration.

## Remaining known risks (documented and accepted only for local prototype)
1. Lightweight custom ZIP parser is bounded but is not production-grade for arbitrary untrusted ZIP archives.
2. Timeline summaries show allowlisted action metadata; no verified assertion-callId match or causal root cause.
3. UI retains technical JSON diagnostics behind a disclosure for developer convenience.
4. Sensitive local run artifacts may contain personal/project data and must not be pushed to GitHub.
5. No GitHub Actions PR-triggered runs were returned for README commit `761ff57`; absence of a returned run is **not proof the code failed**.
6. The 50-test acceptance preceded the last README-only commit; executable source has not changed in this final review.

## Merge gate — owner action
- [x] Owner-reported Dashboard regression PASS (50 tests).
- [x] Readme project instructions updated.
- [x] Known limits explicitly disclosed.
- [x] `main` branch comparison shows no behind commits at snapshot.
- [ ] Final independent CI or a fresh final local command: `node --test tests/*.test.cjs`.
- [ ] Verify working tree contains no secrets or generated `data/qa-results` files staged for commit.
- [ ] Check PR diff/files and any GitHub branch protection requirements before merging.
- [ ] Explicit owner authorization for PR #4 merge.

## Suggested commands (Windows)
```powershell
git pull origin feature/m4-bug-drafts
node --test tests/*.test.cjs
npm.cmd run portal
```
Inspect DIAG-001 preview, Run All, Bug Review and Mock AI locally. Once accepted, consider **squash merge** of PR #4 to `main` instead of merging all 115 incremental commits; do not merge without explicit request.

## Final recommendation
For **portfolio/local demonstration**, this M4 implementation is functionally complete **subject to the final merge gate**. Do not expand assertion instrumentation or paid AI integration now. Merge only after the user has confirmed the last regression and explicitly authorizes merging.
