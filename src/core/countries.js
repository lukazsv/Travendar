/**
 * Country list. Names come from the browser (Intl.DisplayNames), so they are always
 * up to date and need no translation files.
 */

import { intlLocale } from '../config.js';

/** ISO 3166-1 alpha-2 codes that have an emoji flag (plus XK, Kosovo). */
export const COUNTRY_CODES = (
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR ' +
  'GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP ' +
  'KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS ' +
  'MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS ' +
  'RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW ' +
  'TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW'
).split(' ');

/**
 * Lower-cases and strips diacritics so 'Łódź', 'lodz' and 'LODZ' match.
 * Non-Latin scripts (Cyrillic, Arabic, CJK, Devanagari…) are only lower-cased.
 * @param {string} text
 */
export function normalizeForSearch(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .normalize('NFC');
}

/** @type {Map<string, Intl.DisplayNames | null>} */
const displayNamesByLang = new Map();
function displayNames(lang) {
  if (!displayNamesByLang.has(lang)) {
    let names = null;
    try {
      names = new Intl.DisplayNames([intlLocale(lang)], { type: 'region' });
    } catch {
      /* unsupported in this browser: fall back to codes */
    }
    displayNamesByLang.set(lang, names);
  }
  return displayNamesByLang.get(lang);
}

/**
 * @typedef {object} Country
 * @property {string} code  ISO 3166-1 alpha-2 code. Names come from countryName().
 */

/** @type {Country[]} */
export const COUNTRIES = COUNTRY_CODES.map(code => ({ code }));

/** @type {Record<string, Country>} */
export const COUNTRY_BY_CODE = Object.fromEntries(COUNTRIES.map(c => [c.code, c]));

/** @type {Map<string, string>} cache of `${lang}:${code}` → name */
const nameCache = new Map();

/**
 * The country's name in a language, from the browser (Intl.DisplayNames).
 * @param {Country} country
 * @param {string} lang
 */
export function countryName(country, lang) {
  const key = `${lang}:${country.code}`;
  if (!nameCache.has(key)) nameCache.set(key, displayNames(lang)?.of(country.code) || country.code);
  return nameCache.get(key);
}

/** @type {Map<string, string>} */
const searchCache = new Map();

/**
 * Normalised text to search in: the name in `lang`, the English name and the code, so
 * people can type either their own language, English or e.g. "PT".
 * @param {Country} country
 * @param {string} lang
 */
export function searchText(country, lang) {
  const key = `${lang}:${country.code}`;
  if (!searchCache.has(key)) {
    searchCache.set(
      key,
      normalizeForSearch(`${countryName(country, lang)} ${countryName(country, 'en')} ${country.code}`),
    );
  }
  return searchCache.get(key);
}

/**
 * @param {Country[]} countries
 * @param {string} lang
 * @returns {Country[]} a new array sorted by name in `lang`
 */
export function sortByName(countries, lang) {
  const collator = new Intl.Collator(intlLocale(lang));
  return countries.slice().sort((a, b) => collator.compare(countryName(a, lang), countryName(b, lang)));
}

/**
 * Flag emoji for a country code: two "regional indicator" characters, e.g. 'PL' → 🇵🇱.
 * @param {string} code
 */
export function flagEmoji(code) {
  return String.fromCodePoint(...flagCodePoints(code));
}

/** Unicode code points of the flag emoji. */
export function flagCodePoints(code) {
  return [...code].map(ch => 0x1f1e6 + ch.charCodeAt(0) - 65);
}
