import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin, type ResolvedConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

function serviceWorker(): Plugin {
  let outDir = '';

  const emittedFiles = (directory: string): string[] => readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? emittedFiles(path) : [path];
  });

  return {
    name: 'local-first-service-worker',
    apply: 'build',
    configResolved(config: ResolvedConfig) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      // Rollup's generateBundle hook can still contain empty facade chunks that
      // Vite removes later. Build the list from disk so every URL is guaranteed
      // to exist on a strict static host.
      const shell = ['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/privacy/', '/terms/', '/icon-192.png', '/icon-512.png'];
      const assetsDir = join(outDir, 'assets');
      const assets = emittedFiles(assetsDir)
        .map((path) => `/${relative(outDir, path).split(sep).join('/')}`)
        .sort();
      const precache = [...new Set([...shell, ...assets])];
      const digest = createHash('sha256');
      for (const url of precache) {
        const file = url === '/' ? 'index.html' : url.endsWith('/') ? `${url.slice(1)}index.html` : url.slice(1);
        digest.update(url).update(readFileSync(join(outDir, file)));
      }
      const version = `arm-${digest.digest('hex').slice(0, 12)}`;
      const source = `const CACHE=${JSON.stringify(version)};const PRECACHE=${JSON.stringify(precache)};self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()))});self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{if(!r.ok)throw new Error('Navigation failed');const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(async()=>await caches.match(e.request)||await caches.match('/index.html')||await caches.match('/offline.html')));return}e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}))) });`;
      writeFileSync(join(outDir, 'sw.js'), source);
    }
  };
}

export default defineConfig({
  plugins: [serviceWorker()],
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        app: resolve(root, 'index.html'),
        privacy: resolve(root, 'privacy/index.html'),
        terms: resolve(root, 'terms/index.html')
      }
    }
  }
});
