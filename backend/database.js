const fs = require('node:fs');
const path = require('node:path');
const initSqlJs = require('sql.js');

const databasePath = path.join(__dirname, '..', 'data', 'events.sqlite');
let db;

async function initializeDatabase() {
  const SQL = await initSqlJs();
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  db = fs.existsSync(databasePath)
    ? new SQL.Database(fs.readFileSync(databasePath))
    : new SQL.Database();
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    source TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TEXT NOT NULL
  )`);
  saveDatabase();
}

function saveDatabase() {
  const temporaryPath = databasePath + '.tmp';
  fs.writeFileSync(temporaryPath, Buffer.from(db.export()));
  fs.renameSync(temporaryPath, databasePath);
}

function queryOne(sql, params = []) {
  const statement = db.prepare(sql);
  try {
    statement.bind(params);
    return statement.step() ? statement.getAsObject() : null;
  } finally {
    statement.free();
  }
}

function queryAll(sql, params = []) {
  const statement = db.prepare(sql);
  const rows = [];
  try {
    statement.bind(params);
    while (statement.step()) rows.push(statement.getAsObject());
    return rows;
  } finally {
    statement.free();
  }
}

function createEvent(event) {
  db.run(
    'INSERT INTO events (id, type, severity, source, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [event.id, event.type, event.severity, event.source, 'Active', new Date().toISOString()]
  );
  saveDatabase();
  return getEvent(event.id);
}

function getEvent(id) {
  return queryOne('SELECT * FROM events WHERE id = ?', [id]);
}

function listEvents() {
  return queryAll('SELECT * FROM events ORDER BY created_at DESC');
}

function acknowledgeEvent(id) {
  const existing = getEvent(id);
  if (!existing) return null;
  db.run("UPDATE events SET status = 'Acknowledged' WHERE id = ?", [id]);
  saveDatabase();
  return getEvent(id);
}

module.exports = { initializeDatabase, createEvent, getEvent, listEvents, acknowledgeEvent };
