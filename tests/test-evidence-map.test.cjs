const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {mapEvidence}=require('../portal/test-evidence-map');
test('maps exact Playwright reporter attachments to test and attempt',()=>{
 const root=path.resolve('tmp','artifacts');
 const file=path.join(root,'case','trace.zip');
 const report={suites:[{specs:[{title:'DIAG-001: controlled failure',tests:[{results:[{attachments:[{name:'trace',path:file,contentType:'application/zip'}]}]}]}]}]};
 const result=mapEvidence(report,[{name:'case/trace.zip',url:'/evidence/trace.zip'}],root);
 assert.equal(result.mapped.length,1);
 assert.equal(result.mapped[0].testId,'DIAG-001');
 assert.equal(result.mapped[0].attempt,0);
 assert.equal(result.mapped[0].kind,'trace');
 assert.equal(result.verifiedOwnership,true);
});
test('rejects unrelated or outside artifact paths',()=>{
 const root=path.resolve('tmp','artifacts');
 const report={suites:[{specs:[{title:'TC-001: failed',tests:[{results:[{attachments:[{path:path.resolve('outside','trace.zip')}]}]}]}]}]};
 const result=mapEvidence(report,[{name:'trace.zip',url:'/evidence'}],root);
 assert.equal(result.mapped.length,0);
 assert.equal(result.verifiedOwnership,false);
});
test('does not infer ownership from filename if no reporter attachment',()=>{
 const result=mapEvidence({suites:[]},[{name:'TC-001-trace.zip'}],path.resolve('artifacts'));
 assert.deepEqual(result.mapped,[]);
});
