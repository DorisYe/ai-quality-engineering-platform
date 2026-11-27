import { test, expect, type APIRequestContext } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { EventsPage } from '../pages/EventsPage';

const execFileAsync = promisify(execFile);
type EventRecord = {
  id: string; type: string; severity: string; source: string;
  status: string; created_at: string;
};

async function generateFromScript(source: string): Promise<void> {
  if (process.platform === 'win32') {
    await execFileAsync('powershell.exe', [
      '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
      join(process.cwd(), 'scripts', 'generate-event.ps1'),
      '-Type', 'StorageCapacityWarning', '-Severity', 'Warning', '-Source', source,
    ], { timeout: 15000 });
  } else {
    await execFileAsync('bash', [
      join(process.cwd(), 'scripts', 'generate-event.sh'),
      'StorageCapacityWarning', 'Warning', source,
    ], { timeout: 15000 });
  }
}

async function createEvent(request: APIRequestContext, severity = 'Warning', source = 'AutomationTest'): Promise<EventRecord> {
  const response = await request.post('/api/events', {
    data: { type: 'StorageCapacityWarning', severity, source },
  });
  expect(response.status()).toBe(201);
  return response.json() as Promise<EventRecord>;
}

test('TC-001: script-generated event is processed and displayed in the UI', async ({ page, request }) => {
  const dashboard = new EventsPage(page);
  await dashboard.open();
  const source = 'Playwright-' + randomUUID();
  await generateFromScript(source);
  // The script returns an event ID; look it up via the real backend API.
  let created: EventRecord | undefined;
  await expect.poll(async () => {
    const response = await request.get('/api/events');
    const events = await response.json() as EventRecord[];
    created = events.find(item => item.source === source);
    return created?.status;
  }, { timeout: 15000 }).toBe('Active');
  await dashboard.expectEvent(created!.id);
});

test('TC-002: UI event details match backend record', async ({ page, request }) => {
  const expected = await createEvent(request, 'Critical', 'DetailsVerification');
  const dashboard = new EventsPage(page);
  await dashboard.open();
  const row = dashboard.row(expected.id);
  await expect(row).toBeVisible();
  await expect(row).toContainText(expected.type);
  await expect(row).toContainText(expected.severity);
  await expect(row).toContainText(expected.source);
  await expect(row).toContainText(expected.status);
});

test('TC-003: UI acknowledgement updates backend status', async ({ page, request }) => {
  const created = await createEvent(request);
  const dashboard = new EventsPage(page);
  await dashboard.open();
  await dashboard.expectEvent(created.id);
  await dashboard.acknowledge(created.id);
  await expect(dashboard.row(created.id)).toContainText('Acknowledged');
  await expect.poll(async () => {
    const response = await request.get('/api/events/' + created.id);
    return ((await response.json()) as EventRecord).status;
  }).toBe('Acknowledged');
});

test('TC-004: severity and status filters show matching events', async ({ page, request }) => {
  const critical = await createEvent(request, 'Critical', 'FilterCritical');
  const warning = await createEvent(request, 'Warning', 'FilterWarning');
  const dashboard = new EventsPage(page);
  await dashboard.open();
  await dashboard.expectEvent(critical.id);
  await dashboard.expectEvent(warning.id);
  await dashboard.filterSeverity('Critical');
  await dashboard.filterStatus('Active');
  await expect(dashboard.row(critical.id)).toBeVisible();
  await expect(dashboard.row(warning.id)).toHaveCount(0);
  const rows = dashboard.visibleRows;
  await expect.poll(() => rows.count()).toBeGreaterThan(0);
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    await expect(rows.nth(i).locator('td').nth(2)).toHaveText('Critical');
    await expect(rows.nth(i).locator('td').nth(4)).toHaveText('Active');
  }
  // Verify the combined filter responds when an event changes status.
  await dashboard.acknowledge(critical.id);
  await expect(dashboard.row(critical.id)).toHaveCount(0);
  await dashboard.filterStatus('Acknowledged');
  await expect(dashboard.row(critical.id)).toBeVisible();
  await expect(dashboard.row(critical.id).locator('td').nth(4)).toHaveText('Acknowledged');
  await expect(dashboard.row(warning.id)).toHaveCount(0);
});

test('TC-005: invalid event payload is rejected without being stored', async ({ request }) => {
  const uniqueSource = 'Invalid-' + randomUUID();
  const response = await request.post('/api/events', {
    data: { type: 'BadEvent', severity: 'Unknown', source: uniqueSource },
  });
  expect(response.status()).toBe(400);
  const eventsResponse = await request.get('/api/events');
  expect(eventsResponse.ok()).toBeTruthy();
  const events = await eventsResponse.json() as EventRecord[];
  expect(events.find(event => event.source === uniqueSource)).toBeUndefined();
});

/**
 * TC-006 — CONTROLLED DEMO DEFECT (intentionally failing)
 * Reset Filters should restore BOTH dropdowns to All.
 * The AUT deliberately resets only Severity so the QA Portal can demonstrate
 * Failure Detection -> Bug Draft -> Human Review -> Export with real evidence.
 * This is a known demo failure, not an unexpected production regression.
 */
test('TC-006: Reset Filters restores Severity and Status to All', async ({ page, request }) => {
  const critical = await createEvent(request, 'Critical', 'DemoResetCritical');
  const acknowledged = await createEvent(request, 'Warning', 'DemoResetAcknowledged');
  const acknowledgement = await request.post('/api/events/' + acknowledged.id + '/acknowledge');
  expect(acknowledgement.ok()).toBeTruthy();

  const dashboard = new EventsPage(page);
  await dashboard.open();
  await dashboard.expectEvent(critical.id);
  await dashboard.expectEvent(acknowledged.id);

  await dashboard.filterSeverity('Critical');
  await dashboard.filterStatus('Active');
  await expect(dashboard.row(critical.id)).toBeVisible();
  await expect(dashboard.row(acknowledged.id)).toHaveCount(0);

  await dashboard.resetFilters();
  await expect(dashboard.severityFilter).toHaveValue('All');
  // Expected failure: AUT leaves Status as 'Active', rather than 'All'.
  await expect(dashboard.statusFilter).toHaveValue('All');
  await expect(dashboard.row(acknowledged.id)).toBeVisible();
});
