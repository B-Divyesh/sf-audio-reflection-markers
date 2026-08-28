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
  await expect(page.locator('.marker-cue')).toContainText('What comes before more research?');
  await page.getByRole('button', { name: 'Review' }).click();
  await expect(page.getByText('What comes before more research?', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reveal my takeaway' }).click();
  await page.getByRole('button', { name: 'Remembered it' }).click();
  await expect(page.getByText('100% followed up')).toBeVisible();
  await page.getByRole('button', { name: 'Export markers' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download Markdown' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('reflection-markers.md');
  expect(errors).toEqual([]);
});

test('opens a local media file without uploading it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Use a local file' }).click();
  await page.getByLabel('Choose an audio or video file').setInputFiles({
    name: 'private-lecture.wav',
    mimeType: 'audio/wav',
    buffer: Buffer.from('RIFF0000WAVEfmt ')
  });
  await expect(page.getByText('private-lecture.wav')).toBeVisible();
  await expect(page.locator('#media-mount audio')).toBeVisible();
});

test('has no serious accessibility violations at the configured viewport', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('m');
  await expect(page.getByRole('dialog', { name: 'Mark this moment' })).toBeVisible();
  await page.keyboard.press('Escape');
  const results = await new AxeBuilder({ page }).analyze();
  const important = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(important).toEqual([]);
});

test('reloads the app while offline after its first visit', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Mark useful moments in audio');
  await expect(page.getByText('Working offline')).toBeVisible();
});

test('@claim:offline-reload works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Mark useful moments in audio' })).toBeVisible();
  await expect(page.getByText('Designing better questions — lecture').first()).toBeVisible();
  await expect(page.getByText('Working offline')).toBeVisible();
});

test('@claim:demo-isolation demo data is separate and resettable', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('reflection-markers', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('markers', { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = database.transaction('markers', 'readwrite');
    transaction.objectStore('markers').put({
      id: 'real-marker', createdAt: '2026-08-28T00:00:00.000Z', updatedAt: '2026-08-28T00:00:00.000Z', seconds: 15,
      takeaway: 'Real marker must stay out of demo.', cue: '', actionDate: '', reviews: [],
      source: { kind: 'manual', title: 'Private listening session', reference: '' }
    });
    await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
  });
  await page.goto('/?demo=1');
  await expect(page.getByLabel('Demo mode')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.getByText('Real marker must stay out of demo.')).toHaveCount(0);
  await expect(page.getByText('Name the decision before collecting more options.')).toBeVisible();
  await page.getByRole('button', { name: 'Mark this moment' }).click();
  await page.getByLabel('My takeaway').fill('Temporary demo change.');
  await page.getByRole('button', { name: 'Save marker' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Temporary demo change.')).toHaveCount(0);
  await page.goto('/');
  await expect(page.getByText('Real marker must stay out of demo.')).toBeVisible();
});

test('@claim:local-only marker actions make only same-origin requests', async ({ page }) => {
  const requests: Array<{ url: string; method: string }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method() }));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Mark this moment' }).click();
  await page.getByLabel('My takeaway').fill('Keep the next step visible.');
  await page.getByRole('button', { name: 'Save marker' }).click();
  expect(requests.every((request) => new URL(request.url).origin === 'http://127.0.0.1:4173' && request.method === 'GET')).toBe(true);
  expect(await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name))).toContain('demo:reflection-markers');
});

test('@claim:reference-only-manual-timer saves links only as references and uses a manual timer', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo');
  await page.getByLabel('Episode or lecture link').fill('https://example.com/episode');
  await page.getByRole('button', { name: 'Set source' }).click();
  await expect(page.getByRole('link', { name: 'Open source ↗' })).toHaveAttribute('href', 'https://example.com/episode');
  await page.getByRole('button', { name: 'Go forward 15 seconds' }).click();
  await expect(page.locator('#current-time')).toHaveText('00:15');
  expect(requests.some((url) => new URL(url).origin === 'https://example.com')).toBe(false);
});

test('@claim:local-file-no-upload opens a local media file without an upload request', async ({ page }) => {
  const requests: Array<{ url: string; method: string }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method() }));
  await page.goto('/demo');
  await page.getByRole('tab', { name: 'Use a local file' }).click();
  await page.getByLabel('Choose an audio or video file').setInputFiles({ name: 'sample-lecture.wav', mimeType: 'audio/wav', buffer: Buffer.from('RIFF0000WAVEfmt ') });
  await expect(page.locator('#media-mount audio')).toBeVisible();
  expect(requests.every((request) => new URL(request.url).origin === 'http://127.0.0.1:4173' && request.method === 'GET')).toBe(true);
});

test('@claim:no-account-or-analytics demo needs no account and loads no third-party tracker', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: 'Mark this moment' })).toBeEnabled();
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  await expect(page.locator('input[type="password"], [name*="login" i], [name*="account" i]')).toHaveCount(0);
});

test('@claim:no-payment-or-account demo has no payment or account step', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.getByRole('button', { name: 'Mark this moment' })).toBeEnabled();
  await expect(page.locator('input[type="password"], form[action*="checkout" i]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /pay|subscribe|upgrade/i })).toHaveCount(0);
});

test('invalid backup gives a recovery message without a console error', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Data' }).click();
  await page.getByLabel('Import JSON backup').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{not json') });
  await expect(page.getByText('That file is not a valid backup. Nothing was changed.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('shows a designed 404 response for an unknown route', async ({ page }) => {
  const response = await page.goto('/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Audio Reflection Markers');
  await expect(page.getByRole('heading', { name: 'This page is not here' })).toBeVisible();
});

test('keeps a real 404 after the service worker controls the page', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const response = await page.goto('/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'This page is not here' })).toBeVisible();
});

test('sets page titles, metadata, legal links, and demo focus for each route', async ({ page, request }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Audio Reflection Markers');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'http://127.0.0.1:4173/demo');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Demo — Audio Reflection Markers');
  await expect(page.locator('#page-title')).toBeFocused();
  for (const route of ['/privacy/', '/terms/']) {
    await page.goto(route);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(route.replace('/', '\\/')));
    await expect(page.getByRole('link', { name: 'Privacy' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Terms' }).first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  }
  for (const route of ['/sitemap.xml', '/social-card.svg']) expect((await request.get(route)).ok()).toBe(true);
});

test('precache URLs exist on a strict host and deployment policies are present', async ({ request }) => {
  const worker = await request.get('/sw.js');
  expect(worker.ok()).toBe(true);
  expect(worker.headers()['cache-control']).toBe('no-cache');
  const source = await worker.text();
  const match = source.match(/const PRECACHE=(\[[^;]+\])/);
  expect(match).not.toBeNull();
  const precache = JSON.parse(match![1]) as string[];
  for (const url of precache) {
    const response = await request.get(url);
    expect(response.status(), `${url} must be deployable`).toBe(200);
    if (url.endsWith('.js')) expect(response.headers()['content-type']).toContain('text/javascript');
  }

  const asset = await request.get(precache.find((url) => url.startsWith('/assets/') && url.endsWith('.js'))!);
  expect(asset.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.headers()['content-type']).toContain('application/manifest+json');
  const root = await request.get('/');
  expect(root.headers()['content-security-policy']).toContain("default-src 'self'");
  expect(root.headers()['permissions-policy']).toContain('microphone=(self)');
});
