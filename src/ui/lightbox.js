/**
 * Enlarged view of the generated image over a translucent backdrop. Tapping (or clicking)
 * the preview opens it. Closing: swipe the image in any direction, tap anywhere, the red ✕ or Esc.
 *
 * The image is copied from the preview canvas into a second canvas, so no data:/blob:
 * URL is needed (the Content Security Policy does not allow blob: images).
 */

import { drawNow } from './preview.js';
import { byId } from '../utils/html.js';

/** Swipe distance (px) that closes the view; shorter swipes spring back. */
const CLOSE_DISTANCE = 90;
/** Movement (px) under which a press counts as a tap. */
const TAP_SLOP = 8;
/** A quick flick closes even when it is short (px per ms). */
const CLOSE_VELOCITY = 0.6;
const CLOSE_ANIMATION_MS = 180;

let dialog, frame;

export function initLightbox() {
  dialog = byId('lightbox');
  frame = byId('lightboxFrame');
  const target = byId('lightboxCanvas');
  const source = byId('cv');

  byId('zoomBtn').addEventListener('click', e => {
    drawNow(); // the preview redraws on the next frame; make sure the copy is up to date
    target.getContext('2d').drawImage(source, 0, 0, target.width, target.height);
    target.setAttribute('aria-label', source.getAttribute('aria-label') || '');
    resetDrag();
    dialog.classList.remove('closing');
    dialog.showModal();
    // Keyboard users (click with detail 0) land on the ✕; for taps and mouse clicks focus
    // stays on the image so the ✕ shows no focus highlight.
    if (e.detail === 0) byId('lightboxClose').focus();
    else frame.focus({ preventScroll: true });
  });

  byId('lightboxClose').addEventListener('click', e => {
    e.stopPropagation();
    animateClose();
  });
  initSwipe();
}

function initSwipe() {
  let start = null; // { x, y, time, id }
  let offset = { x: 0, y: 0 }; // how far the image has been dragged

  dialog.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('.lightbox-close')) return;
    start = { x: e.clientX, y: e.clientY, time: performance.now(), id: e.pointerId };
    offset = { x: 0, y: 0 };
    try {
      dialog.setPointerCapture(e.pointerId); // keep receiving moves if the finger leaves the image
    } catch {
      /* pointer already gone */
    }
    dialog.classList.add('dragging');
  });

  dialog.addEventListener('pointermove', e => {
    if (!start || e.pointerId !== start.id) return;
    offset = { x: e.clientX - start.x, y: e.clientY - start.y };
    const distance = Math.hypot(offset.x, offset.y);
    frame.style.transform = `translate(${offset.x}px, ${offset.y}px) scale(${1 - Math.min(distance / 2000, 0.08)})`;
    dialog.style.setProperty('--drag', String(Math.min(distance / 300, 1)));
  });

  const end = e => {
    if (!start || e.pointerId !== start.id) return;
    const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
    const velocity = moved / Math.max(performance.now() - start.time, 1);
    start = null;
    dialog.classList.remove('dragging');
    if (e.type === 'pointercancel') return resetDrag();
    if (moved < TAP_SLOP) return animateClose(); // a tap
    if (moved > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY) return animateClose(offset);
    resetDrag(); // spring back (CSS transition)
  };
  dialog.addEventListener('pointerup', end);
  dialog.addEventListener('pointercancel', end);
}

function resetDrag() {
  frame.style.transform = '';
  dialog.style.setProperty('--drag', '0');
}

/**
 * Fades the image out — after a swipe it keeps moving the same way — then closes the dialog.
 * @param {{ x: number, y: number }} [offset]  where the swipe left the image
 */
function animateClose(offset) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return dialog.close();
  dialog.classList.add('closing');
  dialog.style.setProperty('--drag', '1');
  const distance = offset ? Math.hypot(offset.x, offset.y) : 0;
  if (distance) {
    const extra = 1 + 120 / distance; // push ~120 px further along the swipe
    frame.style.transform = `translate(${offset.x * extra}px, ${offset.y * extra}px) scale(0.92)`;
  }
  setTimeout(() => {
    dialog.close();
    dialog.classList.remove('closing');
    resetDrag();
  }, CLOSE_ANIMATION_MS);
}
