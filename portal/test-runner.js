const { spawn } = require('node:child_process');
const path = require('node:path');
const crypto = require('node:crypto');
const fs = require('node:fs');
const { summarize } = require('./result-parser');
const cases = require('./test-cases');

const root = path.resolve(__dirname, '..');
const playwrightCLI = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');
const knownIds = new Set(cases.map(item => item.id));
let current = null;

function snapshot() {
  if (!current) return null;
  const { id, selection, status, startedAt, finishedAt, exitCode, output, error, summary } = current;
  return { id, selection, status, startedAt, finishedAt, exitCode, output, error, summary };
}

function launch(selection) {
  if (current && current.status === 'running') return { error: 'A test run is already in progress', code: 409 };
  if (selection !== 'all' && !knownIds.has(selection)) return { error: 'Unknown test case', code: 400 };

  const run = {
    id: crypto.randomUUID(), selection, status: 'running',
    startedAt: new Date().toISOString(), finishedAt: null,
    exitCode: null, output: '', error: null, summary: null
  };
  current = run;
  const resultDirectory = path.join(root, 'data', 'qa-results');
  fs.mkdirSync(resultDirectory, { recursive: true });
  const jsonPath = path.join(resultDirectory, run.id + '.json');
  const args = [playwrightCLI, 'test'];
  if (selection !== 'all') args.push('--grep', selection + ':');
  // Playwright is always launched from a fixed CLI and a fixed allowlist. No shell is used.
  const proc = spawn(process.execPath, args, {
    cwd: root, shell: false, windowsHide: true,
    env: { ...process.env, FORCE_COLOR: '0', CI: '1', QA_RUN_JSON: jsonPath },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const append = chunk => { run.output = (run.output + chunk.toString('utf8')).slice(-12000); };
  proc.stdout.on('data', append);
  proc.stderr.on('data', append);
  proc.on('error', err => {
    run.error = err.message;
    run.status = 'failed';
    run.finishedAt = new Date().toISOString();
  });
  proc.on('close', (code, signal) => {
    run.exitCode = code;
    run.finishedAt = new Date().toISOString();
    if (run.status === 'running') run.status = code === 0 ? 'passed' : 'failed';
    if (signal) run.error = 'Process terminated: ' + signal;
    try {
      run.summary = summarize(JSON.parse(fs.readFileSync(jsonPath, 'utf8')));
      if (!run.summary.total && run.status === 'passed') { run.status = 'failed'; run.error = 'No test results in JSON report'; }
    } catch (err) {
      run.error = 'Unable to parse JSON test report: ' + err.message;
      if (run.status === 'passed') run.status = 'failed';
    }
  });
  return { run: snapshot() };
}

module.exports = { launch, snapshot };
