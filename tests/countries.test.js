import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COUNTRY_CODES,
  COUNTRIES,
  COUNTRY_BY_CODE,
  normalizeForSearch,
  flagEmoji,
  sortByName,
} from '../src/core/countries.js';
import { CONTINENTS } from '../src/core/continents.js';

test('country codes are unique two-letter codes', () => {
  assert.equal(new Set(COUNTRY_CODES).size, COUNTRY_CODES.length);
  for (const code of COUNTRY_CODES) assert.match(code, /^[A-Z]{2}$/);
});

test('every country has Polish and English names', () => {
  assert.equal(COUNTRY_BY_CODE.PL.pl, 'Polska');
  assert.equal(COUNTRY_BY_CODE.PL.en, 'Poland');
  for (const c of COUNTRIES) assert.ok(c.pl && c.en, c.code);
});

test('every country belongs to at least one continent, and continents list only known codes', () => {
  const listed = new Set(CONTINENTS.flatMap(c => c.codes));
  for (const code of COUNTRY_CODES) assert.ok(listed.has(code), `${code} is in no continent`);
  for (const continent of CONTINENTS) {
    for (const code of continent.codes) assert.ok(COUNTRY_BY_CODE[code], `${continent.key} lists unknown ${code}`);
    assert.match(continent.shape, /^M[\d. ML]+Z/, `${continent.key} has an outline`);
  }
});

test('search ignores case and Polish diacritics', () => {
  assert.equal(normalizeForSearch('Łódź'), 'lodz');
  assert.equal(normalizeForSearch('ŻÓŁW'), 'zolw');
  assert.ok(COUNTRY_BY_CODE.HU.search.includes(normalizeForSearch('wegry')));
});

test('flagEmoji builds regional-indicator pairs', () => {
  assert.equal(flagEmoji('PL'), '\u{1F1F5}\u{1F1F1}');
});

test('sortByName sorts in the given language without mutating the input', () => {
  const list = ['PL', 'DE', 'AT'].map(code => COUNTRY_BY_CODE[code]);
  assert.deepEqual(
    sortByName(list, 'pl').map(c => c.code),
    ['AT', 'DE', 'PL'],
  ); // Austria, Niemcy, Polska
  assert.deepEqual(
    sortByName(list, 'en').map(c => c.code),
    ['AT', 'DE', 'PL'],
  ); // Austria, Germany, Poland
  assert.deepEqual(
    list.map(c => c.code),
    ['PL', 'DE', 'AT'],
  );
});
