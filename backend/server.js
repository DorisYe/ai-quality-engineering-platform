const express = require('express');
const crypto = require('node:crypto');
const database = require('./database');

const app = express();
app.use(express.json({ limit: '32kb' }));

const validSeverities = new Set(['Info', 'Warning', 'Critical']);
const requiredText = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 120;

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/events', (_req, res) => res.json(database.listEvents()));

app.get('/api/events/:id', (req, res) => {
  const event = database.getEvent(req.params.id);
  return event ? res.json(event) : res.status(404).json({ error: 'Event not found' });
});

app.post('/api/events', (req, res) => {
  const { type, severity, source } = req.body || {};
  if (!requiredText(type) || !requiredText(source) || !validSeverities.has(severity)) {
    return res.status(400).json({ error: 'type and source are required (up to 120 chars); severity must be Info, Warning, or Critical' });
  }
  const id = crypto.randomUUID();
  const event = database.createEvent({ id, type: type.trim(), severity, source: source.trim() });
  return res.status(201).json(event);
});

app.post('/api/events/:id/acknowledge', (req, res) => {
  const event = database.acknowledgeEvent(req.params.id);
  return event ? res.json(event) : res.status(404).json({ error: 'Event not found' });
});

app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  await database.initializeDatabase();
  const port = Number(process.env.PORT || 3100);
  app.listen(port, '127.0.0.1', () =>
    console.log(`Event API running at http://127.0.0.1:${port}`)
  );
}
start().catch(error => { console.error(error); process.exit(1); });
