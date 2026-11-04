/**
 * Copies the files that make up the website into dist/, the folder the host publishes
 * (Cloudflare Pages: build command `npm run build`, output directory `dist`).
 *
 * The site needs no compiling; this step only keeps development files (scripts/, tests/,
 * docs, package files) off the public site. Run with `npm run build`.
 */

import { cpSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'dist');

/** Everything that is published, relative to the repository root. */
export const SITE_FILES = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'src',
  '_headers', // HTTP security headers (Cloudflare Pages / Netlify format)
  'robots.txt',
  'sitemap.xml',
];

rmSync(OUT, { recursive: true, force: true });
for (const file of SITE_FILES) {
  const from = join(ROOT, file);
  if (!existsSync(from)) throw new Error(`Missing site file: ${file}`);
  cpSync(from, join(OUT, file), { recursive: true, filter: path => !path.endsWith('.DS_Store') });
}
console.log(`Site copied to dist/ (${SITE_FILES.length} entries).`);
