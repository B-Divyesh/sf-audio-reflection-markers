import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const root = resolve(new URL('../dist/', import.meta.url).pathname);
const port = Number(process.env.PORT ?? 4173);
const mime = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json', '.webp': 'image/webp', '.txt': 'text/plain; charset=utf-8'
};
const security = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=(self), payment=(), usb=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff'
};

createServer(async (request, response) => {
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
    const body = await readFile(file);
    const headers = { ...security, 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' };
    if (pathname.startsWith('/assets/')) headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    else if (pathname === '/sw.js') headers['Cache-Control'] = 'no-cache';
    else if (pathname === '/manifest.webmanifest') headers['Cache-Control'] = 'public, max-age=3600';
    else headers['Cache-Control'] = 'public, must-revalidate, max-age=30';
    response.writeHead(200, headers).end(body);
  } catch {
    response.writeHead(404, { ...security, 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Strict static server listening on http://127.0.0.1:${port}`));
