// Conservative association of a Playwright assertion result with same-run trace evidence.
// Run-level membership is NOT proof that an action produced an assertion failure.
function associateAssertion(run, tracePreviews) {
  const unexpected=(run?.summary?.tests||[]).filter(t=>t.status==='unexpected');
  const traces=Array.isArray(tracePreviews)?tracePreviews:[];
  if(run?.selection==='evidence-check') {
    return {status:'diagnostic-only',matches:[],reason:'DIAG-001 is an intentional evidence capture diagnostic, not a product defect.'};
  }
  if(unexpected.length===0) return {status:'no-assertion-failure',matches:[],reason:'No unexpected tests in this run.'};
  if(unexpected.length!==1) return {status:'ambiguous-test-ownership',matches:[],reason:'Multiple failed tests; evidence is not linked to a unique test.'};
  if(traces.length!==1) return {status:'ambiguous-trace-ownership',matches:[],reason:'Exactly one available trace is required until explicit test-to-artifact mapping exists.'};
  const t=unexpected[0],trace=traces[0];
  if(!Array.isArray(trace.timeline)||trace.timeline.length===0) return {status:'insufficient-trace-data',matches:[],reason:'No matched trace timeline available.'};
  // We know only run-level context, not assertion callId or temporal alignment.
  // Report context without implying verified correspondence.
  return {
    status:'candidate-context-only',
    matches:[{
      testId:String(t.id||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,50),
      testStatus:'unexpected',
      observedActionTypes:trace.timeline.slice(-5).map(x=>x.action),
      association:'same-run-only',
      assertionMatched:false,
      rootCauseConfirmed:false
    }],
    reason:'Trace and unexpected assertion belong to one run, but assertion callId/timestamp is not linked.'
  };
}
module.exports={associateAssertion};
