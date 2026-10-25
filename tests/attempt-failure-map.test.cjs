const test=require('node:test');
const assert=require('node:assert/strict');
const {mapAttemptFailures}=require('../portal/attempt-failure-map');

const reporter={suites:[{specs:[{title:'TC-001: acknowledgement',tests:[{results:[
 {status:'failed',error:{message:'SECRET token'},attachments:[{path:'/tmp/test.zip'}]},
 {status:'passed',attachments:[]}
]}]}]}]};
const evidence={mapped:[{testId:'TC-001',attempt:0,kind:'trace',evidenceName:'attempt0/trace.zip',association:'playwright-json-attachment'}]};

test('failed first attempt maps only its own trace and retry stays separate',()=>{
 const data=mapAttemptFailures(reporter,evidence);
 assert.equal(data.attempts.length,2);
 assert.equal(data.attempts[0].hasError,true);
 assert.equal(data.attempts[0].evidence.length,1);
 assert.equal(data.attempts[1].evidence.length,0);
 assert.equal(data.attempts[1].status,'passed');
 assert.equal(data.attempts[0].assertionMatched,false);
 assert.ok(!JSON.stringify(data).includes('SECRET'));
});
test('does not claim root cause or assert error means assertion',()=>{
 const data=mapAttemptFailures(reporter,evidence);
 assert.equal(data.attempts[0].failureType,'reported-error-unclassified');
 assert.equal(data.attempts[0].rootCauseConfirmed,false);
 assert.equal(data.assertionCallIdMatched,false);
});
test('no reporter results means no inferred attempt or evidence',()=>{
 const data=mapAttemptFailures({suites:[]},evidence);
 assert.deepEqual(data.attempts,[]);
});
