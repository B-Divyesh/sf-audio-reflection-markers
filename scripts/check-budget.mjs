import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const limits = { '.js': 200 * 1024, '.css': 50 * 1024 };
const assetDir = new URL('../dist/assets/', import.meta.url);
let failed = false;
for (const file of await readdir(assetDir)) {
  const extension = Object.keys(limits).find((suffix) => file.endsWith(suffix));
  if (!extension) continue;
  const bytes = (await stat(join(assetDir.pathname, file))).size;
  console.log(`${file}: ${(bytes / 1024).toFixed(1)} KB / ${limits[extension] / 1024} KB`);
  if (bytes > limits[extension]) failed = true;
}
if (failed) throw new Error('A production asset exceeds its performance budget.');
