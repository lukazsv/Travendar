/** Short status message at the bottom of the screen ("Saved", errors). */

import { byId } from '../utils/html.js';

const DURATION_MS = 2400;
let hideTimer;

/** @param {string} message */
export function showToast(message) {
  const el = byId('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => el.classList.remove('show'), DURATION_MS);
}
