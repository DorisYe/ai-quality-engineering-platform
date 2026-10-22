const { spawn } = require('node:child_process');
const path = require('node:path');
const crypto = require('node:crypto');
const cases = require('./test-cases');

const root = path.resolve(__dirname, '..');
const playwrightCLI = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');
const knownIds = new Set(cases.map(item => item.id));
let current = null;

function snapshot() {
  if (!current) return null;
  const { id, selection, status, startedAt, finishedAt, exitCode, output, error } = current;
  return { id, selection, status, startedAt, finishedAt, exitCode, output, error };
}

function launch(selection) {
  if (current && current.status === 'running') return { error: 'A test run is already in progress', code: 409 };
  if (selection !== 'all' && !knownIds.has(selection)) return { error: 'Unknown test case', code: 400 };

  const run = {
    id: crypto.randomUUID(), selection, status: 'running',
    startedAt: new Date().toISOString(), finishedAt: null,
    exitCode: null, output: '', error: null
  };
  current = run;
  const args = [playwrightCLI, 'test'];
  if (selection !== 'all') args.push('--grep', '^' + selection.replace('-', '\\-') + ':');
  // Playwright is always launched from a fixed CLI and a fixed allowlist. No shell is used.
  const proc = spawn(process.execPath, args, {
    cwd: root, shell: false, windowsHide: true,
    env: { ...process.env, FORCE_COLOR: '0', CI: '1' },
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
  });
  return { run: snapshot() };
}

module.exports = { launch, snapshot };
