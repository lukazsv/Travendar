/** Language menu behind the globe button in the header. */

import { LANGUAGES } from '../config.js';
import { state, commit } from '../state.js';
import { flagHTML } from '../render/flags.js';
import { ICON_CHECK } from './icons.js';
import { byId, escapeHtml as esc } from '../utils/html.js';

let button, menu;

export function initLanguageMenu() {
  button = byId('langBtn');
  menu = byId('langMenu');

  button.addEventListener('click', () => (menu.hidden ? open() : close()));

  menu.addEventListener('click', e => {
    const item = e.target.closest('[data-lang]');
    if (!item) return;
    if (item.dataset.lang !== state.lang) {
      state.lang = item.dataset.lang;
      commit({ lang: true });
    }
    close(true);
  });

  // Arrow keys move between items; Escape and clicks outside close the menu.
  menu.addEventListener('keydown', e => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = [...menu.querySelectorAll('.lang-item')];
    const step = e.key === 'ArrowDown' ? 1 : -1;
    items[(items.indexOf(document.activeElement) + step + items.length) % items.length].focus();
  });
  document.addEventListener('click', e => { if (!e.target.closest('.lang')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(true); });
}

function open() {
  menu.innerHTML = LANGUAGES.map(lang => `
    <button class="lang-item" type="button" role="menuitemradio" lang="${lang.code}" data-lang="${lang.code}"
            aria-checked="${lang.code === state.lang}">${flagHTML(lang.flag)}<span>${esc(lang.name)}</span>${ICON_CHECK}</button>`
  ).join('');
  menu.hidden = false;
  button.setAttribute('aria-expanded', 'true');
  (menu.querySelector('[aria-checked="true"]') || menu.firstElementChild).focus();
}

/** @param {boolean} [returnFocus]  move focus back to the globe button (keyboard use) */
function close(returnFocus = false) {
  if (menu.hidden) return;
  menu.hidden = true;
  button.setAttribute('aria-expanded', 'false');
  if (returnFocus) button.focus();
}
