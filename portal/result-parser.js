// Convert Playwright's JSON reporter schema into a compact portal-facing summary.
function summarize(report) {
  const tests = [];
  function visit(suites) {
    for (const suite of suites || []) {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          const result = (test.results || []).at(-1);
          const title = spec.title || '';
          const match = title.match(/\bTC-00[1-5]\b/);
          tests.push({
            id: match ? match[0] : title,
            title,
            status: test.status || 'unknown',
            durationMs: (test.results || []).reduce((sum, r) => sum + (r.duration || 0), 0),
            error: result?.error?.message || null
          });
        }
      }
      visit(suite.suites);
    }
  }
  visit(report.suites);
  const count = status => tests.filter(t => t.status === status).length;
  return { total: tests.length, passed: count('expected'), failed: count('unexpected'), skipped: count('skipped'), flaky: count('flaky'), tests };
}
module.exports = { summarize };
