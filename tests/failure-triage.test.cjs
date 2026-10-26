const test = require('node:test');
const assert = require('node:assert/strict');
const { suggest } = require('../portal/failure-triage');

test('timeout suggestion remains low confidence', () => {
  const result = suggest({ actualResult: 'Timed out waiting for selector' });
  assert.equal(result.suggestedCategory, 'Flaky test');
  assert.equal(result.confidence, 'low');
  assert.equal(result.requiresHumanReview, true);
});
test('connection failure suggests environment investigation', () => {
  assert.equal(suggest({ actualResult: 'ECONNREFUSED 127.0.0.1:3100' }).suggestedCategory, 'Environment issue');
});
test('assertion mismatch never claims product defect', () => {
  const result = suggest({ actualResult: 'Expected status Acknowledged, received New' });
  assert.equal(result.suggestedCategory, 'Unclassified test failure');
  assert.equal(result.source, 'rule-based');
});
test('unknown error remains unclassified', () => {
  assert.equal(suggest({ actualResult: 'Unexpected result' }).suggestedCategory, 'Unclassified test failure');
});
