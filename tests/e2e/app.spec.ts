import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const fixtureMedia = { name: 'sample-lecture.wav', mimeType: 'audio/wav', buffer: Buffer.from('RIFF0000WAVEfmt ') };

async function installFixtureRecorder(page: import('@playwright/test').Page): Promise<void> {
  await page.addInitScript(() => {
    class FixtureRecorder {
      state = 'inactive';
      mimeType = 'audio/webm';
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      start(): void { this.state = 'recording'; }
      stop(): void {
        this.state = 'inactive';
        this.ondataavailable?.({ data: new Blob(['fixture voice note'], { type: this.mimeType }) });
        this.onstop?.();
      }
    }
    Object.defineProperty(window, 'MediaRecorder', { configurable: true, value: FixtureRecorder });
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async () => ({ getTracks: () => [{ stop: () => undefined }] }) }
    });
  });
}

async function demoRecords(page: import('@playwright/test').Page): Promise<Array<Record<string, unknown>>> {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('demo:reflection-markers', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return new Promise((resolve, reject) => {
      const request = database.transaction('markers').objectStore('markers').getAll();
      request.onsuccess = () => resolve(request.result as Array<Record<string, unknown>>);
      request.onerror = () => reject(request.error);
    });
  });
}

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
  await expect(page.getByRole('heading', { name: 'Try two saved lecture markers' })).toBeVisible();
  await expect(page.getByText('Designing better questions — lecture').first()).toBeVisible();
  await expect(page.getByText('Working offline')).toBeVisible();
});

test('demo opens with a complete sample marker in the phone viewport', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 390, 'mobile presentation assertion');
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  const takeaway = page.getByRole('heading', { name: 'Name the decision before collecting more options.' });
  const cue = page.getByText('What decision is this research meant to support?');
  await expect(takeaway).toBeVisible();
  await expect(cue).toBeVisible();
  const [takeawayBox, cueBox] = await Promise.all([takeaway.boundingBox(), cue.boundingBox()]);
  expect(takeawayBox!.y + takeawayBox!.height).toBeLessThanOrEqual(844);
  expect(cueBox!.y + cueBox!.height).toBeLessThanOrEqual(844);
  await expect(page.getByRole('button', { name: 'Review' }).first()).toBeInViewport();
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
  await page.getByRole('button', { name: 'Mark this moment' }).click();
  await page.getByLabel('My takeaway').fill('Discard this demo change.');
  await page.getByRole('button', { name: 'Save marker' }).click();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByText('Real marker must stay out of demo.')).toBeVisible();
  await page.goto('/demo/');
  await expect(page.getByText('Discard this demo change.')).toHaveCount(0);
});

test('@claim:local-only marker actions make only same-origin requests', async ({ page }) => {
  const requests: Array<{ url: string; method: string }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method() }));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Mark this moment' }).click();
  await page.getByLabel('My takeaway').fill('Keep the next step visible.');
  await page.getByRole('button', { name: 'Save marker' }).click();
  await expect(page.getByRole('heading', { name: 'Keep the next step visible.' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Keep the next step visible.' })).toBeVisible();
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
  await page.reload();
  await expect(page.getByRole('link', { name: 'Open source ↗' })).toHaveAttribute('href', 'https://example.com/episode');
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

test('@claim:capture-marker captures a timestamp and typed takeaway', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Go forward 15 seconds' }).click();
  await page.getByRole('button', { name: 'Mark this moment' }).click();
  await page.getByLabel('My takeaway').fill('Write the decision before opening another tab.');
  await page.getByRole('button', { name: 'Save marker' }).click();
  const card = page.locator('.marker-card').filter({ hasText: 'Write the decision before opening another tab.' });
  await expect(card).toContainText('12:49');
  await expect(card.getByRole('heading')).toHaveText('Write the decision before opening another tab.');
});

test('@claim:local-voice-note stores a playable fixture voice note only in demo storage', async ({ page }) => {
  await installFixtureRecorder(page);
  const requests: Array<{ url: string; method: string }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method() }));
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Mark this moment' }).click();
  await page.getByRole('button', { name: 'Record' }).click();
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await expect(page.locator('#voice-preview')).toBeVisible();
  await page.getByRole('button', { name: 'Save marker' }).click();
  await expect(page.locator('.marker-card audio')).toBeVisible();
  expect(await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open('demo:reflection-markers', 1);
      request.onsuccess = () => resolve(request.result);
    });
    return new Promise<boolean>((resolve) => {
      const request = database.transaction('markers').objectStore('markers').getAll();
      request.onsuccess = () => resolve(request.result.some((record: { voice?: Blob }) => record.voice instanceof Blob && record.voice.size > 0));
    });
  })).toBe(true);
  expect((await page.evaluate(() => indexedDB.databases())).map((item) => item.name)).not.toContain('reflection-markers');
  expect(requests.every((request) => new URL(request.url).origin === 'http://127.0.0.1:4173' && request.method === 'GET')).toBe(true);
});

test('@claim:recall-cue-and-date saves a cue and check date', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Mark this moment' }).click();
  await page.getByLabel('My takeaway').fill('Choose the smallest reversible test.');
  await page.getByLabel('Future recall cue optional').fill('What can I test before Friday?');
  await page.getByLabel('Check again optional').fill('2027-09-03');
  await page.getByRole('button', { name: 'Save marker' }).click();
  const card = page.locator('.marker-card').filter({ hasText: 'Choose the smallest reversible test.' });
  await expect(card).toContainText('What can I test before Friday?');
  const saved = (await demoRecords(page)).find((record) => record.takeaway === 'Choose the smallest reversible test.');
  expect(saved).toMatchObject({ cue: 'What can I test before Friday?', actionDate: '2027-09-03' });
});

test('@claim:reveal-first-review hides the takeaway and records the result', async ({ page }) => {
  await page.goto('/demo/');
  const before = (await demoRecords(page)).find((record) => record.id === 'demo-lecture-bridge')!;
  await page.locator('[data-id="demo-lecture-bridge"]').getByRole('button', { name: 'Review' }).click();
  await expect(page.locator('#review-answer')).toBeHidden();
  await expect(page.locator('#review-cue')).toHaveText('What decision is this research meant to support?');
  await page.getByRole('button', { name: 'Reveal my takeaway' }).click();
  await expect(page.locator('#review-takeaway')).toHaveText('Name the decision before collecting more options.');
  await page.getByRole('button', { name: 'Remembered it' }).click();
  const after = (await demoRecords(page)).find((record) => record.id === 'demo-lecture-bridge')!;
  expect((after.reviews as unknown[]).length).toBe((before.reviews as unknown[]).length + 1);
  expect((after.reviews as Array<{ result: string }>).at(-1)?.result).toBe('remembered');
});

test('@claim:marker-export downloads complete Markdown, CSV, and JSON', async ({ page }) => {
  await installFixtureRecorder(page);
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Mark this moment' }).click();
  await page.getByRole('button', { name: 'Record' }).click();
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await page.getByRole('button', { name: 'Save marker' }).click();
  const exported: Record<string, string> = {};
  for (const [button, filename] of [['Download Markdown', 'reflection-markers.md'], ['Download CSV', 'reflection-markers.csv']] as const) {
    await page.getByRole('button', { name: 'Export markers' }).click();
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: button }).click();
    const download = await pending;
    expect(download.suggestedFilename()).toBe(filename);
    exported[filename] = await readFile((await download.path())!, 'utf8');
  }
  await page.getByRole('button', { name: 'Manage marker data' }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download JSON backup' }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('reflection-markers-backup.json');
  exported.json = await readFile((await download.path())!, 'utf8');
  expect(exported['reflection-markers.md']).toContain('Name the decision before collecting more options.');
  expect(exported['reflection-markers.csv'].trim().split('\n')).toHaveLength(4);
  const jsonMarkers = JSON.parse(exported.json).markers as Array<Record<string, unknown>>;
  expect(jsonMarkers).toHaveLength(3);
  expect(jsonMarkers).toContainEqual(expect.objectContaining({
    id: 'demo-lecture-bridge', seconds: 754,
    takeaway: 'Name the decision before collecting more options.',
    cue: 'What decision is this research meant to support?', actionDate: '2026-09-03'
  }));
  expect(jsonMarkers.some((marker) => typeof (marker.voice as { data?: string } | undefined)?.data === 'string')).toBe(true);
});

test('@claim:backup-import replaces only demo markers from a valid backup', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Manage marker data' }).click();
  page.once('dialog', (dialog) => dialog.accept());
  const backup = {
    product: 'audio-reflection-markers', version: 1, exportedAt: '2026-08-29T00:00:00.000Z',
    markers: [{ id: 'imported-demo', createdAt: '2026-08-29T00:00:00.000Z', updatedAt: '2026-08-29T00:00:00.000Z', seconds: 42,
      takeaway: 'Imported marker stays inside the demo.', cue: 'What stayed isolated?', actionDate: '', reviews: [],
      source: { kind: 'manual', title: 'Imported fixture', reference: '' } }]
  };
  await page.getByLabel('Import JSON backup').setInputFiles({ name: 'valid.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.getByRole('heading', { name: 'Imported marker stays inside the demo.' })).toBeVisible();
  expect((await demoRecords(page)).map((record) => record.id)).toEqual(['imported-demo']);
  expect((await page.evaluate(() => indexedDB.databases())).map((item) => item.name)).not.toContain('reflection-markers');
});

test('@claim:voice-unavailable-typed-fallback saves typed text without voice support', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'MediaRecorder', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined });
  });
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Mark this moment' }).click();
  await page.getByRole('button', { name: 'Record' }).click();
  await expect(page.getByText('Voice recording is not supported here. You can still type your takeaway.')).toBeVisible();
  await page.getByLabel('My takeaway').fill('Typed notes still work without microphone support.');
  await page.getByRole('button', { name: 'Save marker' }).click();
  await expect(page.getByRole('heading', { name: 'Typed notes still work without microphone support.' })).toBeVisible();
});

test('@claim:no-remote-media-processing sends no media to another origin', async ({ page }) => {
  await installFixtureRecorder(page);
  const requests: Array<{ url: string; method: string }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method() }));
  await page.goto('/demo/');
  await page.getByRole('tab', { name: 'Use a local file' }).click();
  await page.getByLabel('Choose an audio or video file').setInputFiles(fixtureMedia);
  await page.getByRole('button', { name: 'Mark this moment' }).click();
  await page.getByRole('button', { name: 'Record' }).click();
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await page.getByRole('button', { name: 'Save marker' }).click();
  expect(requests.every((request) => new URL(request.url).origin === 'http://127.0.0.1:4173' && request.method === 'GET')).toBe(true);
});

test('@claim:local-file-session-only does not restore a selected file after reload', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('tab', { name: 'Use a local file' }).click();
  await page.getByLabel('Choose an audio or video file').setInputFiles(fixtureMedia);
  await expect(page.getByText('sample-lecture.wav')).toBeVisible();
  await page.reload();
  await expect(page.getByText('sample-lecture.wav')).toHaveCount(0);
  await expect(page.locator('#media-mount audio, #media-mount video')).toHaveCount(0);
  expect(await page.evaluate(() => Object.values(localStorage).join(' '))).not.toContain('sample-lecture.wav');
});

test('@claim:microphone-on-action requests microphone access only after Record', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async () => {
        const fixtureWindow = window as typeof window & { fixtureMicCalls?: number };
        fixtureWindow.fixtureMicCalls = (fixtureWindow.fixtureMicCalls ?? 0) + 1;
        throw new Error('fixture denial');
      } }
    });
  });
  await page.goto('/demo/');
  expect(await page.evaluate(() => (window as typeof window & { fixtureMicCalls?: number }).fixtureMicCalls ?? 0)).toBe(0);
  await page.getByRole('button', { name: 'Mark this moment' }).click();
  expect(await page.evaluate(() => (window as typeof window & { fixtureMicCalls?: number }).fixtureMicCalls ?? 0)).toBe(0);
  await page.getByRole('button', { name: 'Record' }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { fixtureMicCalls?: number }).fixtureMicCalls ?? 0)).toBe(1);
});

test('@claim:delete-all-markers removes every marker after confirmation', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Manage marker data' }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete all local markers' }).click();
  await expect(page.getByRole('heading', { name: 'Save your first marker' })).toBeVisible();
  expect(await demoRecords(page)).toHaveLength(0);
});

test('@claim:no-media-copying-or-sharing provides references and local playback without media transfer tools', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo/');
  await page.getByRole('tab', { name: 'Use a local file' }).click();
  await page.getByLabel('Choose an audio or video file').setInputFiles(fixtureMedia);
  await expect(page.locator('#media-mount audio')).toBeVisible();
  await expect(page.getByRole('button', { name: /transcribe|download audio|share clip/i })).toHaveCount(0);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('invalid backup gives a recovery message without a console error', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Manage marker data' }).click();
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
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', '/favicon.svg');
  }
  await page.goto('/404.html');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Page not found — Audio Reflection Markers');
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', 'Page not found — Audio Reflection Markers');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', '/favicon.svg');
  for (const route of ['/sitemap.xml', '/social-card.svg', '/favicon.svg']) expect((await request.get(route)).ok()).toBe(true);
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
