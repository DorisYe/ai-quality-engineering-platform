const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const { summarize } = require('./result-parser');
const { detectFailures } = require('./failure-detection');
const { generateBugDrafts } = require('./bug-drafts');
const { prepareSelection } = require('./test-selection');
const cases = require('./test-cases');
const root = path.resolve(__dirname, '..');
const resultsRoot = path.join(root, 'data', 'qa-results');
const playwrightCLI = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webm', '.zip', '.txt']);
let current = null;
fs.mkdirSync(resultsRoot, { recursive: true });

function publicRun(run) {
  if (!run) return null;
  const { id, selection, status, startedAt, finishedAt, exitCode, output, error, summary, failureDetection, bugDrafts } = run;
  return { id, selection, status, startedAt, finishedAt, exitCode, output, error, summary, failureDetection, bugDrafts, reportUrl: fs.existsSync(path.join(resultsRoot, id, 'report', 'index.html')) ? '/api/runs/' + id + '/report/index.html' : null };
}
function runDirectory(id) { return path.join(resultsRoot, id); }
function save(run) {
  fs.mkdirSync(runDirectory(run.id), { recursive: true });
  fs.writeFileSync(path.join(runDirectory(run.id), 'run.json'), JSON.stringify(publicRun(run), null, 2));
}
function snapshot() { return publicRun(current); }
function list() {
  return fs.readdirSync(resultsRoot, { withFileTypes: true }).filter(d => d.isDirectory() && uuid.test(d.name))
    .map(d => read(d.name)).filter(Boolean).sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 100);
}
function read(id) {
  if (!uuid.test(id)) return null;
  if (current && current.id === id) return publicRun(current);
  try { return JSON.parse(fs.readFileSync(path.join(runDirectory(id), 'run.json'), 'utf8')); }
  catch { return null; }
}
function evidence(id) {
  if (!read(id)) return [];
  const result = [];
  const base = path.join(runDirectory(id), 'artifacts');
  function traverse(dir, prefix) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) continue;
      const rel = prefix ? prefix + '/' + entry.name : entry.name;
      if (entry.isDirectory()) traverse(path.join(dir, entry.name), rel);
      else if (entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase())) {
        result.push({ name: rel, url: '/api/runs/' + id + '/evidence/' + rel.split('/').map(encodeURIComponent).join('/') });
      }
    }
  }
  traverse(base, '');
  return result.slice(0, 100);
}
function launch(selection) {
  if (current && current.status === 'running') return { error: 'A test run is already in progress', code: 409 };
  const prepared = prepareSelection(selection);
  if (prepared.error) return prepared;
  selection = prepared.selection;
  const run = { id: crypto.randomUUID(), selection, status: 'running', startedAt: new Date().toISOString(), finishedAt: null, exitCode: null, output: '', error: null, summary: null, failureDetection: null, bugDrafts: null };
  current = run;
  const folder = runDirectory(run.id);
  fs.mkdirSync(folder, { recursive: true });
  save(run);
  const args = [playwrightCLI, 'test'];
  if (prepared.grep) args.push('--grep', prepared.grep);
  const proc = spawn(process.execPath, args, {
    cwd: root, shell: false, windowsHide: true,
    env: { ...process.env, CI: '1', FORCE_COLOR: '0',
      QA_RUN_JSON: path.join(folder, 'results.json'),
      QA_EVIDENCE_CHECK: selection === 'evidence-check' ? '1' : '0',
      QA_RUN_REPORT_DIR: path.join(folder, 'report'),
      QA_RUN_ARTIFACT_DIR: path.join(folder, 'artifacts') },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const append = chunk => { run.output = (run.output + chunk.toString('utf8')).slice(-12000); };
  proc.stdout.on('data', append);
  proc.stderr.on('data', append);
  proc.on('error', err => { run.error = err.message; run.status = 'failed'; run.finishedAt = new Date().toISOString(); save(run); });
  proc.on('close', (code, signal) => {
    run.exitCode = code;
    run.finishedAt = new Date().toISOString();
    if (run.status === 'running') run.status = code === 0 ? 'passed' : 'failed';
    if (signal) run.error = 'Process terminated: ' + signal;
    try {
      run.summary = summarize(JSON.parse(fs.readFileSync(path.join(folder, 'results.json'), 'utf8')));
      run.failureDetection = detectFailures(run.summary, selection);
      if (!run.summary.total && run.status === 'passed') { run.status = 'failed'; run.error = 'No test results in JSON report'; }
    } catch (err) {
      run.failureDetection = detectFailures(null, selection);
      run.error = 'Unable to parse JSON test report: ' + err.message;
      if (run.status === 'passed') run.status = 'failed';
    }
    const reportUrl = fs.existsSync(path.join(folder, 'report', 'index.html'))
      ? '/api/runs/' + run.id + '/report/index.html' : null;
    run.bugDrafts = generateBugDrafts(run.failureDetection, run.id, reportUrl, evidence(run.id));
    save(run);
  });
  return { run: snapshot() };
}
function artifactPath(id, kind, parts) {
  if (!uuid.test(id) || !read(id) || !['report', 'evidence'].includes(kind)) return null;
  if (!parts.length || parts.some(p => !p || p === '.' || p === '..' || p.includes('\\') || p.includes('/') || p.includes('\0'))) return null;
  const base = path.join(runDirectory(id), kind === 'report' ? 'report' : 'artifacts');
  const full = path.resolve(base, ...parts);
  if (!full.startsWith(base + path.sep) || !fs.existsSync(full) || !fs.statSync(full).isFile()) return null;
  const ext = path.extname(full).toLowerCase();
  if (kind === 'evidence' && !allowedExtensions.has(ext)) return null;
  if (kind === 'report' && !new Set(['.html', '.js', '.css', '.json', '.png', '.svg', '.woff', '.woff2', '.webp', '.zip', '.map']).has(ext)) return null;
  return full;
}
module.exports = { launch, snapshot, list, read, evidence, artifactPath };
