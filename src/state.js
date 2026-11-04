/**
 * Application state: a single plain object persisted to localStorage, plus a tiny
 * change-notification mechanism.
 *
 * Modules mutate `state` directly and then call `commit(change)`. `commit` saves and
 * notifies listeners (registered in main.js), which re-render whatever the change affects.
 */

import {
  STORAGE_KEY, LANGUAGES, IMAGE_THEMES, ALIGNMENTS, FLAG_STYLES, THEME_NAMES,
} from './config.js';

/**
 * @typedef {object} Trip
 * @property {string} id     Random id, stable for the life of the trip.
 * @property {string} code   ISO 3166-1 alpha-2 country code, '' until chosen.
 * @property {string} start  First day, 'YYYY-MM-DD'.
 * @property {string} end    Last day (inclusive), 'YYYY-MM-DD'.
 */

/**
 * @typedef {object} Colors
 * @property {string} bg      Background, '#rrggbb'.
 * @property {string} text    Month names and day numbers.
 * @property {string} accent  The year.
 */

/**
 * @typedef {object} AppState
 * @property {number} year
 * @property {'pl'|'en'} lang
 * @property {'dark'|'light'|'custom'} theme
 * @property {Colors} custom                 Colours of the custom theme.
 * @property {'native'|'twemoji'} flagStyle
 * @property {'left'|'center'|'right'} yearAlign
 * @property {'left'|'center'|'right'} monthAlign
 * @property {boolean} weekSunday            Week starts on Sunday instead of Monday.
 * @property {Trip[]} trips
 */

/**
 * @typedef {object} Change  Hints for listeners about what changed; all optional.
 * @property {boolean} [trips]      Trips were added, removed or got a new country.
 * @property {boolean} [lang]       UI language changed.
 * @property {boolean} [year]       Selected year changed.
 * @property {boolean} [flagStyle]  Flag rendering style changed.
 */

const isHexColor = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);

/** @returns {AppState} */
function defaults() {
  const browserLang = (navigator.language || '').toLowerCase().startsWith('pl') ? 'pl' : 'en';
  return {
    year: new Date().getFullYear(),
    lang: browserLang,
    theme: 'dark',
    custom: { ...IMAGE_THEMES.dark },
    flagStyle: 'native',
    yearAlign: 'center',
    monthAlign: 'left',
    weekSunday: false,
    trips: [],
  };
}

/**
 * Reads the saved state and repairs anything missing or invalid, so older or hand-edited
 * data never breaks the app.
 * @returns {AppState}
 */
function load() {
  const base = defaults();
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { /* private mode, bad JSON… */ }
  if (!saved || !Array.isArray(saved.trips)) return base;

  const s = { ...base, ...saved };
  delete s.markToday;   // removed option, may still be in old saves

  if (!LANGUAGES.some(l => l.code === s.lang)) s.lang = base.lang;
  if (!THEME_NAMES.includes(s.theme)) s.theme = base.theme;
  if (!FLAG_STYLES.includes(s.flagStyle)) s.flagStyle = base.flagStyle;
  if (!ALIGNMENTS.includes(s.yearAlign)) s.yearAlign = base.yearAlign;
  if (!ALIGNMENTS.includes(s.monthAlign)) s.monthAlign = base.monthAlign;
  if (!Number.isInteger(s.year)) s.year = base.year;
  s.weekSunday = s.weekSunday === true;

  const c = saved.custom || {};
  s.custom = {
    bg: isHexColor(c.bg) ? c.bg : base.custom.bg,
    text: isHexColor(c.text) ? c.text : base.custom.text,
    accent: isHexColor(c.accent) ? c.accent : base.custom.accent,
  };
  return s;
}

/** The single source of truth. Mutate it, then call `commit()`. */
export const state = load();

/** Writes the state to localStorage; failures (quota, private mode) are ignored. */
export function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

/** @type {Set<(change: Change) => void>} */
const listeners = new Set();

/** Registers a callback run after every `commit()`. */
export function onChange(listener) {
  listeners.add(listener);
}

/**
 * Saves the state and notifies listeners.
 * @param {Change} [change]
 */
export function commit(change = {}) {
  save();
  for (const listener of listeners) listener(change);
}

/**
 * Colours of the exported image for a theme name.
 * @param {string} name  'dark' | 'light' | 'custom'
 * @returns {Colors}
 */
export function themeColors(name) {
  return name === 'custom' ? state.custom : IMAGE_THEMES[name] || IMAGE_THEMES.dark;
}

/** Short random id for new trips. */
export const newId = () => Math.random().toString(36).slice(2, 10);
