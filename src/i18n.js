/**
 * UI translations. Texts live in src/locales/<code>.js, one file per language.
 *
 * Static text in index.html is filled in by `applyI18n()` from these attributes:
 *   data-i18n="key"        → element.textContent
 *   data-i18n-aria="key"   → aria-label
 *   data-i18n-ph="key"     → placeholder
 * Dynamic text in JS uses `t(key)`. Some entries are functions (plurals, interpolation).
 *
 * Adding a language: copy src/locales/en.js, translate every value, import it below and
 * add it to LANGUAGES in config.js (and to PRECACHE in sw.js). tests/i18n.test.js checks
 * that every language has the same keys.
 * Country names come from the browser (Intl.DisplayNames), not from these files.
 */

import { state } from './state.js';
import { LANGUAGES, DEFAULT_LANGUAGE, intlLocale } from './config.js';
import ar from './locales/ar.js';
import de from './locales/de.js';
import en from './locales/en.js';
import es from './locales/es.js';
import fr from './locales/fr.js';
import hi from './locales/hi.js';
import it from './locales/it.js';
import ja from './locales/ja.js';
import pl from './locales/pl.js';
import pt from './locales/pt.js';
import ru from './locales/ru.js';
import uk from './locales/uk.js';
import zh from './locales/zh.js';

export const TRANSLATIONS = { ar, de, en, es, fr, hi, it, ja, pl, pt, ru, uk, zh };

/**
 * Translation for the current UI language (English if a key is somehow missing).
 * @param {string} key
 * @returns {any} A string, a function (plurals / interpolation) or an object/array.
 */
export function t(key) {
  return (TRANSLATIONS[state.lang] ?? TRANSLATIONS[DEFAULT_LANGUAGE])[key] ?? TRANSLATIONS[DEFAULT_LANGUAGE][key];
}

/** Writing direction of the current language: 'ltr' or 'rtl'. */
export function textDirection() {
  return LANGUAGES.find(l => l.code === state.lang)?.dir ?? 'ltr';
}

/** Fills every data-i18n* element inside `root` and sets <html lang> and <html dir>. */
export function applyI18n(root = document) {
  document.documentElement.lang = intlLocale(state.lang);
  document.documentElement.dir = textDirection();
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  root.querySelectorAll('[data-i18n-ph]').forEach(el => el.setAttribute('placeholder', t(el.dataset.i18nPh)));
}
