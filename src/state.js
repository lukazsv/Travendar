/**
 * Application state: a single plain object persisted to localStorage, plus a tiny
 * change-notification mechanism.
 *
 * Modules mutate `state` directly and then call `commit(change)`. `commit` saves and
 * notifies listeners (registered in main.js), which re-render whatever the change affects.
 */

import {
  STORAGE_KEY,
  LANGUAGES,
  DEFAULT_LANGUAGE,
  IMAGE_THEMES,
  ALIGNMENTS,
  FLAG_STYLES,
  THEME_NAMES,
  YEAR_MIN,
  YEAR_MAX,
  MAX_TRIPS,
} from './config.js';
import { COUNTRY_CODES } from './core/countries.js';
import { isISODate } from './core/dates.js';
import { detectLanguage } from './core/language.js';

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
 * @property {string} lang                 UI language code, one of LANGUAGES in config.js.
 * @property {'dark'|'light'|'custom'} theme
 * @property {Colors} custom                 Colours of the custom theme.
 * @property {'native'|'twemoji'} flagStyle
 * @property {'left'|'center'|'right'} yearAlign
 * @property {'left'|'center'|'right'} monthAlign
 * @property {boolean} weekSunday            Week starts on Sunday instead of Monday.
 * @property {boolean} showSiteUrl           Print the site address at the bottom of the image.
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
  const preferred = typeof navigator === 'undefined' ? [] : navigator.languages || [navigator.language];
  return {
    year: new Date().getFullYear(),
    lang: detectLanguage(
      preferred,
      LANGUAGES.map(l => l.code),
      DEFAULT_LANGUAGE,
    ),
    theme: 'dark',
    custom: { ...IMAGE_THEMES.dark },
    flagStyle: 'native',
    yearAlign: 'center',
    monthAlign: 'left',
    weekSunday: false,
    showSiteUrl: true,
    trips: [],
  };
}

const VALID_ID = /^[a-z0-9]{1,24}$/i;
const KNOWN_CODES = new Set(COUNTRY_CODES);

/**
 * Builds a valid state from untrusted data (localStorage or an imported file).
 *
 * Only known fields with valid values are copied; everything else falls back to the
 * defaults. This matters for security, not just robustness: trips end up in HTML, so a
 * crafted file or tampered storage must not be able to smuggle markup in.
 *
 * @param {any} raw  Parsed JSON.
 * @returns {AppState | null}  null when `raw` does not look like Travendar data at all.
 */
export function sanitizeState(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.trips)) return null;
  const base = defaults();
  const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);
  const c = raw.custom && typeof raw.custom === 'object' ? raw.custom : {};

  return {
    year: Number.isInteger(raw.year) && raw.year >= YEAR_MIN && raw.year <= YEAR_MAX ? raw.year : base.year,
    lang: pick(
      raw.lang,
      LANGUAGES.map(l => l.code),
      base.lang,
    ),
    theme: pick(raw.theme, THEME_NAMES, base.theme),
    custom: {
      bg: isHexColor(c.bg) ? c.bg : base.custom.bg,
      text: isHexColor(c.text) ? c.text : base.custom.text,
      accent: isHexColor(c.accent) ? c.accent : base.custom.accent,
    },
    flagStyle: pick(raw.flagStyle, FLAG_STYLES, base.flagStyle),
    yearAlign: pick(raw.yearAlign, ALIGNMENTS, base.yearAlign),
    monthAlign: pick(raw.monthAlign, ALIGNMENTS, base.monthAlign),
    weekSunday: raw.weekSunday === true,
    showSiteUrl: raw.showSiteUrl !== false, // on unless switched off (also for data saved before it existed)
    trips: sanitizeTrips(raw.trips),
  };
}

/**
 * Keeps well-formed trips only (at most MAX_TRIPS). Unknown country codes and malformed
 * dates are cleared rather than dropping the trip; missing or duplicate ids are replaced.
 * @returns {Trip[]}
 */
function sanitizeTrips(list) {
  const seen = new Set();
  const trips = [];
  for (const item of list) {
    if (trips.length >= MAX_TRIPS) break;
    if (!item || typeof item !== 'object') continue;
    let id = typeof item.id === 'string' && VALID_ID.test(item.id) ? item.id : newId();
    while (seen.has(id)) id = newId();
    seen.add(id);
    trips.push({
      id,
      code: KNOWN_CODES.has(item.code) ? item.code : '',
      start: isISODate(item.start) ? item.start : '',
      end: isISODate(item.end) ? item.end : '',
    });
  }
  return trips;
}

/** Reads the saved state; anything missing or invalid falls back to the defaults. */
function load() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    /* private mode, bad JSON… */
  }
  return sanitizeState(saved) || defaults();
}

/** The single source of truth. Mutate it, then call `commit()`. */
export const state = load();

/**
 * Replaces the whole state (e.g. from an imported file), keeping the same object so
 * modules holding a reference to `state` see the new values.
 * @param {AppState} next  Already sanitised.
 */
export function replaceState(next) {
  Object.assign(state, next);
}

/** Writes the state to localStorage; failures (quota, private mode) are ignored. */
export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
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

/** Short random id for new trips (letters and digits only, see VALID_ID). */
export function newId() {
  return Math.random().toString(36).slice(2, 10);
}
