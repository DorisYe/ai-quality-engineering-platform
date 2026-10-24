const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createStore } = require('../portal/bug-review-store');

const id = '123e4567-e89b-12d3-a456-426614174000';
const draftId = id + ':0';
const run = { id, selection:'all', status:'failed', finishedAt:new Date().toISOString(), summary:{tests:[{id:'TC-001',title:'TC-001: failed test',status:'unexpected',error:'Unexpected status'}]} };
function setup() {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'qa-draft-'));
  fs.mkdirSync(path.join(root,id));
  return { root, store:createStore(root), readRun: x=>x===id?run:null, evidence:()=>[] };
}
test('review persists through store recreation', t=>{
  const ctx=setup();t.after(()=>fs.rmSync(ctx.root,{recursive:true,force:true}));
  const r=ctx.store.update(id,draftId,{state:'in_review',category:'Test automation issue',priority:'Medium',reviewNotes:'Investigating'},ctx.readRun,ctx.evidence);
  assert.equal(r.draft.state,'in_review');
  assert.equal(createStore(ctx.root).list(id,ctx.readRun,ctx.evidence)[0].priority,'Medium');
});
test('approval requires classification and notes',t=>{
  const ctx=setup();t.after(()=>fs.rmSync(ctx.root,{recursive:true,force:true}));
  assert.equal(ctx.store.update(id,draftId,{state:'approved'},ctx.readRun,ctx.evidence).code,400);
  assert.equal(ctx.store.update(id,draftId,{state:'approved',category:'Product defect',reviewNotes:'Confirmed manually'},ctx.readRun,ctx.evidence).draft.state,'approved');
});
test('unsupported fields and invalid priorities rejected',t=>{
  const ctx=setup();t.after(()=>fs.rmSync(ctx.root,{recursive:true,force:true}));
  assert.equal(ctx.store.update(id,draftId,{title:'overwritten'},ctx.readRun,ctx.evidence).code,400);
  assert.equal(ctx.store.update(id,draftId,{priority:'Emergency'},ctx.readRun,ctx.evidence).code,400);
});
test('diagnostic does not expose reviewable drafts',t=>{
  const ctx=setup();t.after(()=>fs.rmSync(ctx.root,{recursive:true,force:true}));
  const diag=()=>({...run,selection:'evidence-check'});
  assert.deepEqual(ctx.store.list(id,diag,ctx.evidence),[]);
  assert.equal(ctx.store.update(id,draftId,{state:'approved'},diag,ctx.evidence).code,404);
});
