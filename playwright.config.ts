import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  expect: { timeout: 12000 },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ...(process.env.QA_RUN_JSON ? [['json', { outputFile: process.env.QA_RUN_JSON }] as const] : []),
  ],
  use: {
    baseURL: 'http://127.0.0.1:3100',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'node backend/server.js',
    url: 'http://127.0.0.1:3100/health',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
