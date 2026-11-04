/**
 * Continents for the country picker: which countries each one lists, in display order.
 *
 * Maintained by hand. Every code in COUNTRY_CODES (countries.js) must appear at least once.
 * Transcontinental countries (Russia, Turkey, Georgia, Armenia, Azerbaijan) are listed in
 * both Europe and Asia so people find them where they expect. Central America and the
 * Caribbean belong to North America.
 *
 * The outline icons come from continent-shapes.js (generated).
 */

import { CONTINENT_SHAPES } from './continent-shapes.js';

const MEMBERS = {
  europe:
    'AD AL AM AT AX AZ BA BE BG BY CH CY CZ DE DK EE ES FI FO FR GB GE GG GI GR HR HU IE IM IS IT JE LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SJ SK SM TR UA VA XK',
  asia: 'AE AF AM AZ BD BH BN BT CN GE HK ID IL IN IO IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MO MV MY NP OM PH PK PS QA RU SA SG SY TH TJ TL TM TR TW UZ VN YE',
  africa:
    'AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG EH ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RE RW SC SD SH SL SN SO SS ST SZ TD TG TN TZ UG YT ZA ZM ZW',
  namerica:
    'AG AI AW BB BL BM BQ BS BZ CA CR CU CW DM DO GD GL GP GT HN HT JM KN KY LC MF MQ MS MX NI PA PM PR SV SX TC TT US VC VG VI',
  samerica: 'AR BO BR CL CO EC FK GF GY PE PY SR UY VE',
  oceania: 'AS AU CC CK CX FJ FM GU KI MH MP NC NF NR NU NZ PF PG PN PW SB TK TO TV VU WF WS',
  antarctica: 'AQ GS TF',
};

/**
 * @typedef {object} Continent
 * @property {string} key      Also the translation key under `continents` in i18n.js.
 * @property {string[]} codes  ISO country codes.
 * @property {string} shape    SVG path data for a 32×32 viewBox.
 */

/** @type {Continent[]} */
export const CONTINENTS = Object.entries(MEMBERS).map(([key, codes]) => ({
  key,
  codes: codes.split(' '),
  shape: CONTINENT_SHAPES[key],
}));
