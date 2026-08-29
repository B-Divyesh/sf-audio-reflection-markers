import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { chromium, expect } from '@playwright/test';

const root = resolve(new URL('../dist/', import.meta.url).pathname);
const mime = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.webp': 'image/webp' };
let workerRequests = 0;

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    let relative = pathname.replace(/^\/+/, '');
    if (!relative || pathname.endsWith('/')) relative += 'index.html';
    let file = resolve(root, relative);
    if (!file.startsWith(`${root}/`) && file !== join(root, 'index.html')) throw new Error('Invalid path');
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    } catch {
      if (!extname(pathname)) file = join(root, 'index.html');
    }
    let body = await readFile(file);
    if (pathname === '/sw.js' && ++workerRequests > 1) body = Buffer.concat([body, Buffer.from('\n// update-lifecycle-regression\n')]);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream', 'Cache-Control': pathname === '/sw.js' ? 'no-cache' : 'public, max-age=30' }).end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

await new Promise((resolveReady) => server.listen(4174, '127.0.0.1', resolveReady));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4174/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
  await page.locator('#toast-message').filter({ hasText: 'An app update is ready.' }).waitFor();
  const action = page.locator('#toast-action');
  const text = await action.textContent();
  if (text !== 'Reload') throw new Error(`Expected a Reload update action, received ${text ?? 'nothing'}.`);
  await expect(action).toHaveAccessibleName('Reload');
  console.log(`Verified live service-worker update lifecycle after ${workerRequests} worker requests.`);
} finally {
  await browser.close();
  await new Promise((resolveClosed, reject) => server.close((error) => error ? reject(error) : resolveClosed()));
}
