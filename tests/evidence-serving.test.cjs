const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const runner = require('../portal/test-runner');

const runId = crypto.randomUUID();
const folder = path.join(__dirname, '..', 'data', 'qa-results', runId);
test.before(() => {
  fs.mkdirSync(path.join(folder, 'report', 'data'), { recursive: true });
  fs.mkdirSync(path.join(folder, 'artifacts'), { recursive: true });
  fs.writeFileSync(path.join(folder, 'run.json'), JSON.stringify({ id: runId, startedAt: new Date().toISOString() }));
  fs.writeFileSync(path.join(folder, 'report', 'data', 'video.webm'), 'webm-test-fixture');
  fs.writeFileSync(path.join(folder, 'artifacts', 'video.webm'), 'webm-test-fixture');
  fs.writeFileSync(path.join(folder, 'report', 'data', 'secret.exe'), 'not-allowed');
});
test.after(() => { fs.rmSync(folder, { recursive: true, force: true }); });

test('Playwright HTML Report can resolve its video.webm asset', () => {
  assert.equal(runner.artifactPath(runId, 'report', ['data', 'video.webm']),
    path.join(folder, 'report', 'data', 'video.webm'));
});

test('Evidence endpoint continues to resolve its video.webm asset', () => {
  assert.equal(runner.artifactPath(runId, 'evidence', ['video.webm']),
    path.join(folder, 'artifacts', 'video.webm'));
});

test('File serving still rejects unsafe paths and unapproved extensions', () => {
  assert.equal(runner.artifactPath(runId, 'report', ['data', 'secret.exe']), null);
  assert.equal(runner.artifactPath(runId, 'report', ['..', 'run.json']), null);
  assert.equal(runner.artifactPath(runId, 'report', ['data', '..', 'run.json']), null);
  assert.equal(runner.artifactPath('invalid', 'report', ['data', 'video.webm']), null);
});
