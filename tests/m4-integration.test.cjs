// M4.4 integration contract tests: M4.1 -> M4.2 -> M4.3.
// These tests use isolated synthetic run IDs and do not start AUT or QA Portal.
// TC-006 remains an intentionally failing live demo; this suite itself should PASS.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { detectFailures } = require('../portal/failure-detection');
const { generateBugDrafts } = require('../portal/bug-drafts');
const { getReview, saveReview } = require('../portal/bug-review');
const runner = require('../portal/test-runner');

const resultsRoot = path.resolve(__dirname, '..', 'data', 'qa-results');
const generated = [];
function runFixture(testId, error) {
  const id = randomUUID();
  generated.push(id);
  const summary = { total: 1, passed: 0, failed: 1, skipped: 0, flaky: 0,
    tests: [{ id: testId, title: testId + ': Reset Filters restores both filters',
      status: 'unexpected', durationMs: 1234, error }] };
  const failureDetection = detectFailures(summary, testId);
  const reportUrl = '/api/runs/' + id + '/report/index.html';
  const evidenceFiles = [{ name: 'TC-006/video.webm', url: '/api/runs/' + id + '/evidence/TC-006/video.webm' }];
  const bugDrafts = generateBugDrafts(failureDetection, id, reportUrl, evidenceFiles);
  const run = { id, status: 'failed', startedAt: new Date().toISOString(),
    selection: testId, summary, failureDetection, bugDrafts, reportUrl };
  const directory = path.join(resultsRoot, id);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'run.json'), JSON.stringify(run, null, 2));
  return run;
}
test.after(() => {
  for (const id of generated) fs.rmSync(path.join(resultsRoot, id), { recursive: true, force: true });
});

test('TC-006 unexpected result flows through detection, draft, review and reloaded run without losing original data', () => {
  const run = runFixture('TC-006', 'Expected: All; Received: Active');
  assert.equal(run.failureDetection.status, 'available');
  assert.equal(run.failureDetection.count, 1);
  assert.equal(run.failureDetection.failures[0].testId, 'TC-006');
  assert.equal(run.bugDrafts.count, 1);
  const draft = run.bugDrafts.drafts[0];
  assert.equal(draft.reviewStatus, 'needs-review');
  assert.match(draft.expected, /both Severity and Status to All/i);
  assert.match(draft.actual, /Received: Active/);
  assert.equal(draft.evidenceScope, 'run-level');
  assert.equal(draft.evidenceLinks.length, 1);
  assert.equal(getReview(run, '1'), null);

  const reviewed = saveReview(run, '1', {
    title: 'Reset Filters does not clear Status',
    expected: draft.expected,
    actual: draft.actual,
    stepsToReproduce: draft.stepsToReproduce,
    reviewStatus: 'reviewed',
    triageDecision: 'confirmed-bug',
    severity: 'medium',
    priority: 'p2',
    reviewNotes: 'Controlled defect retained for demonstrations',
    revision: 0
  });
  assert.equal(reviewed.error, undefined);
  assert.equal(reviewed.review.revision, 1);

  const reloaded = runner.read(run.id);
  assert.equal(reloaded.bugDrafts.drafts[0].reviewStatus, 'needs-review');
  assert.equal(reloaded.bugDrafts.drafts[0].actual, draft.actual);
  assert.deepEqual(getReview(reloaded, '1'), reviewed.review);
  assert.equal(getReview(reloaded, '1').triageDecision, 'confirmed-bug');
  assert.equal(getReview(reloaded, '1').reviewNotes, 'Controlled defect retained for demonstrations');
});

test('repeating the same test failure in another run creates a separate run draft and independent review (no deduplication in M4.4)', () => {
  const first = runFixture('TC-006', 'Expected: All; Received: Active');
  const second = runFixture('TC-006', 'Expected: All; Received: Active');
  assert.notEqual(first.id, second.id);
  assert.notEqual(first.bugDrafts.drafts[0].id, second.bugDrafts.drafts[0].id);
  assert.equal(getReview(first, '1'), null);
  assert.equal(getReview(second, '1'), null);
  const saved = saveReview(first, '1', {
    title: first.bugDrafts.drafts[0].title,
    expected: first.bugDrafts.drafts[0].expected,
    actual: first.bugDrafts.drafts[0].actual,
    stepsToReproduce: first.bugDrafts.drafts[0].stepsToReproduce,
    reviewStatus: 'needs-review', triageDecision: 'needs-investigation',
    severity: 'unassigned', priority: 'unassigned',
    reviewNotes: 'First run reviewed independently', revision: 0
  });
  assert.equal(saved.error, undefined);
  assert.equal(getReview(second, '1'), null);
  assert.equal(getReview(first, '1').revision, 1);
});

test('normal passing run has no failures or drafts and diagnostic run stays excluded', () => {
  const passing = detectFailures({tests:[
    { id: 'TC-001', title: 'TC-001: script event', status: 'expected' },
    { id: 'TC-002', title: 'TC-002: details', status: 'expected' },
    { id: 'TC-003', title: 'TC-003: acknowledge', status: 'expected' },
    { id: 'TC-004', title: 'TC-004: filtering', status: 'expected' },
    { id: 'TC-005', title: 'TC-005: validation', status: 'expected' }
  ]}, 'all');
  assert.equal(passing.count, 0);
  assert.equal(generateBugDrafts(passing, randomUUID(), null).count, 0);

  const diagnostic = detectFailures({tests:[{id:'DIAG-001',status:'unexpected',error:'Intentional'}]},'evidence-check');
  assert.equal(diagnostic.status, 'excluded');
  const drafts = generateBugDrafts(diagnostic,randomUUID(),null);
  assert.equal(drafts.status, 'excluded');
  assert.equal(drafts.count, 0);
});

test('missing Playwright summary never gets misrepresented as zero failures', () => {
  const unavailable = detectFailures(null, 'TC-006');
  assert.equal(unavailable.status, 'unavailable');
  const drafts = generateBugDrafts(unavailable, randomUUID(), null);
  assert.equal(drafts.status, 'unavailable');
  assert.equal(drafts.count, 0);
});
