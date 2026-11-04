import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectLanguage } from '../src/core/language.js';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../src/config.js';

const SUPPORTED = LANGUAGES.map(l => l.code);
const detect = preferred => detectLanguage(preferred, SUPPORTED, DEFAULT_LANGUAGE);

test('uses the first supported preference, matched on the main language', () => {
  assert.equal(detect(['de-AT', 'en-US']), 'de');
  assert.equal(detect(['pt-BR']), 'pt');
  assert.equal(detect(['uk-UA', 'ru-RU']), 'uk');
  assert.equal(detect(['ar-EG']), 'ar');
  assert.equal(detect(['HI']), 'hi');
});

test('skips unsupported preferences', () => {
  assert.equal(detect(['nl-NL', 'fr-BE', 'en']), 'fr');
  assert.equal(detect(['sv', 'ja-JP']), 'ja');
});

test('Simplified Chinese only: Traditional Chinese falls through', () => {
  assert.equal(detect(['zh-CN']), 'zh');
  assert.equal(detect(['zh']), 'zh');
  assert.equal(detect(['zh-Hans-SG']), 'zh');
  assert.equal(detect(['zh-TW', 'en']), 'en');
  assert.equal(detect(['zh-Hant-HK', 'ja']), 'ja');
  assert.equal(detect(['zh-HK']), 'en');
});

test('falls back to English when nothing matches or preferences are unknown', () => {
  assert.equal(detect(['nl', 'sv-SE']), 'en');
  assert.equal(detect([]), 'en');
  assert.equal(detect(undefined), 'en');
  assert.equal(detect(['', null]), 'en');
});
