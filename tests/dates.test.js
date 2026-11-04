import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toISODate, isISODate, parseISODate, addDays, daysInclusive } from '../src/core/dates.js';

test('isISODate accepts only YYYY-MM-DD strings', () => {
  assert.equal(isISODate('2026-03-01'), true);
  for (const value of ['2026-3-1', '01.03.2026', '', null, undefined, 20260301, '2026-03-01T00:00']) {
    assert.equal(isISODate(value), false, String(value));
  }
});

test('parseISODate and toISODate round-trip as local dates', () => {
  for (const iso of ['2026-01-01', '2026-02-28', '2024-02-29', '2026-12-31']) {
    assert.equal(toISODate(parseISODate(iso)), iso);
  }
});

test('addDays crosses month, year and leap-day boundaries', () => {
  assert.equal(addDays('2026-01-31', 1), '2026-02-01');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2024-02-28', 1), '2024-02-29');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
});

test('addDays is not shifted by daylight-saving changes', () => {
  // Europe moves the clocks on these weekends; the date must still advance by exactly one day.
  assert.equal(addDays('2026-03-28', 1), '2026-03-29');
  assert.equal(addDays('2026-03-29', 1), '2026-03-30');
  assert.equal(addDays('2026-10-24', 7), '2026-10-31');
});

test('daysInclusive counts both ends', () => {
  assert.equal(daysInclusive('2026-01-01', '2026-01-01'), 1);
  assert.equal(daysInclusive('2026-03-28', '2026-04-03'), 7);
  assert.equal(daysInclusive('2026-12-15', '2027-01-03'), 20);
});
