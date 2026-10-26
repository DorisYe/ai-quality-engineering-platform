const test = require('node:test');
const assert = require('node:assert/strict');
const { summarize, buildSummary } = require('../scripts/ci-test-summary.cjs');
test('counts Playwright test outcomes across nested suites', () => {
  const report = { suites: [{ specs: [{ tests: [
    { status: 'expected' }, { status: 'unexpected' }, { status: 'flaky' },
    { status: 'skipped' }, { status: 'interrupted' }
  ] }], suites: [{ specs: [{ tests: [{ status: 'expected' }] }] }] }] };
  assert.deepEqual(summarize(report), { total: 6, passed: 2, failed: 1, skipped: 1, flaky: 1, interrupted: 1 });
});
test('missing suites produce zero counters', () => {
  assert.equal(summarize({}).total, 0);
});
test('summary contains metrics without leaking reporter errors or source', () => {
  const counts = summarize({ suites: [{ specs: [{ tests: [{ status: 'unexpected', errors: [{ message: 'SECRET_MARKER' }] }] }] }] });
  const summary = buildSummary(counts, true);
  assert.match(summary, /\| failed \| 1 \|/);
  assert.equal(summary.includes('SECRET_MARKER'), false);
});
test('summary explicitly handles missing output', () => {
  assert.match(buildSummary(summarize({}), false), /unavailable/);
});
