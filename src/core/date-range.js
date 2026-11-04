/**
 * Selecting a date range with two clicks, like on flight-search sites:
 * the first click sets the start, the second the end. Pure functions, no DOM.
 */

/**
 * @typedef {object} RangeSelection
 * @property {string|null} start          'YYYY-MM-DD'
 * @property {string|null} end            'YYYY-MM-DD'
 * @property {'start'|'end'} selecting    Which end the next click sets.
 */

/**
 * Applies a click on `day`.
 *  - Choosing the start clears the end and waits for it.
 *  - Choosing the end on a day before the start moves the start there instead (and keeps waiting).
 *  - Choosing the end on or after the start completes the range: `done` is true.
 * Clicking the same day twice gives a one-day range.
 *
 * @param {RangeSelection} selection
 * @param {string} day  'YYYY-MM-DD'
 * @returns {RangeSelection & { done: boolean }}
 */
export function selectDay(selection, day) {
  const { start, selecting } = selection;
  if (selecting === 'start' || !start || day < start) {
    return { start: day, end: null, selecting: 'end', done: false };
  }
  return { start, end: day, selecting: 'start', done: true };
}

/**
 * The range to highlight: the chosen one, or — while the end is being chosen — from the
 * start to the day under the pointer.
 * @param {RangeSelection} selection
 * @param {string|null} hovered
 * @returns {{ from: string|null, to: string|null }}
 */
export function highlightedRange({ start, end, selecting }, hovered) {
  if (selecting === 'end' && start && hovered && hovered >= start) return { from: start, to: hovered };
  return { from: start, to: end };
}
