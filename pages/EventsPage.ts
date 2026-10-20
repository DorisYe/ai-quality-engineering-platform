import { expect, type Locator, type Page } from '@playwright/test';

export class EventsPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Event Monitoring Dashboard' })).toBeVisible();
  }

  row(eventId: string): Locator {
    return this.page.locator('#event-list tr').filter({ has: this.page.locator('td').filter({ hasText: eventId }) });
  }

  async expectEvent(eventId: string) {
    await expect(this.row(eventId)).toBeVisible({ timeout: 15000 });
  }

  async acknowledge(eventId: string) {
    await this.row(eventId).getByRole('button', { name: 'Acknowledge event ' + eventId }).click();
  }

  async filterSeverity(value: string) {
    await this.page.locator('#severity-filter').selectOption(value);
  }

  async filterStatus(value: string) {
    await this.page.locator('#status-filter').selectOption(value);
  }

  get visibleRows(): Locator {
    return this.page.locator('#event-list tr[data-event-id]');
  }
}
