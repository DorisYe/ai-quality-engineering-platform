const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { draftFor, getReview, saveReview, validateReview } = require('../portal/bug-review');

const root = path.resolve(__dirname, '..', 'data', 'qa-results');
const id = crypto.randomUUID();
const run = { id, bugDrafts:{ status:'available',drafts:[{id:id+':1',testId:'TC-003'}]} };
const original = {
  title:'[QA Review] TC-003', expected:'Status is Acknowledged', actual:'Status is Active',
  stepsToReproduce:['Create event','Click Acknowledge'],reviewStatus:'reviewed',
  triageDecision:'confirmed-bug',severity:'high',priority:'p1',
  reviewNotes:'Reproduced on local AUT',revision:0
};
test.after(()=>fs.rmSync(path.join(root,id),{recursive:true,force:true}));

test('accept valid triage payload, reject unknown and oversize fields',()=>{
  assert.equal(validateReview(original),null);
  assert.match(validateReview({...original,unexpected:'x'}).error,/unrecognized/);
  assert.match(validateReview({...original,title:''}).error,/title/);
  assert.match(validateReview({...original,actual:'x'.repeat(4001)}).error,/actual/);
  assert.match(validateReview({...original,priority:'p99'}).error,/Invalid triage/);
  assert.match(validateReview({...original,revision:-1}).error,/revision/);
});
test('save review, reload persisted values, increment revision',()=>{
  const saved=saveReview(run,'1',original);
  assert.equal(saved.review.revision,1);
  assert.equal(saved.review.triageDecision,'confirmed-bug');
  assert.deepEqual(getReview(run,'1'),saved.review);
  const second=saveReview(run,'1',{...original,reviewNotes:'Retested',revision:1});
  assert.equal(second.review.revision,2);
  assert.equal(getReview(run,'1').reviewNotes,'Retested');
});
test('reject stale revision rather than overwrite someone else’s saved review',()=>{
  const result=saveReview(run,'1',original);
  assert.equal(result.code,409);
  assert.equal(getReview(run,'1').reviewNotes,'Retested');
});
test('reject missing, invalid or excluded drafts without persisting',()=>{
  assert.equal(draftFor(run,'2'),null);
  assert.equal(saveReview(run,'2',original).code,404);
  assert.equal(saveReview({id,bugDrafts:{status:'excluded',drafts:[]}},'1',original).code,404);
  assert.equal(draftFor({...run,id:'../../bad'},'1'),null);
});
test('reviewed but unresolved triage requires explanatory notes',()=>{
  const result=saveReview(run,'1',{...original,triageDecision:'needs-investigation',reviewNotes:'',revision:2});
  assert.equal(result.code,400);
  assert.equal(getReview(run,'1').triageDecision,'confirmed-bug');
});
