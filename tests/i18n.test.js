import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TRANSLATIONS } from '../src/i18n.js';
import { LANGUAGES } from '../src/config.js';

const kinds = dict => Object.fromEntries(Object.entries(dict).map(([key, value]) => [key, typeof value]));

test('every UI language has a translation file and a menu entry', () => {
  assert.deepEqual(Object.keys(TRANSLATIONS).sort(), LANGUAGES.map(l => l.code).sort());
  for (const lang of LANGUAGES) {
    assert.ok(lang.name && lang.flag, lang.code);
    assert.ok(['ltr', 'rtl'].includes(lang.dir), lang.code);
  }
});

test('every language defines the same keys with the same kinds of values', () => {
  const { en } = TRANSLATIONS;
  for (const [lang, dict] of Object.entries(TRANSLATIONS)) {
    assert.deepEqual(kinds(dict), kinds(en), lang);
    assert.deepEqual(Object.keys(dict.continents).sort(), Object.keys(en.continents).sort(), lang);
    assert.equal(dict.months.length, 12, `${lang}.months`);
    assert.equal(dict.weekdays.length, 7, `${lang}.weekdays`);
    for (const [key, value] of Object.entries(dict)) {
      if (typeof value === 'string') assert.ok(value.trim(), `${lang}.${key} is empty`);
    }
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

test('plurals and interpolated texts produce text containing the number', () => {
  for (const [lang, dict] of Object.entries(TRANSLATIONS)) {
    for (const n of [0, 1, 2, 3, 5, 11, 21, 22, 100]) {
      for (const key of ['days', 'countries']) {
        const text = dict[key](n);
        assert.equal(typeof text, 'string', `${lang}.${key}(${n})`);
        assert.ok(!text.includes('{n}'), `${lang}.${key}(${n}) = ${text}`);
      }
    }
    assert.ok(dict.outsideYear(2026).includes('2026'), `${lang}.outsideYear`);
    assert.ok(dict.countryLabel('X').includes('X'), `${lang}.countryLabel`);
    assert.equal(dict.donatePitch.split('{flag}').length, 2, `${lang}.donatePitch needs one {flag}`);
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

test('Russian, Ukrainian and Arabic plurals', () => {
  assert.equal(TRANSLATIONS.ru.days(1), '1 день');
  assert.equal(TRANSLATIONS.ru.days(3), '3 дня');
  assert.equal(TRANSLATIONS.ru.days(5), '5 дней');
  assert.equal(TRANSLATIONS.ru.days(21), '21 день');
  assert.equal(TRANSLATIONS.uk.countries(2), '2 країни');
  assert.equal(TRANSLATIONS.uk.countries(11), '11 країн');
  assert.equal(TRANSLATIONS.ar.days(2), 'يومان');
  assert.equal(TRANSLATIONS.ar.days(3), '3 أيام');
  assert.equal(TRANSLATIONS.ar.days(11), '11 يومًا');
});
