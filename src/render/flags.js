/**
 * Flag rendering. Uses the system's emoji flags when it can draw them (Apple, Android,
 * Firefox), otherwise Twemoji images (Windows has no emoji flags).
 */

import { EMOJI_FONT, TWEMOJI_BASE_URL } from '../config.js';
import { state } from '../state.js';
import { flagEmoji, flagCodePoints } from '../core/countries.js';

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

/** @param {string} code  @returns {string} Twemoji PNG URL for the country's flag */
export function twemojiUrl(code) {
  return TWEMOJI_BASE_URL + flagCodePoints(code).map(cp => cp.toString(16)).join('-') + '.png';
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
    img.crossOrigin = 'anonymous';   // keeps the canvas exportable (not "tainted")
    img.onload = () => loadListeners.forEach(fn => fn());
    img.onerror = () => { img.failed = true; loadListeners.forEach(fn => fn()); };
    img.src = twemojiUrl(code);
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
  return `<img class="flag" src="${twemojiUrl(code)}" alt="" crossorigin="anonymous" loading="lazy">`;
}
