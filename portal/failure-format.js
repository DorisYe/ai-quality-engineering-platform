// Turn Playwright's developer-oriented assertion output into a concise Bug Draft
// Actual Result. The untouched error remains in M4.1 failureDetection and reports.
const ansi = /\u001b\[[0-?]*[ -/]*[@-~]/g;
function readableActualResult(errorMessage) {
  if (typeof errorMessage !== 'string' || !errorMessage.trim()) {
    return 'No failure details reported.';
  }
  const plain = errorMessage.replace(ansi, '').replace(/\r/g, '');
  // A typical Playwright locator assertion includes locator, expected and received.
  const locator = plain.match(/^\s*Locator:\s*locator\((.+)\)\s*$/m)?.[1];
  const expected = plain.match(/^\s*Expected:\s*(.+?)\s*$/m)?.[1];
  const received = plain.match(/^\s*Received:\s*(.+?)\s*$/m)?.[1];
  if (expected && received) {
    const target = locator ? 'Element ' + locator + ': ' : '';
    return target + 'expected ' + expected + ', but received ' + received + '.';
  }
  // For unrecognized assertions, retain the meaningful message but omit
  // repetitive Playwright call logs and stack frames, without guessing a cause.
  const beforeLog = plain.split(/^\s*Call log:\s*$/m)[0];
  const lines = beforeLog.split('\n').map(line => line.trim()).filter(Boolean);
  const meaningful = lines.filter(line =>
    !/^\s*at\s+/.test(line) &&
    !/^\s*\d+\s*\|/.test(line) &&
    !/^\s*\^/.test(line) &&
    !/^Timeout:\s*\d+ms$/.test(line)
  );
  return meaningful.slice(0, 6).join('\n').slice(0, 1600) || 'Failure details available in the Playwright report.';
}
module.exports = { readableActualResult };
