/**
 * Country list. Names come from the browser (Intl.DisplayNames), so they are always
 * up to date and need no translation files.
 */

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
 * @param {string} text
 */
export function normalizeForSearch(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');
}

function displayNames(lang) {
  try { return new Intl.DisplayNames([lang], { type: 'region' }); } catch { return null; }
}
const namesPl = displayNames('pl');
const namesEn = displayNames('en');

/**
 * @typedef {object} Country
 * @property {string} code
 * @property {string} pl      Polish name.
 * @property {string} en      English name.
 * @property {string} search  Normalised "pl en code" string for searching in either language.
 */

/** @type {Country[]} */
export const COUNTRIES = COUNTRY_CODES.map(code => {
  const pl = namesPl?.of(code) || code;
  const en = namesEn?.of(code) || code;
  return { code, pl, en, search: normalizeForSearch(`${pl} ${en} ${code}`) };
});

/** @type {Record<string, Country>} */
export const COUNTRY_BY_CODE = Object.fromEntries(COUNTRIES.map(c => [c.code, c]));

/**
 * @param {Country[]} countries
 * @param {'pl'|'en'} lang
 * @returns {Country[]} a new array sorted by name in `lang`
 */
export function sortByName(countries, lang) {
  return countries.slice().sort((a, b) => a[lang].localeCompare(b[lang], lang));
}

/**
 * Flag emoji for a country code: two "regional indicator" characters, e.g. 'PL' → 🇵🇱.
 * @param {string} code
 */
export function flagEmoji(code) {
  return String.fromCodePoint(...flagCodePoints(code));
}

/** Unicode code points of the flag emoji (also used to build Twemoji file names). */
export function flagCodePoints(code) {
  return [...code].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65);
}
