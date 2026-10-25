const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {mapEvidence}=require('../portal/test-evidence-map');
const {mapAttemptFailures}=require('../portal/attempt-failure-map');
test('same TC label in two specs cannot cross-assign evidence',()=>{
 const root=path.resolve('tmp','artifacts');
 const first=path.join(root,'one','trace.zip');
 const second=path.join(root,'two','trace.zip');
 const report={suites:[{specs:[
   {title:'TC-001: first',tests:[{id:'unique-A',results:[{status:'failed',error:{message:'bad'},attachments:[{path:first}]}]}]},
   {title:'TC-001: second',tests:[{id:'unique-B',results:[{status:'passed',attachments:[{path:second}]}]}]}
 ]}]};
 const list=[{name:'one/trace.zip',url:'/one'},{name:'two/trace.zip',url:'/two'}];
 const mapped=mapEvidence(report,list,root);
 const attempts=mapAttemptFailures(report,mapped);
 assert.equal(attempts.attempts.length,2);
 assert.equal(attempts.attempts[0].evidence[0].evidenceName,'one/trace.zip');
 assert.equal(attempts.attempts[1].evidence[0].evidenceName,'two/trace.zip');
 assert.notEqual(attempts.attempts[0].testKey,attempts.attempts[1].testKey);
});
test('report-index fallback aligned across unnamed specs',()=>{
 const root=path.resolve('tmp','artifacts');
 const report={suites:[{specs:[
  {title:'helper unknown',tests:[{results:[{}]}]},
  {title:'DIAG-001: failure',tests:[{results:[{status:'failed',error:{message:'x'},attachments:[{path:path.join(root,'trace.zip')}]}]}]}
 ]}]};
 const map=mapEvidence(report,[{name:'trace.zip',url:'/trace'}],root);
 const result=mapAttemptFailures(report,map);
 assert.equal(result.attempts[0].evidence.length,1);
 assert.equal(result.attempts[0].testKey,'report-index:1');
});
