import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TRANSLATIONS } from '../src/i18n.js';
import { LANGUAGES } from '../src/config.js';

const kinds = dict => Object.fromEntries(Object.entries(dict).map(([key, value]) => [key, typeof value]));

test('every UI language has a translation block', () => {
  assert.deepEqual(Object.keys(TRANSLATIONS).sort(), LANGUAGES.map(l => l.code).sort());
});

test('every language defines the same keys with the same kinds of values', () => {
  const [first, ...rest] = Object.values(TRANSLATIONS);
  for (const other of rest) assert.deepEqual(kinds(other), kinds(first));
  for (const dict of Object.values(TRANSLATIONS)) {
    assert.deepEqual(Object.keys(dict.continents).sort(), Object.keys(first.continents).sort());
    assert.equal(dict.months.length, 12);
  }
});

test('every key used in index.html exists', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const used = new Set([...html.matchAll(/data-i18n(?:-aria|-ph)?="(\w+)"/g)].map(m => m[1]));
  assert.ok(used.size > 20);
  for (const [lang, dict] of Object.entries(TRANSLATIONS)) {
    for (const key of used) assert.equal(typeof dict[key], 'string', `${lang}.${key}`);
  }
});

test('Polish plurals', () => {
  const { countries, days } = TRANSLATIONS.pl;
  assert.equal(countries(1), '1 kraj');
  assert.equal(countries(3), '3 kraje');
  assert.equal(countries(5), '5 krajów');
  assert.equal(countries(12), '12 krajów');
  assert.equal(countries(22), '22 kraje');
  assert.equal(days(1), '1 dzień');
  assert.equal(days(2), '2 dni');
});
