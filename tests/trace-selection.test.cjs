const test=require('node:test');
const assert=require('node:assert/strict');
const {selectMappedTraces}=require('../portal/trace-selection');
test('selects only exact reporter-owned trace ZIPs',()=>{
 const map={mapped:[{kind:'trace',testKey:'pw:A',testId:'TC-001',attempt:0,evidenceName:'a/trace.zip'},{kind:'trace',testKey:'pw:B',testId:'TC-002',attempt:1,evidenceName:'b/trace.zip'}]};
 const files=[{name:'a/trace.zip'},{name:'unowned.zip'},{name:'b/trace.zip'}];
 const result=selectMappedTraces(map,files);
 assert.deepEqual(result.selected.map(x=>[x.testKey,x.attempt,x.evidenceName]),[['pw:A',0,'a/trace.zip'],['pw:B',1,'b/trace.zip']]);
 assert.equal(result.unowned,1);
});
test('unmapped or fictitious files are not selected',()=>{
 const result=selectMappedTraces({mapped:[{kind:'trace',testKey:'pw:A',attempt:0,evidenceName:'not-found.zip'}]},[{name:'unowned.zip'}]);
 assert.equal(result.selected.length,0);
 assert.equal(result.unowned,1);
});
test('does not select screenshot or non-zip attachments as traces',()=>{
 const r=selectMappedTraces({mapped:[{kind:'screenshot',evidenceName:'image.png'},{kind:'trace',evidenceName:'fake.txt'}]},[{name:'image.png'},{name:'fake.txt'}]);
 assert.equal(r.selected.length,0);
});
