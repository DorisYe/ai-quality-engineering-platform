const test=require('node:test');
const assert=require('node:assert/strict');
const {summarizeAttemptEvidence}=require('../portal/verified-attempt-summary');
test('attempt ownership is verified by key plus attempt, never inferred from same TC label',()=>{
 const run={selection:'all'};
 const attempts={attempts:[{testKey:'pw:A',testId:'TC-001',attempt:0,status:'failed',hasError:true,failureType:'reported-error-unclassified'},{testKey:'pw:B',testId:'TC-001',attempt:0,status:'passed',hasError:false,failureType:'none'}]};
 const traces=[{testKey:'pw:A',attempt:0,timeline:[{action:'goto',failed:false},{action:'click',failed:true}]}];
 const result=summarizeAttemptEvidence(run,attempts,traces);
 assert.equal(result.attempts[0].traceCount,1);
 assert.deepEqual(result.attempts[0].safeFailedActions,['click']);
 assert.equal(result.attempts[1].traceCount,0);
 assert.equal(result.attempts[0].assertionActionLink,'unverified-no-shared-call-id');
 assert.equal(result.attempts[0].rootCause,'not-established');
});
test('retry is not assigned original attempt trace',()=>{
 const result=summarizeAttemptEvidence({selection:'all'},{attempts:[{testKey:'pw:A',attempt:1,status:'passed'}]},[{testKey:'pw:A',attempt:0,timeline:[]}]);
 assert.equal(result.attempts[0].traceCount,0);
});
test('diagnostic-only stays clear and no private reporter messages included',()=>{
 const result=summarizeAttemptEvidence({selection:'evidence-check'},{attempts:[{testKey:'pw:X',testId:'DIAG-001',attempt:0,status:'failed',hasError:true,failureType:'reported-error-unclassified',error:'PRIVATE_TOKEN'}]},[]);
 assert.equal(result.status,'diagnostic-only');assert.equal(result.attempts[0].diagnosticOnly,true);
 assert.equal(JSON.stringify(result).includes('PRIVATE_TOKEN'),false);
});
