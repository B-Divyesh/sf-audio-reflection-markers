import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('captures, recalls, and persists a marker', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await page.getByLabel('Episode or lecture link').fill('https://example.com/episode');
  await page.getByLabel('Title optional').fill('A useful episode');
  await page.getByRole('button', { name: 'Set source' }).click();
  await page.getByRole('button', { name: 'Go forward 15 seconds' }).click();
  await page.getByRole('button', { name: 'Mark this moment' }).click();
  await page.getByLabel('My takeaway').fill('Name the decision before collecting more options.');
  await page.getByLabel('Future recall cue optional').fill('What comes before more research?');
  await page.getByRole('button', { name: 'Save marker' }).click();
  await expect(page.getByRole('heading', { name: 'Name the decision before collecting more options.' })).toBeVisible();
  await page.reload();
  await expect(page.getByText('What comes before more research?')).toBeVisible();
  await page.getByRole('button', { name: 'Review' }).click();
  await expect(page.getByText('What comes before more research?')).toBeVisible();
  await page.getByRole('button', { name: 'Reveal my takeaway' }).click();
  await page.getByRole('button', { name: 'Remembered it' }).click();
  await expect(page.getByText('100% followed up')).toBeVisible();
  expect(errors).toEqual([]);
});

test('has no serious accessibility violations at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  const important = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(important).toEqual([]);
});

test('reloads the app while offline after its first visit', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Keep the moment');
  await expect(page.getByText('Working offline')).toBeVisible();
});
