// M4.2: Generate review-only defect drafts from M4.1 unexpected failures.
// This does not classify a product defect, infer root cause, or file a ticket.
const cases = require('./test-cases');
const caseById = new Map(cases.map(item => [item.id, item]));

function generateBugDrafts(failureDetection, runId, reportUrl, evidenceFiles = []) {
  if (!failureDetection || failureDetection.status !== 'available') {
    return { status: failureDetection?.status === 'excluded' ? 'excluded' : 'unavailable', drafts: [], count: 0 };
  }
  const drafts = (failureDetection.failures || []).map((failure, index) => {
    const spec = caseById.get(failure.testId);
    return {
      id: runId + ':' + (index + 1),
      reviewStatus: 'needs-review',
      title: '[QA Review] ' + failure.testId + ' — ' + (spec?.title || failure.title),
      testId: failure.testId,
      testTitle: failure.title,
      expected: spec?.expected || 'Expected behavior not available in Test Library; verify manually.',
      actual: failure.errorMessage || 'No failure details reported.',
      stepsToReproduce: spec?.steps || [],
      runId,
      reportUrl: reportUrl || null,
      // These are run-level evidence links, not guaranteed to belong to this exact test.
      evidenceScope: 'run-level',
      evidenceLinks: evidenceFiles.map(file => ({ name: file.name, url: file.url }))
    };
  });
  return { status: 'available', drafts, count: drafts.length };
}

module.exports = { generateBugDrafts };
