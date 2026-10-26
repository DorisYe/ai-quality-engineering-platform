// Deterministic mock used ONLY for explicit synthetic review fixtures.
// No network calls, keys, or claims of actual AI reasoning.
function mockAnalyze(draft) {
  return {
    source: 'mock',
    model: 'fixture-stub',
    suggestedCategory: 'Unclassified test failure',
    hypothesis: 'MOCK ONLY: The simulated UI status mismatch could indicate stale state; this is not a model inference.',
    nextCheck: 'MOCK ONLY: Inspect a simulated acknowledgement API response and compare UI status.',
    confidence: 'not-applicable',
    requiresHumanReview: true
  };
}
module.exports = { mockAnalyze };
