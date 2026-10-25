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

test('trace ZIP with data descriptor flag extracts only allowlisted action names',()=>{
 const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
 const {extractActions}=require('../portal/evidence-intelligence');
 const name=Buffer.from('test.trace');
 const body=Buffer.from(JSON.stringify({type:'before',apiName:'page.click',params:{selector:'SECRET'}})+'\n'+JSON.stringify({type:'before',apiName:'Page.goto'})+'\n');
 const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(8,6);local.writeUInt16LE(name.length,26);
 const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50,0);central.writeUInt16LE(8,8);central.writeUInt32LE(body.length,20);central.writeUInt32LE(body.length,24);central.writeUInt16LE(name.length,28);
 const offset=local.length+name.length+body.length;
 const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);end.writeUInt32LE(central.length+name.length,12);end.writeUInt32LE(offset,16);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'trace-'));
 const zip=path.join(dir,'sample.zip');
 try{fs.writeFileSync(zip,Buffer.concat([local,name,body,central,name,end]));
  const actions=extractActions(zip);
  assert.deepEqual(actions,[{action:'click'},{action:'goto'}]);
  assert.ok(!JSON.stringify(actions).includes('SECRET'));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('before/after trace events create safe action timeline and failure flag',()=>{
 const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
 const {extractTrace}=require('../portal/evidence-intelligence');
 const name=Buffer.from('timeline.trace');
 const body=Buffer.from([
  {type:'before',callId:'c1',apiName:'page.goto',startTime:100,params:{url:'https://secret.example'}},
  {type:'after',callId:'c1',endTime:145,error:{message:'TOKEN_PRIVATE'}}
 ].map(JSON.stringify).join('\n')+'\n');
 const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50,0);local.writeUInt16LE(name.length,26);
 const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50,0);central.writeUInt32LE(body.length,20);central.writeUInt32LE(body.length,24);central.writeUInt16LE(name.length,28);
 const offset=local.length+name.length+body.length;
 const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);end.writeUInt32LE(central.length+name.length,12);end.writeUInt32LE(offset,16);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'timeline-')),zip=path.join(dir,'test.zip');
 try{
  fs.writeFileSync(zip,Buffer.concat([local,name,body,central,name,end]));
  const data=extractTrace(zip);
  assert.deepEqual(data.timeline,[{action:'goto',durationMs:45,failed:true}]);
  assert.equal(data.failedEvents,1);
  assert.ok(!JSON.stringify(data).includes('TOKEN_PRIVATE'));
  assert.ok(!JSON.stringify(data).includes('secret.example'));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
