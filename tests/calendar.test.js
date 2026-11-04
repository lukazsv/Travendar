import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDayMap, dayKey, isCompleteTrip, travelStats } from '../src/core/calendar.js';

const trip = (code, start, end, id = code + start) => ({ id, code, start, end });

test('isCompleteTrip needs a country and a valid, ordered date range', () => {
  assert.equal(isCompleteTrip(trip('PL', '2026-01-01', '2026-01-02')), true);
  assert.equal(isCompleteTrip(trip('', '2026-01-01', '2026-01-02')), false);
  assert.equal(isCompleteTrip(trip('PL', '2026-01-03', '2026-01-02')), false);
  assert.equal(isCompleteTrip(trip('PL', '', '2026-01-02')), false);
});

test('every day of a trip is mapped, ends included', () => {
  const map = buildDayMap([trip('IT', '2026-04-01', '2026-04-03')], 2026);
  assert.deepEqual(
    [...map.entries()],
    [
      [dayKey(3, 1), 'IT'],
      [dayKey(3, 2), 'IT'],
      [dayKey(3, 3), 'IT'],
    ],
  );
});

test('only days inside the selected year are mapped', () => {
  const t = trip('TH', '2026-12-30', '2027-01-02');
  assert.deepEqual([...buildDayMap([t], 2026).keys()], [dayKey(11, 30), dayKey(11, 31)]);
  assert.deepEqual([...buildDayMap([t], 2027).keys()], [dayKey(0, 1), dayKey(0, 2)]);
  assert.equal(buildDayMap([t], 2025).size, 0);
});

test('on a shared day the trip that starts later wins, regardless of list order', () => {
  const first = trip('ES', '2026-05-01', '2026-05-05');
  const second = trip('PT', '2026-05-05', '2026-05-08');
  for (const order of [
    [first, second],
    [second, first],
  ]) {
    assert.equal(buildDayMap(order, 2026).get(dayKey(4, 5)), 'PT');
  }
});

test('incomplete trips are ignored', () => {
  const map = buildDayMap([trip('', '2026-01-01', '2026-01-05'), trip('PL', '2026-02-05', '2026-02-01')], 2026);
  assert.equal(map.size, 0);
});

test('a mistyped far-future end date cannot hang the page', () => {
  const map = buildDayMap([trip('PL', '2026-01-01', '9999-12-31')], 2026);
  assert.equal(map.size, 365);
});

test('travelStats counts days and distinct countries', () => {
  const map = buildDayMap(
    [
      trip('IT', '2026-04-01', '2026-04-03'),
      trip('IT', '2026-06-01', '2026-06-02'),
      trip('JP', '2026-08-01', '2026-08-01'),
    ],
    2026,
  );
  assert.deepEqual(travelStats(map), { days: 6, countries: 2 });
});
