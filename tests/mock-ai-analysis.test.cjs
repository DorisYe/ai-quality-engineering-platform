const test = require('node:test');
const assert = require('node:assert/strict');
const { mockAnalyze } = require('../portal/mock-ai-analysis');
test('offline mock clearly marked and never claims model analysis', () => {
 const result = mockAnalyze({testId:'FIXTURE-001'});
 assert.equal(result.source,'mock');
 assert.equal(result.model,'fixture-stub');
 assert.equal(result.requiresHumanReview,true);
 assert.match(result.hypothesis,/MOCK ONLY/);
});
