const test = require('node:test');
const assert = require('node:assert/strict');
const { summarize } = require('../portal/result-parser');
const { detectFailures } = require('../portal/failure-detection');

// Minimal Playwright JSON Reporter-shaped fixture, not a real AUT failure.
function reportWith(statuses) {
  return {
    suites: [{
      specs: statuses.map(([id, status, error]) => ({
        title: id + ': sample scenario',
        tests: [{
          status,
          results: [{ duration: 125, ...(error ? { error: { message: error } } : {}) }]
        }]
      }))
    }]
  };
}

test('M4.1 detects unexpected tests and preserves failure context', () => {
  const summary = summarize(reportWith([
    ['TC-001', 'expected'],
    ['TC-003', 'unexpected', 'Expected Acknowledged, received Active']
  ]));
  const result = detectFailures(summary, 'all');
  assert.equal(result.status, 'available');
  assert.equal(result.count, 1);
  assert.deepEqual(result.failures[0], {
    testId: 'TC-003',
    title: 'TC-003: sample scenario',
    status: 'unexpected',
    durationMs: 125,
    errorMessage: 'Expected Acknowledged, received Active'
  });
});

test('M4.1 reports zero failures when all tests passed', () => {
  const result = detectFailures(summarize(reportWith([
    ['TC-001', 'expected'], ['TC-002', 'expected']
  ])), 'all');
  assert.equal(result.status, 'available');
  assert.equal(result.count, 0);
  assert.deepEqual(result.failures, []);
});

test('M4.1 does not treat flaky or skipped tests as unexpected failures', () => {
  const result = detectFailures(summarize(reportWith([
    ['TC-001', 'flaky'], ['TC-002', 'skipped']
  ])), 'all');
  assert.equal(result.count, 0);
});

test('M4.1 excludes intentional DIAG-001 evidence failures', () => {
  const summary = summarize(reportWith([['DIAG-001', 'unexpected', 'Intentional failure']]));
  const result = detectFailures(summary, 'evidence-check');
  assert.equal(result.status, 'excluded');
  assert.equal(result.count, 0);
});

test('M4.1 distinguishes missing results from zero failures', () => {
  const result = detectFailures(null, 'all');
  assert.equal(result.status, 'unavailable');
  assert.equal(result.count, 0);
});
