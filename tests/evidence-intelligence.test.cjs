const test=require('node:test');
const assert=require('node:assert/strict');
const {preview}=require('../portal/evidence-intelligence');
test('only allowlisted metadata appears in preview',()=>{
 const data=preview({summary:{tests:[{id:'TC-001',status:'unexpected',durationMs:120,error:'Authorization: Bearer SECRET',title:'secret'}]}},[{name:'x/trace.zip'},{name:'screenshot.png'},{name:'video.webm'}]);
 assert.equal(data.counts.traces,1);
 assert.equal(data.counts.screenshots,1);
 assert.equal(data.counts.videos,1);
 assert.equal(data.tests[0].status,'unexpected');
 assert.equal(data.uploaded,false);
 assert.ok(!JSON.stringify(data).includes('SECRET'));
});
test('limits test entries and strips unsafe IDs',()=>{
 const data=preview({summary:{tests:Array.from({length:50},()=>({id:'TC<script>',status:'unknown',durationMs:-5}))}},[]);
 assert.equal(data.tests.length,20);
 assert.equal(data.tests[0].id,'TCscript');
 assert.equal(data.tests[0].durationMs,0);
});
