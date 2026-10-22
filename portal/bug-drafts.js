// Read-only, deterministic bug draft generation. No external issue creation.
function createDrafts(run, evidence = []) {
  if (!run || run.status === 'running' || run.selection === 'evidence-check') return [];
  return (run.summary?.tests || []).filter(test => test.status === 'unexpected').map((test, index) => {
    const attachments = evidence.filter(item => item && typeof item.url === 'string');
    return {
      id: run.id + ':' + index,
      runId: run.id,
      testId: test.id,
      title: '[QA][Draft] ' + test.id + ': ' + test.title,
      state: 'draft',
      category: 'Unclassified test failure',
      classification: 'Needs QA triage — test failure does not prove product defect',
      priority: 'Unassigned',
      actualResult: test.error || 'Playwright marked this test unexpected; inspect the HTML report.',
      expectedResult: 'The automated test assertions should pass. Confirm the intended product behavior during triage.',
      reproductionSteps: [
        'Open the associated Playwright HTML Report.',
        'Inspect the failed test "' + test.title + '" and its recorded actions.',
        'Reproduce the scenario manually before filing a defect.'
      ],
      evidence: attachments,
      reportUrl: run.reportUrl || null,
      generatedAt: run.finishedAt || null
    };
  });
}
module.exports = { createDrafts };
