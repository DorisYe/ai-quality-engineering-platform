// Explicit, local-only synthetic fixture. Does not run Playwright or alter existing runs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const id = crypto.randomUUID();
const folder = path.join(root, 'data', 'qa-results', id);
const finishedAt = new Date().toISOString();
const run = {
  id, selection: 'fixture-review', status: 'failed',
  startedAt: finishedAt, finishedAt, exitCode: 1,
  output: 'Synthetic fixture for M4.2 Bug Draft Review integration — not a real Playwright execution.',
  error: null, reportUrl: null,
  summary: {
    total: 1, passed: 0, failed: 1, skipped: 0, flaky: 0,
    tests: [{
      id: 'FIXTURE-001',
      title: 'FIXTURE-001: simulated application status mismatch',
      status: 'unexpected',
      durationMs: 125,
      error: 'Synthetic mismatch: expected Acknowledged, received New'
    }]
  }
};
fs.mkdirSync(folder, { recursive: true });
fs.writeFileSync(path.join(folder, 'run.json'), JSON.stringify(run, null, 2));
process.stdout.write('Created SYNTHETIC review fixture: ' + id + '\n');
process.stdout.write('Select the "fixture-review" entry in Portal Execution History.\n');
