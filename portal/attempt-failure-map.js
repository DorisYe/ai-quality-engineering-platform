// Reporter-derived, per-attempt assertion failure metadata with no raw messages.
// An error object signals a failed attempt, but does not always prove it is an assertion.
function mapAttemptFailures(report, evidenceMap) {
 const mapped=Array.isArray(evidenceMap?.mapped)?evidenceMap.mapped:[];
 const attempts=[];
 let sequence=0;
 function visit(suites) {
  for(const suite of suites||[]){
   for(const spec of suite.specs||[]){
    const match=(spec.title||'').match(/\b(TC-00[1-5]|DIAG-001)\b/);
    if(!match)continue;
    for(const test of spec.tests||[]){
     const testKey=typeof test.id==='string'&&test.id.length>0?'pw:'+test.id:'report-index:'+sequence;
     sequence++;
     (test.results||[]).forEach((result,index)=>{
      const status=['passed','failed','timedOut','skipped','interrupted'].includes(result.status)?result.status:'unknown';
      const evidence=mapped.filter(e=>e.testKey===testKey&&e.attempt===index);
      const hasError=Boolean(result.error)||(Array.isArray(result.errors)&&result.errors.length>0);
      attempts.push({
       testKey,testId:match[1],attempt:index,status,hasError,
       failureType:hasError?'reported-error-unclassified':'none',
       evidence:evidence.map(e=>({kind:e.kind,evidenceName:e.evidenceName,association:e.association})),
       assertionMatched:false,rootCauseConfirmed:false
      });
     });
    }
   }
   visit(suite.suites);
  }
 }
 visit(report?.suites);
 return {source:'playwright-json-reporter',attempts:attempts.slice(0,100),association:'same-test-attempt',assertionCallIdMatched:false};
}
module.exports={mapAttemptFailures};
