const cases = require('./test-cases');
const allowed = cases.map(testCase => testCase.id);
const knownIds = new Set(allowed);

// API accepts 'all', 'evidence-check', one known test ID, or a non-empty
// array of distinct known test IDs. Never interpolate untrusted text in --grep.
function prepareSelection(selection) {
  if (selection === 'all' || selection === 'evidence-check') {
    return { selection, grep: null };
  }
  const ids = typeof selection === 'string' ? [selection] : selection;
  if (!Array.isArray(ids) || !ids.length || ids.length > allowed.length ||
      ids.some(id => typeof id !== 'string' || !knownIds.has(id)) ||
      new Set(ids).size !== ids.length) {
    return { error: 'Select one or more known test cases', code: 400 };
  }
  const ordered = allowed.filter(id => ids.includes(id));
  const grep = '^(?:' + ordered.join('|') + '):';
  return { selection: ordered.length === 1 ? ordered[0] : ordered, grep };
}

module.exports = { prepareSelection };
