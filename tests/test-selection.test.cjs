const test = require('node:test');
const assert = require('node:assert/strict');
const { prepareSelection } = require('../portal/test-selection');

test('single checked test retains backwards-compatible string selection', () => {
  assert.deepEqual(prepareSelection(['TC-003']), {
    selection: 'TC-003', grep: '^(?:TC-003):'
  });
});
test('multiple tests are normalized in stable library order', () => {
  assert.deepEqual(prepareSelection(['TC-005', 'TC-001', 'TC-003']), {
    selection: ['TC-001', 'TC-003', 'TC-005'],
    grep: '^(?:TC-001|TC-003|TC-005):'
  });
});
test('all and evidence-check remain distinct execution modes', () => {
  assert.deepEqual(prepareSelection('all'), { selection: 'all', grep: null });
  assert.deepEqual(prepareSelection('evidence-check'), { selection: 'evidence-check', grep: null });
});
test('rejects empty, unknown, duplicate and malformed selections', () => {
  for (const invalid of [[], ['TC-999'], ['TC-001', 'TC-001'], ['TC-001', '--config=evil'], null, 5, {}, ['TC-001', 7], ['TC-001', 'TC-002', 'TC-003', 'TC-004', 'TC-005', 'TC-006', 'TC-007']]) {
    const result = prepareSelection(invalid);
    assert.equal(result.code, 400, JSON.stringify(invalid));
    assert.equal(result.grep, undefined);
  }
});
test('legacy single-test selection continues to work', () => {
  assert.deepEqual(prepareSelection('TC-002'), {
    selection: 'TC-002', grep: '^(?:TC-002):'
  });
});

test('controlled demo TC-006 is allowlisted for selected runs', () => {
  assert.deepEqual(prepareSelection('TC-006'), {
    selection: 'TC-006', grep: '^(?:TC-006):'
  });
  assert.deepEqual(prepareSelection(['TC-003', 'TC-006']), {
    selection: ['TC-003', 'TC-006'], grep: '^(?:TC-003|TC-006):'
  });
});
