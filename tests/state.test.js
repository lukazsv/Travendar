import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeState } from '../src/state.js';
import { MAX_TRIPS } from '../src/config.js';

test('rejects data that is not a Travendar state', () => {
  for (const raw of [null, undefined, 42, 'text', [], {}, { trips: 'nope' }]) {
    assert.equal(sanitizeState(raw), null, JSON.stringify(raw));
  }
});

test('keeps valid values', () => {
  const raw = {
    year: 2027,
    lang: 'en',
    theme: 'custom',
    custom: { bg: '#112233', text: '#ffffff', accent: '#00ff00' },
    flagStyle: 'twemoji',
    yearAlign: 'right',
    monthAlign: 'center',
    weekSunday: true,
    showSiteUrl: false,
    trips: [{ id: 'abc123', code: 'JP', start: '2027-08-01', end: '2027-08-10' }],
  };
  assert.deepEqual(sanitizeState(raw), raw);
});

test('replaces invalid settings with defaults', () => {
  const s = sanitizeState({
    year: 'soon',
    lang: 'xx',
    theme: 'neon',
    custom: { bg: 'red', text: 5 },
    flagStyle: 'ascii',
    yearAlign: 'diagonal',
    weekSunday: 'yes',
    trips: [],
  });
  assert.equal(typeof s.year, 'number');
  assert.ok(['pl', 'en'].includes(s.lang));
  assert.equal(s.theme, 'dark');
  assert.match(s.custom.bg, /^#[0-9a-f]{6}$/i);
  assert.match(s.custom.text, /^#[0-9a-f]{6}$/i);
  assert.equal(s.flagStyle, 'native');
  assert.equal(s.yearAlign, 'center');
  assert.equal(s.weekSunday, false);
  assert.equal(s.showSiteUrl, true);
});

test('neutralises trips that could inject markup or break rendering', () => {
  const s = sanitizeState({
    trips: [
      { id: '"><img src=x onerror=alert(1)>', code: '__proto__', start: '2026-01-01', end: '2026-01-02' },
      { id: 'ok1', code: '<script>', start: 'tomorrow', end: '2026-01-05' },
      'junk',
      null,
      { id: 'ok1', code: 'PL', start: '2026-02-01', end: '2026-02-02' },
    ],
  });
  assert.equal(s.trips.length, 3);
  for (const trip of s.trips) assert.match(trip.id, /^[a-z0-9]{1,24}$/i);
  assert.equal(new Set(s.trips.map(t => t.id)).size, 3, 'duplicate ids are replaced');
  assert.equal(s.trips[0].code, '');
  assert.equal(s.trips[1].code, '');
  assert.equal(s.trips[1].start, '');
  assert.equal(s.trips[2].code, 'PL');
});

test('limits the number of trips', () => {
  const trips = Array.from({ length: MAX_TRIPS + 50 }, (_, i) => ({
    id: `t${i}`,
    code: 'PL',
    start: '2026-01-01',
    end: '2026-01-01',
  }));
  assert.equal(sanitizeState({ trips }).trips.length, MAX_TRIPS);
});
