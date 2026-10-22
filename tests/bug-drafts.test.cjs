const test = require('node:test');
const assert = require('node:assert/strict');
const { createDrafts } = require('../portal/bug-drafts');

const run = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  selection: 'all',
  status: 'failed',
  finishedAt: '2026-10-21T00:00:00.000Z',
  reportUrl: '/api/runs/123/report/index.html',
  summary: { tests: [
    { id: 'TC-001', title: 'TC-001: scenario', status: 'unexpected', error: 'Expected acknowledged, got New' },
    { id: 'TC-002', title: 'TC-002: scenario', status: 'expected', error: null }
  ] }
};
test('creates draft only for unexpected test result', () => {
  const drafts = createDrafts(run, [{ name: 'trace.zip', url: '/evidence/trace.zip' }]);
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].testId, 'TC-001');
  assert.equal(drafts[0].state, 'draft');
  assert.equal(drafts[0].evidence.length, 1);
  assert.match(drafts[0].classification, /Needs QA triage/);
});
test('excludes intentional diagnostic run', () => {
  assert.deepEqual(createDrafts({ ...run, selection: 'evidence-check' }), []);
});
test('skips running runs and passes', () => {
  assert.deepEqual(createDrafts({ ...run, status: 'running' }), []);
  assert.deepEqual(createDrafts({ ...run, summary: { tests: [{ status: 'expected' }] } }), []);
});
