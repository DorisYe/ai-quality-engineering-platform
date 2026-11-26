const express = require('express');
const path = require('node:path');
const cases = require('./test-cases');
const runner = require('./test-runner');
const bugReview = require('./bug-review');
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use((req, res, next) => {
  if (!['POST','PUT'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin && origin !== 'http://127.0.0.1:' + (process.env.QA_PORT || 3200)) return res.status(403).json({ error: 'Cross-origin requests are not allowed' });
  next();
});
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'qa-portal' }));
app.get('/api/test-cases', (_req, res) => res.json(cases));
app.get('/api/test-cases/:id', (req, res) => {
  const item = cases.find(testCase => testCase.id === req.params.id);
  return item ? res.json(item) : res.status(404).json({ error: 'Test case not found' });
});
app.get('/api/runs', (_req, res) => res.json({ runs: runner.list() }));

app.get('/api/runs/:id/evidence', (req, res) => res.json({evidence: runner.evidence(req.params.id)}));
app.get(/^\/api\/runs\/([0-9a-f-]+)\/(report|evidence)\/(.+)$/i, (req, res) => {
  const file = runner.artifactPath(req.params[0], req.params[1], req.params[2].split('/'));
  if (!file) return res.status(404).end();
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' data: blob:; connect-src 'self'; object-src 'none'");
  res.sendFile(file);
});
app.get('/api/runs/current', (_req, res) => res.json({ run: runner.snapshot() }));
app.get('/api/runs/:id', (req, res) => { const run = runner.read(req.params.id); return run ? res.json({run}) : res.status(404).json({error:'Run not found'}); });
// Human reviews are separate from generated run.json drafts.
app.get('/api/runs/:id/drafts/:index/review', (req, res) => {
  const run = runner.read(req.params.id);
  if (!bugReview.draftFor(run, req.params.index)) return res.status(404).json({ error:'Bug Draft not found' });
  return res.json({ review:bugReview.getReview(run, req.params.index) });
});
app.put('/api/runs/:id/drafts/:index/review', (req, res) => {
  const run = runner.read(req.params.id);
  const outcome = bugReview.saveReview(run, req.params.index, req.body);
  return outcome.error ? res.status(outcome.code).json({ error:outcome.error }) : res.json(outcome);
});
app.post('/api/runs', (req, res) => {
  const selection = req.body && req.body.selection;
  const result = runner.launch(selection);
  return result.error ? res.status(result.code).json({ error: result.error }) : res.status(202).json(result);
});
app.use(express.static(path.join(__dirname, 'public')));
const port = Number(process.env.QA_PORT || 3200);
app.listen(port, '127.0.0.1', () => console.log('QA Portal running at http://127.0.0.1:' + port));
