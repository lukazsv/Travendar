/**
 * Short status message at the bottom of the screen ("Saved", errors), optionally with
 * one action button such as "Undo". While an action is offered, Ctrl/⌘+Z triggers it too.
 */

import { byId } from '../utils/html.js';

const DURATION_MS = 2400;
const DURATION_WITH_ACTION_MS = 6000; // long enough to notice and reach the button

let hideTimer;
/** @type {(() => void) | null} */
let pendingAction = null;

/**
 * @param {string} message
 * @param {{ actionLabel?: string, onAction?: () => void }} [options]
 */
export function showToast(message, { actionLabel, onAction } = {}) {
  const el = byId('toast');
  el.replaceChildren(Object.assign(document.createElement('span'), { textContent: message }));
  pendingAction = null;

  if (actionLabel && onAction) {
    const button = Object.assign(document.createElement('button'), { type: 'button', textContent: actionLabel });
    pendingAction = () => {
      pendingAction = null;
      hide();
      onAction();
    };
    button.addEventListener('click', pendingAction);
    el.append(button);
  }

  el.classList.toggle('has-action', Boolean(pendingAction));
  el.classList.add('show');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(hide, pendingAction ? DURATION_WITH_ACTION_MS : DURATION_MS);
}

function hide() {
  pendingAction = null;
  byId('toast').classList.remove('show');
}

document.addEventListener('keydown', e => {
  if (!pendingAction || e.key.toLowerCase() !== 'z' || !(e.metaKey || e.ctrlKey) || e.shiftKey) return;
  // Leave Ctrl/⌘+Z alone inside text fields, where it undoes typing.
  if (e.target.closest?.('input, textarea, [contenteditable]')) return;
  e.preventDefault();
  pendingAction();
});
