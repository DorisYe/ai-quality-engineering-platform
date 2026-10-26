// Advisory triage hints only. These are deterministic rules, NOT AI or confirmed root causes.
function suggest(test) {
  const error = String(test?.actualResult || test?.error || '').slice(0, 5000);
  const checks = [
    { pattern: /timeout|timed out|waiting for/i, category: 'Flaky test', reason: 'Timeout symptoms; investigate timing and application readiness.' },
    { pattern: /ECONNREFUSED|EADDRINUSE|net::ERR_|webserver/i, category: 'Environment issue', reason: 'Connectivity or service startup symptoms.' },
    { pattern: /strict mode violation|locator|element is not attached/i, category: 'Test automation issue', reason: 'Locator or test script issue may be involved.' },
    { pattern: /expected.*received|toHaveText|toContainText|toBeVisible/i, category: 'Unclassified test failure', reason: 'Assertion mismatch; compare actual behavior to requirements.' }
  ];
  const found = checks.find(rule => rule.pattern.test(error));
  return {
    suggestedCategory: found?.category || 'Unclassified test failure',
    rationale: found?.reason || 'Insufficient evidence to suggest a likely category.',
    confidence: 'low',
    source: 'rule-based',
    requiresHumanReview: true
  };
}
module.exports = { suggest };
