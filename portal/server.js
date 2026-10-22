const express = require('express');
const path = require('node:path');
const cases = require('./test-cases');
const runner = require('./test-runner');
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '4kb' }));
app.use((req, res, next) => {
  if (req.method !== 'POST') return next();
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
app.get('/api/runs/current', (_req, res) => res.json({ run: runner.snapshot() }));
app.post('/api/runs', (req, res) => {
  const selection = req.body && req.body.selection;
  const result = runner.launch(selection);
  return result.error ? res.status(result.code).json({ error: result.error }) : res.status(202).json(result);
});
app.use(express.static(path.join(__dirname, 'public')));
const port = Number(process.env.QA_PORT || 3200);
app.listen(port, '127.0.0.1', () => console.log('QA Portal (M3.2) running at http://127.0.0.1:' + port));
