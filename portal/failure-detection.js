// M4.1: Detect unexpected Playwright failures from the M3 result summary.
// Detection is not bug classification or automatic defect filing.
function detectFailures(summary, selection) {
  if (selection === 'evidence-check') {
    return { status: 'excluded', failures: [], count: 0 };
  }
  if (!summary || !Array.isArray(summary.tests)) {
    return { status: 'unavailable', failures: [], count: 0 };
  }

  const failures = summary.tests
    .filter(test => test.status === 'unexpected')
    .map(test => ({
      testId: test.id,
      title: test.title,
      status: test.status,
      durationMs: test.durationMs,
      errorMessage: test.error || 'No failure message was reported'
    }));

  return { status: 'available', failures, count: failures.length };
}

module.exports = { detectFailures };
