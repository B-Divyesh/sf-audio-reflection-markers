import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const sw = await readFile(new URL('sw.js', dist), 'utf8');
const match = sw.match(/const PRECACHE=(\[[^;]+\])/);
if (!match) throw new Error('Service worker does not expose a static PRECACHE list.');

const precache = JSON.parse(match[1]);
const missing = [];
for (const url of precache) {
  const file = url === '/' ? 'index.html' : url.endsWith('/') ? `${url.slice(1)}index.html` : url.slice(1);
  try {
    if (!(await stat(new URL(file, dist))).isFile()) missing.push(url);
  } catch {
    missing.push(url);
  }
}
if (missing.length) throw new Error(`Service-worker precache contains files absent from dist: ${missing.join(', ')}`);
for (const lifecycleCall of ['self.skipWaiting()', 'self.clients.claim()']) {
  if (!sw.includes(lifecycleCall)) throw new Error(`Service worker is missing required update lifecycle call: ${lifecycleCall}`);
}

const config = JSON.parse(await readFile(new URL('staticwebapp.config.json', dist), 'utf8'));
const route = (path) => config.routes?.find((candidate) => candidate.route === path);
const requiredPolicies = [
  [config.mimeTypes?.['.webmanifest'], 'application/manifest+json', 'manifest MIME type'],
  [route('/assets/*')?.headers?.['Cache-Control'], 'public, max-age=31536000, immutable', 'immutable asset cache'],
  [route('/sw.js')?.headers?.['Cache-Control'], 'no-cache', 'service-worker cache'],
];
for (const [actual, expected, label] of requiredPolicies) {
  if (actual !== expected) throw new Error(`Invalid ${label}: expected ${expected}, received ${actual ?? 'nothing'}`);
}
for (const header of ['Content-Security-Policy', 'Permissions-Policy']) {
  if (!config.globalHeaders?.[header]) throw new Error(`Missing ${header} deployment policy.`);
}

console.log(`Verified ${precache.length} precache URLs and Azure response policies.`);
