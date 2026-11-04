/**
 * Country picker dialog, in two steps:
 *   1. continents (with outline icons), plus countries already used in trips;
 *   2. the countries of the chosen continent, A–Z.
 * The search box searches all countries on step 1 and only the chosen continent on step 2.
 *
 * Usage: openCountryPicker({ usedCodes, onPick: code => … }).
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import {
  COUNTRIES,
  COUNTRY_BY_CODE,
  countryName,
  searchText,
  sortByName,
  normalizeForSearch,
} from '../core/countries.js';
import { CONTINENTS } from '../core/continents.js';
import { flagHTML } from '../render/flags.js';
import { ICON_CHEVRON } from './icons.js';
import { byId, escapeHtml as esc } from '../utils/html.js';

let dialog, list, search, title, backBtn;

/** @type {{ usedCodes: string[], onPick: (code: string) => void } | null} */
let session = null;
/** Key of the continent shown in step 2, or null on step 1. */
let continentKey = null;

export function initCountryPicker() {
  dialog = byId('picker');
  list = byId('pickerList');
  search = byId('pickerSearch');
  title = byId('pickerTitle');
  backBtn = byId('pickerBack');

  backBtn.addEventListener('click', () => showStep(null));
  byId('pickerClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close();
  }); // click on backdrop

  search.addEventListener('input', () => {
    render();
    list.scrollTop = 0;
  });
  search.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    // Enter picks the first result; with an empty query it just closes the keyboard.
    const first = list.querySelector('.c-item');
    if (first && search.value.trim()) pick(first.dataset.code);
    else search.blur();
  });

  list.addEventListener('click', e => {
    const continent = e.target.closest('.cont-item');
    if (continent) return showStep(continent.dataset.continent);
    const country = e.target.closest('.c-item');
    if (country) pick(country.dataset.code);
  });
}

/**
 * Opens the picker on the continent step.
 * @param {{ usedCodes?: string[], onPick: (code: string) => void }} options
 */
export function openCountryPicker({ usedCodes = [], onPick }) {
  session = { usedCodes, onPick };
  dialog.showModal();
  showStep(null);
}

/** Re-renders an open picker, e.g. after the UI language or flag style changed. */
export function refreshCountryPicker() {
  if (dialog?.open) render();
}

function pick(code) {
  const onPick = session?.onPick;
  dialog.close();
  session = null;
  onPick?.(code);
}

function showStep(key) {
  continentKey = key;
  search.value = '';
  render();
  list.scrollTop = 0;
  // Focus the search box only with a mouse/trackpad; on touch it would pop up the keyboard.
  if (matchMedia('(pointer: fine)').matches) {
    search.focus();
  } else {
    // Touch / screen readers: the tapped button was just replaced, so move focus to the
    // title instead of losing it; it also announces the new step ("Europa").
    title.focus();
  }
}

function render() {
  const continent = CONTINENTS.find(c => c.key === continentKey);
  title.textContent = continent ? t('continents')[continent.key] : t('pickContinent');
  backBtn.hidden = !continent;

  const query = normalizeForSearch(search.value.trim());
  const pool = sortByName(continent ? COUNTRIES.filter(c => continent.codes.includes(c.code)) : COUNTRIES, state.lang);

  if (query) {
    // Names starting with the query first, then other matches; both groups stay A–Z.
    const startsWith = c => (normalizeForSearch(countryName(c, state.lang)).startsWith(query) ? 0 : 1);
    const results = pool
      .filter(c => searchText(c, state.lang).includes(query))
      .sort((a, b) => startsWith(a) - startsWith(b));
    list.innerHTML = results.length
      ? results.map(countryItem).join('')
      : `<div class="no-results">${esc(t('noResults'))}</div>`;
    return;
  }

  if (continent) {
    list.innerHTML = pool.map(countryItem).join('');
    return;
  }

  const used = (session?.usedCodes || []).map(code => COUNTRY_BY_CODE[code]).filter(Boolean);
  list.innerHTML =
    CONTINENTS.map(continentItem).join('') +
    (used.length ? `<h3>${esc(t('used'))}</h3>${used.map(countryItem).join('')}` : '');
}

/** @param {import('../core/countries.js').Country} country */
function countryItem(country) {
  return `<button class="c-item" type="button" data-code="${country.code}">${flagHTML(country.code)}<span>${esc(countryName(country, state.lang))}</span></button>`;
}

/** @param {import('../core/continents.js').Continent} continent */
function continentItem(continent) {
  return `<button class="cont-item" type="button" data-continent="${continent.key}">
    <svg class="outline" viewBox="0 0 32 32" aria-hidden="true"><path d="${continent.shape}"/></svg>
    <span>${esc(t('continents')[continent.key])}</span>
    <span class="count">${esc(t('countries')(continent.codes.length))}</span>${ICON_CHEVRON}
  </button>`;
}
