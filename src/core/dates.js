/**
 * Date helpers for 'YYYY-MM-DD' strings (the value format of <input type="date">).
 *
 * Dates are handled as local calendar days, never as UTC instants, so time zones and
 * DST changes cannot shift a trip by a day. ISO strings also compare correctly as
 * plain strings ('2026-03-01' < '2026-03-10').
 */

const pad = n => String(n).padStart(2, '0');

/** @param {Date} date  @returns {string} 'YYYY-MM-DD' */
export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** True for a well-formed 'YYYY-MM-DD' string. */
export function isISODate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** @param {string} iso 'YYYY-MM-DD'  @returns {Date} local midnight of that day */
export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** @returns {string} `iso` moved by `days` (may be negative). */
export function addDays(iso, days) {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Number of days from `start` to `end`, both included ('2026-01-01'..'2026-01-01' → 1). */
export function daysInclusive(start, end) {
  return Math.round((parseISODate(end) - parseISODate(start)) / 86_400_000) + 1;
}
