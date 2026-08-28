import { defineConfig, type Plugin } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

function serviceWorker(): Plugin {
  return {
    name: 'local-first-service-worker',
    generateBundle(_, bundle) {
      const files = Object.keys(bundle).map((file) => `/${file}`);
      const shell = ['/','/index.html','/offline.html','/manifest.webmanifest','/privacy/','/terms/','/assets/memory-orbit.webp','/icon-192.png','/icon-512.png'];
      const precache = [...new Set([...shell, ...files])];
      const version = `arm-${files.sort().join('-').length}-${files.length}`;
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `const CACHE=${JSON.stringify(version)};const PRECACHE=${JSON.stringify(precache)};self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()))});self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(async()=>await caches.match(e.request)||await caches.match('/index.html')||await caches.match('/offline.html')));return}e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}))) });`
      });
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
