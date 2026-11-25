const test = require('node:test');
const assert = require('node:assert/strict');
const { generateBugDrafts } = require('../portal/bug-drafts');

const runId = '01234567-89ab-4cde-8f01-234567890abc';
const reportUrl = '/api/runs/' + runId + '/report/index.html';
const failure = { testId: 'TC-003', title: 'TC-003: Acknowledge', status: 'unexpected', durationMs: 230, errorMessage: 'Expected Acknowledged, received Active' };

test('unexpected failure creates a review-only draft with real test metadata', () => {
  const result = generateBugDrafts({status:'available',failures:[failure]},runId,reportUrl,[]);
  assert.equal(result.status, 'available');
  assert.equal(result.count, 1);
  const draft = result.drafts[0];
  assert.equal(draft.reviewStatus, 'needs-review');
  assert.match(draft.title, /TC-003/);
  assert.match(draft.expected, /Acknowledged/);
  assert.equal(draft.actual, failure.errorMessage);
  assert.ok(draft.stepsToReproduce.length);
  assert.equal(draft.reportUrl, reportUrl);
  assert.equal(draft.runId, runId);
});

test('run-level evidence links remain explicitly scoped, not claimed as test-specific', () => {
  const evidence = [{name:'some-test/video.webm',url:'/api/runs/foo/evidence/some-test/video.webm'}];
  const draft = generateBugDrafts({status:'available',failures:[failure]},runId,reportUrl,evidence).drafts[0];
  assert.equal(draft.evidenceScope, 'run-level');
  assert.deepEqual(draft.evidenceLinks, evidence);
});

test('no failures means available with zero drafts', () => {
  assert.deepEqual(generateBugDrafts({status:'available',failures:[]},runId,reportUrl), {status:'available',drafts:[],count:0});
});

test('intentional DIAG failure and missing reports do not create drafts', () => {
  for(const status of ['excluded','unavailable']){
    const result=generateBugDrafts({status,failures:[failure]},runId,reportUrl);
    assert.equal(result.status,status);
    assert.equal(result.count,0);
  }
  assert.equal(generateBugDrafts(null,runId,reportUrl).status,'unavailable');
});

test('multiple unexpected failures each get stable unique draft identifiers', () => {
  const result=generateBugDrafts({status:'available',failures:[failure,{...failure,testId:'TC-005'}]},runId,reportUrl);
  assert.equal(result.count,2);
  assert.notEqual(result.drafts[0].id,result.drafts[1].id);
  assert.equal(result.drafts[1].testId,'TC-005');
});
