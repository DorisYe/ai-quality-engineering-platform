// Evidence-backed attempt summary; deliberately does NOT invent assertion callId links.
function summarizeAttemptEvidence(run, attemptData, scopedTraces) {
 const diagnostic=run?.selection==='evidence-check';
 const traces=Array.isArray(scopedTraces)?scopedTraces:[];
 const entries=(attemptData?.attempts||[]).slice(0,100).map(a=>{
  const owned=traces.filter(t=>t.testKey===a.testKey&&t.attempt===a.attempt);
  const failedActions=owned.flatMap(t=>t.timeline||[]).filter(x=>x.failed===true).map(x=>x.action).slice(0,5);
  return {
   testId:a.testId,attempt:a.attempt,status:a.status,
   evidenceOwnership:owned.length?'verified-reporter-attachment':'no-mapped-trace',
   traceCount:owned.length,
   safeFailedActions:failedActions,
   failureObserved:Boolean(a.hasError)||a.status==='failed'||a.status==='timedOut',
   failureKind:a.failureType,
   assertionActionLink:'unverified-no-shared-call-id',
   rootCause:'not-established',
   diagnosticOnly:diagnostic
  };
 });
 return {status:diagnostic?'diagnostic-only':'attempt-scoped-evidence',
  associationRule:'reporter-test-key-and-attempt',
  note:'An attached trace confirms attempt ownership, not an assertion/action causal match.',
  attempts:entries};
}
module.exports={summarizeAttemptEvidence};
