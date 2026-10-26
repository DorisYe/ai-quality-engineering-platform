const fs = require('node:fs');
const path = require('node:path');

function summarize(report) {
  const counts = { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0, interrupted: 0 };
  function walk(suites) {
    for (const suite of suites || []) {
      for (const spec of suite.specs || []) {
        for (const test of spec.tests || []) {
          counts.total++;
          const outcome = test.status === 'expected' ? 'passed'
            : test.status === 'flaky' ? 'flaky'
            : test.status === 'skipped' ? 'skipped'
            : test.status === 'interrupted' ? 'interrupted'
            : 'failed';
          counts[outcome]++;
        }
      }
      walk(suite.suites);
    }
  }
  walk(report.suites);
  return counts;
}

function buildSummary(counts, available) {
  const rows = Object.entries(counts).map(([k, v]) => `| ${k} | ${v} |`).join('\n');
  return [
    '## M5.2 — Playwright Test Report',
    available ? 'Source: Playwright JSON reporter.' : 'Playwright JSON report unavailable (test step may have failed before execution).',
    '',
    '| Metric | Count |',
    '| --- | ---: |',
    rows,
    '',
    'Diagnostic DIAG-001 is excluded from the normal CI regression.',
    'On failures, download the Playwright artifact from the workflow run.'
  ].join('\n');
}

if (require.main === module) {
  const filename = process.argv[2] || 'ci-artifacts/playwright-results.json';
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  let counts = { total: 0, passed: 0, failed: 0, skipped: 0, flaky: 0, interrupted: 0 };
  let available = false;
  try {
    counts = summarize(JSON.parse(fs.readFileSync(filename, 'utf8')));
    available = true;
  } catch (_) {}
  const text = buildSummary(counts, available) + '\n';
  process.stdout.write(text);
  if (summaryPath) fs.appendFileSync(summaryPath, text);
}
module.exports = { summarize, buildSummary };
