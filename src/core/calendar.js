/**
 * Trip → calendar logic. Pure functions with no DOM access, easy to test in isolation.
 */

import { isISODate, parseISODate } from './dates.js';

/** Safety cap so a typo like year 20026 cannot freeze the page. */
const MAX_TRIP_DAYS = 1500;

/** Key used for a day in the day map: month (0–11) × 100 + day of month. */
export const dayKey = (month, day) => month * 100 + day;

/**
 * A trip is drawn only when it has a country and a valid date range.
 * @param {import('../state.js').Trip} trip
 */
export function isCompleteTrip(trip) {
  return Boolean(trip.code) && isISODate(trip.start) && isISODate(trip.end) && trip.end >= trip.start;
}

/**
 * Which country to show on each day of `year`.
 *
 * Trips are applied in order of their start date, so when two trips share a day
 * (the day you travel from one country to the next) the one that starts later wins.
 *
 * @param {import('../state.js').Trip[]} trips
 * @param {number} year
 * @returns {Map<number, string>} dayKey(month, day) → country code
 */
export function buildDayMap(trips, year) {
  const map = new Map();
  const ordered = trips.filter(isCompleteTrip).sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  for (const trip of ordered) {
    const day = parseISODate(trip.start);
    const end = parseISODate(trip.end);
    for (let i = 0; day <= end && i < MAX_TRIP_DAYS; i++) {
      if (day.getFullYear() === year) map.set(dayKey(day.getMonth(), day.getDate()), trip.code);
      day.setDate(day.getDate() + 1);
    }
  }
  return map;
}

/**
 * @param {Map<number, string>} dayMap  Result of buildDayMap().
 * @returns {{ days: number, countries: number }} travel days and distinct countries
 */
export function travelStats(dayMap) {
  return { days: dayMap.size, countries: new Set(dayMap.values()).size };
}
