// M4.3: Human review is stored separately from generated bug drafts.
// Drafts remain immutable and cannot be modified by the review API.
const fs = require('node:fs');
const path = require('node:path');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const decisions = new Set(['needs-investigation', 'confirmed-bug', 'not-a-bug']);
const severities = new Set(['unassigned', 'critical', 'high', 'medium', 'low']);
const priorities = new Set(['unassigned', 'p0', 'p1', 'p2', 'p3']);
const root = path.resolve(__dirname, '..', 'data', 'qa-results');
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

function draftFor(run, draftIndex) {
  if (!run || !uuid.test(run.id) || !/^[1-9]\d*$/.test(String(draftIndex))) return null;
  return run.bugDrafts?.drafts?.[Number(draftIndex) - 1] || null;
}
function reviewFile(runId) { return path.join(root, runId, 'reviews.json'); }
function getReviews(runId) {
  if (!uuid.test(runId)) return {};
  try {
    const value = JSON.parse(fs.readFileSync(reviewFile(runId), 'utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
function getReview(run, draftIndex) {
  const draft = draftFor(run, draftIndex);
  if (!draft) return null;
  return getReviews(run.id)[draft.id] || null;
}
function validateReview(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Invalid review payload' };
  const keys = ['title', 'expected', 'actual', 'stepsToReproduce', 'reviewStatus', 'triageDecision', 'severity', 'priority', 'reviewNotes', 'revision'];
  if (Object.keys(body).some(key => !keys.includes(key)) || keys.some(key => !hasOwn(body, key))) return { error: 'Incomplete or unrecognized review fields' };
  for (const [name,limit] of [['title',300],['expected',4000],['actual',4000],['reviewNotes',4000]]) {
    if (typeof body[name] !== 'string' || body[name].length > limit || (name === 'title' && !body[name].trim())) return { error: 'Invalid ' + name };
  }
  if (!Array.isArray(body.stepsToReproduce) || body.stepsToReproduce.length > 30 ||
    body.stepsToReproduce.some(step => typeof step !== 'string' || step.length > 1000)) return { error: 'Invalid reproduction steps' };
  if (!['needs-review','reviewed'].includes(body.reviewStatus) ||
    !decisions.has(body.triageDecision) || !severities.has(body.severity) ||
    !priorities.has(body.priority)) return { error: 'Invalid triage decision, severity, priority or review status' };
  if (body.reviewStatus === 'reviewed' && body.triageDecision === 'needs-investigation' && !body.reviewNotes.trim()) return { error: 'Review notes are required for an unresolved reviewed item' };
  if (!Number.isSafeInteger(body.revision) || body.revision < 0) return { error: 'Invalid revision' };
  return null;
}
function saveReview(run, index, body) {
  const draft = draftFor(run,index);
  if (!draft) return { error: 'Bug Draft not found', code: 404 };
  const invalid = validateReview(body);
  if (invalid) return { ...invalid, code: 400 };
  const all = getReviews(run.id);
  const previous = all[draft.id];
  const revision = previous?.revision || 0;
  if (revision !== body.revision) return { error: 'Review was updated elsewhere; reload before saving', code: 409 };
  const saved = {
    title: body.title.trim(), expected: body.expected, actual: body.actual,
    stepsToReproduce: body.stepsToReproduce,
    reviewStatus: body.reviewStatus, triageDecision: body.triageDecision,
    severity: body.severity, priority: body.priority, reviewNotes: body.reviewNotes,
    revision: revision + 1, updatedAt: new Date().toISOString()
  };
  all[draft.id] = saved;
  const file = reviewFile(run.id);
  fs.mkdirSync(path.dirname(file), { recursive:true });
  const temp = file + '.tmp-' + process.pid;
  try { fs.writeFileSync(temp, JSON.stringify(all,null,2), {flag:'wx'}); fs.renameSync(temp,file); }
  catch (error) { try { fs.unlinkSync(temp); } catch {} return { error:'Unable to persist review: '+error.message,code:500 }; }
  return { review:saved };
}
module.exports = { draftFor, getReview, saveReview, validateReview };
