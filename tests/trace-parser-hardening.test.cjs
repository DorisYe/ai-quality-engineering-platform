const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {extractTrace}=require('../portal/evidence-intelligence');
function withZip(buffer,fn){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'bad-zip-'));const file=path.join(dir,'trace.zip');try{fs.writeFileSync(file,buffer);fn(extractTrace(file));}finally{fs.rmSync(dir,{recursive:true,force:true});}}
test('truncated ZIP yields bounded empty result rather than throwing',()=>{
 withZip(Buffer.from([0x50,0x4b,0x03]),result=>{assert.deepEqual(result.actions,[]);assert.deepEqual(result.timeline,[]);assert.match(result.reason,/ZIP directory/);});
});
test('ZIP64 metadata is rejected without attempting extraction',()=>{
 const e=Buffer.alloc(22);e.writeUInt32LE(0x06054b50,0);e.writeUInt16LE(0xffff,10);e.writeUInt32LE(0xffffffff,12);e.writeUInt32LE(0xffffffff,16);
 withZip(e,result=>{assert.equal(result.reason,'Unsupported ZIP directory');assert.deepEqual(result.correlations,[]);});
});
test('out-of-bounds central directory returns safe diagnostic',()=>{
 const e=Buffer.alloc(22);e.writeUInt32LE(0x06054b50,0);e.writeUInt16LE(1,10);e.writeUInt32LE(100,12);e.writeUInt32LE(500,16);
 withZip(e,result=>{assert.equal(result.reason,'Invalid ZIP directory bounds');});
});
test('oversized ZIP is rejected before file decoding',()=>{
 withZip(Buffer.alloc(12*1024*1024+1),result=>{assert.equal(result.reason,'ZIP exceeds size limit');});
});
test('nonexistent path returns safe unreadable status',()=>{
 const r=extractTrace(path.join(os.tmpdir(),'missing-trace-does-not-exist.zip'));
 assert.equal(r.reason,'ZIP unreadable');assert.deepEqual(r.timeline,[]);
});
