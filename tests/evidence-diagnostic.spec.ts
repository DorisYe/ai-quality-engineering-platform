import { test, expect } from '@playwright/test';

// Opt-in diagnostic intentionally fails. NEVER part of the normal regression suite.
// The Playwright config includes this file only when QA_EVIDENCE_CHECK=1.
test('DIAG-001: controlled failure captures browser evidence', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Event Monitoring Dashboard' })).toBeVisible();
  await page.getByRole('heading', { name: 'Event Monitoring Dashboard' }).screenshot({
    path: test.info().outputPath('diagnostic-step.png'),
  });
  await test.info().attach('Diagnostic screenshot', {
    path: test.info().outputPath('diagnostic-step.png'),
    contentType: 'image/png',
  });
  // This deliberately fails so screenshot/video/trace retention can be verified.
  expect('evidence-diagnostic').toBe('intentionally-not-equal');
});
