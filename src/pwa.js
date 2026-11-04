/**
 * Registers the service worker (sw.js) that makes the app installable and usable offline.
 *
 * Browsers allow service workers only in secure contexts: HTTPS or localhost. On a plain
 * http://<IP> address (e.g. testing on a phone in the local network) this silently does nothing.
 */

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  // After the page has loaded, so caching never competes with the first render.
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('Service worker not registered:', err));
  });
}
