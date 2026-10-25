const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const cases = require('./test-cases');
const runner = require('./test-runner');
const { createStore } = require('./bug-review-store');
const { suggest } = require('./failure-triage');
const { analyze } = require('./ai-failure-analysis');
const { mockAnalyze } = require('./mock-ai-analysis');
const { preview, extractTrace } = require('./evidence-intelligence');
const { associateAssertion } = require('./assertion-trace-correlation');
const { mapEvidence } = require('./test-evidence-map');
const aiInProgress = new Set();
const reviews = createStore(path.join(__dirname, '..', 'data', 'qa-results'));
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '4kb' }));
app.use((req, res, next) => {
  if (!['POST', 'PATCH'].includes(req.method)) return next();
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

app.get('/api/runs/:id/bug-drafts', (req, res) => {
  const run = runner.read(req.params.id);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  return res.json({ drafts: reviews.list(req.params.id, runner.read, runner.evidence).map(draft => ({ ...draft, triageSuggestion: suggest(draft) })) });
});
app.post('/api/runs/:id/bug-drafts/:draftId/ai-analysis', async (req, res) => {
  const run = runner.read(req.params.id);
  if (!run) return res.status(404).json({error:'Run not found'});
  const draft = reviews.list(req.params.id, runner.read, runner.evidence).find(d => d.id === req.params.draftId);
  if (!draft) return res.status(404).json({error:'Bug draft not found'});
  if (process.env.QA_AI_MOCK === '1' && run.selection === 'fixture-review') {
    return res.json({ analysis: mockAnalyze(draft) });
  }
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({error:'AI disabled: configure OPENAI_API_KEY locally'});
  const key = req.params.id + ':' + req.params.draftId;
  if (aiInProgress.has(key)) return res.status(409).json({error:'Analysis already in progress'});
  aiInProgress.add(key);
  try {
    const analysis = await analyze(draft);
    return res.json({analysis});
  } catch (err) {
    return res.status(502).json({error:err.name === 'AbortError'?'AI request timed out':err.message});
  } finally { aiInProgress.delete(key); }
});
app.patch('/api/runs/:id/bug-drafts/:draftId', (req, res) => {
  const result = reviews.update(req.params.id, req.params.draftId, req.body, runner.read, runner.evidence);
  return result.error ? res.status(result.code).json({ error: result.error }) : res.json(result);
});
app.get('/api/runs/:id/evidence-preview', (req,res) => {
 const run=runner.read(req.params.id);
 if(!run)return res.status(404).json({error:'Run not found'});
 const items=runner.evidence(req.params.id);
 const result=preview(run,items);
 result.traceDiagnostics=[];
 const parsedTraces=[];
 result.timeline=[];
 result.failureCorrelations=[];
 for(const entry of items.filter(e=>e.name.toLowerCase().endsWith('.zip')).slice(0,2)) {
  const local=runner.artifactPath(req.params.id,'evidence',entry.name.split('/'));
  if(local){const parsed=extractTrace(local);parsedTraces.push(parsed);result.actions.push(...parsed.actions);result.timeline.push(...parsed.timeline);result.failureCorrelations.push(...parsed.correlations);result.traceDiagnostics.push({traceEntries:parsed.traceEntries,beforeEvents:parsed.beforeEvents,completedEvents:parsed.completedEvents,failedEvents:parsed.failedEvents,reason:parsed.reason});}
 }
 result.actions=result.actions.slice(0,40);
 result.timeline=result.timeline.slice(0,40);
 result.failureCorrelations=result.failureCorrelations.slice(0,10);
 result.correlationStatus=result.failureCorrelations.length?'trace-errors-found':result.traceDiagnostics.some(d=>d.failedEvents>0)?'error-without-matched-action':'no-matched-trace-failure';
 result.assertionTrace=associateAssertion(run,parsedTraces);
 try {
  const dataRoot=path.join(__dirname,'..','data','qa-results',req.params.id);
  const report=JSON.parse(fs.readFileSync(path.join(dataRoot,'results.json'),'utf8'));
  result.testEvidenceMap=mapEvidence(report,items,path.join(dataRoot,'artifacts'));
 } catch {
  result.testEvidenceMap={mapped:[],unmapped:[],source:'playwright-json-reporter',mappingMethod:'attachment-path',verifiedOwnership:false,reason:'Reporter data unavailable (possibly an older or synthetic run)'};
 }
 return res.json({preview:result});
});
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
app.post('/api/runs', (req, res) => {
  const selection = req.body && req.body.selection;
  const result = runner.launch(selection);
  return result.error ? res.status(result.code).json({ error: result.error }) : res.status(202).json(result);
});
app.use(express.static(path.join(__dirname, 'public')));
const port = Number(process.env.QA_PORT || 3200);
app.listen(port, '127.0.0.1', () => console.log('QA Portal (M4.4) running at http://127.0.0.1:' + port));
