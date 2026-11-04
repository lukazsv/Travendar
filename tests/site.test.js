import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SITE_URL } from '../src/config.js';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const html = read('index.html');

test('SITE_URL is an https origin with a trailing slash', () => {
  const url = new URL(SITE_URL);
  assert.equal(url.protocol, 'https:');
  assert.equal(SITE_URL, `${url.origin}/`);
});

test('index.html, robots.txt and sitemap.xml use SITE_URL', () => {
  assert.ok(html.includes(`<link rel="canonical" href="${SITE_URL}">`), 'canonical');
  assert.ok(html.includes(`<meta property="og:url" content="${SITE_URL}">`), 'og:url');
  assert.ok(html.includes(`<meta property="og:image" content="${SITE_URL}src/assets/og-image.png">`), 'og:image');
  assert.ok(read('robots.txt').includes(`Sitemap: ${SITE_URL}sitemap.xml`), 'robots.txt');
  assert.ok(read('sitemap.xml').includes(`<loc>${SITE_URL}</loc>`), 'sitemap.xml');
});

test('the CSP header in _headers matches the <meta> CSP plus frame-ancestors', () => {
  const meta = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/)[1];
  const header = read('_headers').match(/^\s+Content-Security-Policy: (.+)$/m)[1];
  assert.equal(header, `${meta}; frame-ancestors 'none'`);
});
