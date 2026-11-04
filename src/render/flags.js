/**
 * Flag rendering. Uses the system's emoji flags when it can draw them (Apple, Android,
 * Firefox), otherwise the bundled Twemoji images (Windows has no emoji flags).
 */

import { EMOJI_FONT, FLAG_IMAGES_DIR } from '../config.js';
import { state } from '../state.js';
import { flagEmoji } from '../core/countries.js';

/**
 * Whether this system draws emoji flags in colour: render 🇵🇱 and look for its red pixels.
 * Systems without flag glyphs render the letters "PL" in the fill colour (black) instead.
 */
export const SUPPORTS_EMOJI_FLAGS = (() => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 40;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.font = `32px ${EMOJI_FONT}`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#000';
    ctx.fillText(flagEmoji('PL'), 0, 0);
    const px = ctx.getImageData(0, 0, 40, 40).data;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i] > 150 && px[i + 1] < 90 && px[i + 2] < 90 && px[i + 3] > 200) return true;
    }
  } catch { /* canvas unavailable */ }
  return false;
})();

/** True when flags should be drawn as emoji (supported and not switched to Twemoji in settings). */
export function usesEmojiFlags() {
  return SUPPORTS_EMOJI_FLAGS && state.flagStyle !== 'twemoji';
}

/**
 * URL of the bundled flag image. `code` is always a known ISO code here (validated in
 * state.js or taken from our own lists), so it is safe to put into a URL and HTML.
 * @param {string} code
 */
export function flagImageUrl(code) {
  return `${FLAG_IMAGES_DIR}${code}.png`;
}

// ---- Twemoji images for the canvas ----

/** @type {Map<string, HTMLImageElement & { failed?: boolean }>} */
const imageCache = new Map();
const loadListeners = new Set();

/** Registers a callback run whenever a flag image finishes loading (or fails), to redraw. */
export function onFlagImageLoad(listener) {
  loadListeners.add(listener);
}

/**
 * Cached Twemoji <img> for a code. Starts loading on first use; check `complete` /
 * `naturalWidth` before drawing and `failed` for load errors.
 */
export function getFlagImage(code) {
  let img = imageCache.get(code);
  if (!img) {
    img = new Image();
    img.onload = () => loadListeners.forEach(fn => fn());
    img.onerror = () => { img.failed = true; loadListeners.forEach(fn => fn()); };
    img.src = flagImageUrl(code);   // same origin, so the canvas stays exportable
    imageCache.set(code, img);
  }
  return img;
}

/**
 * Resolves once the images for `codes` have loaded or failed. Used before exporting,
 * so the saved JPG never has missing flags. No-op when emoji flags are used.
 * @param {Iterable<string>} codes
 */
export function preloadFlagImages(codes) {
  if (usesEmojiFlags()) return Promise.resolve();
  return Promise.all([...new Set(codes)].map(code => new Promise(resolve => {
    const img = getFlagImage(code);
    if (img.complete) return resolve();
    img.addEventListener('load', resolve, { once: true });
    img.addEventListener('error', resolve, { once: true });
  })));
}

// ---- Flags in the HTML UI ----

/** HTML for a flag in lists and buttons, in the current flag style. */
export function flagHTML(code) {
  if (usesEmojiFlags()) return `<span class="flag" aria-hidden="true">${flagEmoji(code)}</span>`;
  return `<img class="flag" src="${flagImageUrl(code)}" alt="" loading="lazy">`;
}
