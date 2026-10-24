const fs = require('node:fs');
const path = require('node:path');
const { createDrafts } = require('./bug-drafts');

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const allowedState = new Set(['draft', 'in_review', 'approved', 'rejected']);
const allowedPriority = new Set(['Unassigned', 'Low', 'Medium', 'High', 'Critical']);
const allowedCategory = new Set(['Unclassified test failure', 'Product defect', 'Test automation issue', 'Environment issue', 'Flaky test', 'Other']);
function createStore(root) {
  function fileFor(id) { return path.join(root, id, 'bug-draft-reviews.json'); }
  function candidates(id, readRun, getEvidence) {
    if (!uuid.test(id)) return null;
    const run = readRun(id);
    if (!run) return null;
    return createDrafts(run, getEvidence(id));
  }
  function readSaved(id) {
    try { const v = JSON.parse(fs.readFileSync(fileFor(id), 'utf8')); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
    catch { return {}; }
  }
  function list(id, readRun, getEvidence) {
    const base = candidates(id, readRun, getEvidence);
    if (!base) return null;
    const saved = readSaved(id);
    return base.map(d => ({ ...d, ...(saved[d.id] || {}) }));
  }
  function update(id, draftId, patch, readRun, getEvidence) {
    const base = candidates(id, readRun, getEvidence);
    if (!base) return { code: 404, error: 'Run not found' };
    const item = base.find(d => d.id === draftId);
    if (!item) return { code: 404, error: 'Bug draft not found' };
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { code: 400, error: 'Invalid body' };
    const keys = Object.keys(patch);
    if (!keys.length || keys.some(k => !['state', 'category', 'priority', 'reviewNotes'].includes(k))) return { code: 400, error: 'Unsupported fields' };
    if (patch.state !== undefined && !allowedState.has(patch.state)) return { code: 400, error: 'Invalid state' };
    if (patch.priority !== undefined && !allowedPriority.has(patch.priority)) return { code: 400, error: 'Invalid priority' };
    if (patch.category !== undefined && !allowedCategory.has(patch.category)) return { code: 400, error: 'Invalid category' };
    if (patch.reviewNotes !== undefined && (typeof patch.reviewNotes !== 'string' || patch.reviewNotes.length > 2000)) return { code: 400, error: 'Invalid notes' };
    const records = readSaved(id), previous = records[draftId] || {};
    const next = { ...previous, ...patch, reviewedAt: new Date().toISOString() };
    const nextState = next.state || 'draft';
    if (nextState === 'approved' && (!next.reviewNotes || !next.reviewNotes.trim() || next.category === 'Unclassified test failure' || !next.category)) {
      return { code: 400, error: 'Approval requires review notes and classification' };
    }
    records[draftId] = next;
    const target = fileFor(id), temp = target + '.tmp';
    fs.writeFileSync(temp, JSON.stringify(records, null, 2));
    fs.renameSync(temp, target);
    return { draft: { ...item, ...next } };
  }
  return { list, update };
}
module.exports = { createStore };
