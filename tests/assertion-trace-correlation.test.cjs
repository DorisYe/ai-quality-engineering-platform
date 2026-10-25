const test=require('node:test');
const assert=require('node:assert/strict');
const {associateAssertion}=require('../portal/assertion-trace-correlation');
const trace={timeline:[{action:'goto',durationMs:15,failed:false}]};
test('diagnostic failure cannot be treated as product assertion correlation',()=>{
 const result=associateAssertion({selection:'evidence-check',summary:{tests:[{id:'DIAG-001',status:'unexpected'}]}},[trace]);
 assert.equal(result.status,'diagnostic-only');assert.deepEqual(result.matches,[]);
});
test('unique failed test and one trace yield only same-run context',()=>{
 const result=associateAssertion({selection:'TC-001',summary:{tests:[{id:'TC-001',status:'unexpected',error:'secret bearer token'}]}},[trace]);
 assert.equal(result.status,'candidate-context-only');
 assert.equal(result.matches[0].assertionMatched,false);
 assert.equal(result.matches[0].rootCauseConfirmed,false);
 assert.ok(!JSON.stringify(result).includes('secret'));
});
test('multiple failures refuse arbitrary test-to-trace association',()=>{
 const result=associateAssertion({summary:{tests:[{id:'TC-001',status:'unexpected'},{id:'TC-002',status:'unexpected'}]}},[trace]);
 assert.equal(result.status,'ambiguous-test-ownership');assert.deepEqual(result.matches,[]);
});
test('missing or multiple traces produce no invented linkage',()=>{
 const run={summary:{tests:[{id:'TC-001',status:'unexpected'}]}};
 assert.equal(associateAssertion(run,[]).status,'ambiguous-trace-ownership');
 assert.equal(associateAssertion(run,[trace,trace]).status,'ambiguous-trace-ownership');
});
