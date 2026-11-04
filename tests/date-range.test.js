import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectDay, highlightedRange } from '../src/core/date-range.js';
import { firstColumnOfMonth, daysInMonth } from '../src/core/calendar.js';

test('first click sets the start and waits for the end', () => {
  const s = selectDay({ start: '2026-01-01', end: '2026-01-05', selecting: 'start' }, '2026-03-10');
  assert.deepEqual(s, { start: '2026-03-10', end: null, selecting: 'end', done: false });
});

test('second click on a later day completes the range', () => {
  const s = selectDay({ start: '2026-03-10', end: null, selecting: 'end' }, '2026-03-14');
  assert.deepEqual(s, { start: '2026-03-10', end: '2026-03-14', selecting: 'start', done: true });
});

test('clicking the same day twice gives a one-day trip', () => {
  const s = selectDay({ start: '2026-03-10', end: null, selecting: 'end' }, '2026-03-10');
  assert.equal(s.done, true);
  assert.equal(s.end, '2026-03-10');
});

test('choosing an end before the start moves the start instead', () => {
  const s = selectDay({ start: '2026-03-10', end: null, selecting: 'end' }, '2026-03-02');
  assert.deepEqual(s, { start: '2026-03-02', end: null, selecting: 'end', done: false });
});

test('choosing the end without a start behaves like choosing the start', () => {
  const s = selectDay({ start: null, end: null, selecting: 'end' }, '2026-03-02');
  assert.equal(s.start, '2026-03-02');
  assert.equal(s.done, false);
});

test('highlight follows the pointer only while the end is being chosen', () => {
  assert.deepEqual(highlightedRange({ start: '2026-03-10', end: null, selecting: 'end' }, '2026-03-12'), {
    from: '2026-03-10',
    to: '2026-03-12',
  });
  assert.deepEqual(highlightedRange({ start: '2026-03-10', end: null, selecting: 'end' }, '2026-03-01'), {
    from: '2026-03-10',
    to: null,
  });
  assert.deepEqual(highlightedRange({ start: '2026-03-10', end: '2026-03-15', selecting: 'start' }, '2026-03-20'), {
    from: '2026-03-10',
    to: '2026-03-15',
  });
});

test('month grid helpers', () => {
  // 1 November 2026 is a Sunday.
  assert.equal(firstColumnOfMonth(2026, 10, false), 6);
  assert.equal(firstColumnOfMonth(2026, 10, true), 0);
  assert.equal(daysInMonth(2026, 1), 28);
  assert.equal(daysInMonth(2024, 1), 29);
  assert.equal(daysInMonth(2026, 11), 31);
});
