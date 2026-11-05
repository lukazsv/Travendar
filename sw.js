/**
 * Service worker: makes the app work offline and installable.
 *
 * Strategy: network first, cache as fallback. Online, every request is checked with the server
 * instead of trusting the browser's HTTP cache (so a new deployment is picked up immediately and old and
 * new files are never mixed);
 * the fresh response is also stored in the cache. Offline, the cached copy is served.
 *
 * PRECACHE lists the files needed to start the app offline after the first visit.
 * Keep it in sync with the files in src/ — `python3 scripts/check_precache.py` checks it.
 * Flag images are not precached; they are cached when first shown.
 *
 * Bump CACHE_VERSION when files are removed or renamed, so old copies are deleted.
 */

const CACHE_VERSION = 'v3';
const CACHE_NAME = `travendar-${CACHE_VERSION}`;

const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'src/assets/fonts/dm-sans-latin-ext.woff2',
  'src/assets/fonts/dm-sans-latin.woff2',
  'src/assets/fonts/inter-latin-ext.woff2',
  'src/assets/fonts/inter-latin.woff2',
  'src/assets/icons/apple-touch-icon.png',
  'src/assets/icons/favicon-32.png',
  'src/assets/icons/icon-192.png',
  'src/assets/icons/icon-512.png',
  'src/assets/icons/icon-maskable-512.png',
  'src/assets/icons/icon.svg',
  'src/config.js',
  'src/core/calendar.js',
  'src/core/continent-shapes.js',
  'src/core/continents.js',
  'src/core/countries.js',
  'src/core/date-range.js',
  'src/core/dates.js',
  'src/core/language.js',
  'src/i18n.js',
  'src/locales/ar.js',
  'src/locales/de.js',
  'src/locales/en.js',
  'src/locales/es.js',
  'src/locales/fr.js',
  'src/locales/hi.js',
  'src/locales/it.js',
  'src/locales/ja.js',
  'src/locales/pl.js',
  'src/locales/plural.js',
  'src/locales/pt.js',
  'src/locales/ru.js',
  'src/locales/uk.js',
  'src/locales/zh.js',
  'src/main.js',
  'src/pwa.js',
  'src/render/calendar-renderer.js',
  'src/render/flags.js',
  'src/state.js',
  'src/styles/base.css',
  'src/styles/components.css',
  'src/styles/country-picker.css',
  'src/styles/date-picker.css',
  'src/styles/fonts.css',
  'src/styles/footer.css',
  'src/styles/header.css',
  'src/styles/layout.css',
  'src/styles/preview.css',
  'src/styles/settings.css',
  'src/styles/tokens.css',
  'src/styles/trips.css',
  'src/ui/backup.js',
  'src/ui/country-picker.js',
  'src/ui/date-range-picker.js',
  'src/ui/donate.js',
  'src/ui/export.js',
  'src/ui/footer.js',
  'src/ui/icons.js',
  'src/ui/language-menu.js',
  'src/ui/lightbox.js',
  'src/ui/preview.js',
  'src/ui/settings.js',
  'src/ui/toast.js',
  'src/ui/trips.js',
  'src/utils/download.js',
  'src/utils/html.js',
];

self.addEventListener('install', event => {
  // `cache: 'reload'` bypasses the HTTP cache so the precache gets current files.
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE.map(url => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys.filter(key => key.startsWith('travendar-') && key !== CACHE_NAME).map(key => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  // Only this site's own GET requests; everything else goes straight to the network.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    // `no-cache` makes the browser revalidate its HTTP cache copy with the server (a cheap 304
    // when unchanged). Without it a file could be served stale for as long as the host's
    // Cache-Control allows: Cloudflare's browser cache TTL on travendar.app made that 4 hours.
    // Page loads keep their own mode, which cannot carry other request options.
    const response = await fetch(request, request.mode === 'navigate' ? undefined : { cache: 'no-cache' });
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    // Offline: the cached copy, ignoring ?query strings; for page loads fall back to the app shell.
    const cached =
      (await cache.match(request, { ignoreSearch: true })) ||
      (request.mode === 'navigate' ? await cache.match('index.html') : undefined);
    if (cached) return cached;
    throw err;
  }
}
