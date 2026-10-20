const express = require('express');
const path = require('node:path');
const cases = require('./test-cases');
const app = express();
app.disable('x-powered-by');
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'qa-portal' }));
app.get('/api/test-cases', (_req, res) => res.json(cases));
app.get('/api/test-cases/:id', (req, res) => {
  const item = cases.find(testCase => testCase.id === req.params.id);
  return item ? res.json(item) : res.status(404).json({ error: 'Test case not found' });
});
app.use(express.static(path.join(__dirname, 'public')));
const port = Number(process.env.QA_PORT || 3200);
app.listen(port, '127.0.0.1', () => console.log('QA Portal (M3.1) running at http://127.0.0.1:' + port));
