/**
 * Trip list: one card per trip with a country button, start/end dates and a delete button.
 *
 * Dates are chosen in the date range picker (two clicks: start, then end). Adding a trip
 * walks through the country picker and then straight into the date picker.
 * The list is rebuilt by renderTrips() after every change to trips, the year or the language.
 */

import { state, commit, newId } from '../state.js';
import { t } from '../i18n.js';
import { isISODate, parseISODate, toISODate, addDays, daysInclusive } from '../core/dates.js';
import { buildDayMap, travelStats } from '../core/calendar.js';
import { COUNTRY_BY_CODE, countryName } from '../core/countries.js';
import { flagHTML } from '../render/flags.js';
import { openCountryPicker } from './country-picker.js';
import { openDateRangePicker, formatShortDate } from './date-range-picker.js';
import { ICON_CALENDAR, ICON_CHEVRON, ICON_GLOBE, ICON_TRASH } from './icons.js';
import { showToast } from './toast.js';
import { byId, escapeHtml as esc } from '../utils/html.js';

/** Length of a new trip, in days including the first one. */
const NEW_TRIP_DAYS = 7;

/** Example trips loaded from the empty state: [country, 'MM-DD' start, 'MM-DD' end] in the selected year. */
const DEMO_TRIPS = [
  ['ES', '02-02', '02-05'],
  ['IT', '03-11', '03-14'],
  ['IT', '04-01', '04-08'],
  ['NL', '05-05', '05-09'],
  ['ES', '05-20', '05-27'],
  ['AR', '06-29', '07-07'],
  ['JP', '08-08', '08-16'],
  ['KR', '09-01', '09-15'],
  ['EG', '10-22', '10-28'],
  ['SG', '11-27', '12-09'],
  ['TH', '12-15', '12-22'],
];

let listEl, emptyEl, statsEl;

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const findTrip = id => state.trips.find(trip => trip.id === id);

export function initTrips() {
  listEl = byId('trips');
  emptyEl = byId('empty');
  statsEl = byId('stats');

  listEl.addEventListener('click', onListClick);

  byId('addBtn').addEventListener('click', addTrip);
  byId('demoBtn').addEventListener('click', loadDemoTrips);
  byId('clearBtn').addEventListener('click', clearTrips);
}

/** Rebuilds the whole list from state. */
export function renderTrips() {
  emptyEl.hidden = state.trips.length > 0;
  listEl.innerHTML = state.trips.map(tripCard).join('');
  listEl.querySelectorAll('.trip').forEach(li => updateSummary(li, findTrip(li.dataset.id)));
}

/** Updates the "N days · M countries" line next to the list title. */
export function updateStats() {
  const { days, countries } = travelStats(buildDayMap(state.trips, state.year));
  statsEl.textContent = days ? `${t('days')(days)} · ${t('countries')(countries)}` : '';
}

/** @param {import('../state.js').Trip} trip */
function tripCard(trip) {
  const country = COUNTRY_BY_CODE[trip.code];
  const name = country ? countryName(country, state.lang) : '';
  const label = country
    ? `${flagHTML(country.code)}<span class="cname">${esc(name)}</span>`
    : `${ICON_GLOBE}<span class="cname muted">${esc(t('chooseCountry'))}</span>`;
  return `<li class="card trip" data-id="${esc(trip.id)}">
    <div class="trip-top">
      <button class="country-btn" type="button" data-act="pick" aria-label="${esc(t('countryLabel')(name || t('notChosen')))}">${label}${ICON_CHEVRON}</button>
      <button class="icon-btn" type="button" data-act="delete" aria-label="${esc(t('deleteTrip'))}">${ICON_TRASH}</button>
    </div>
    <div class="dates">
      ${dateButton(trip, 'start', t('from'))}
      ${dateButton(trip, 'end', t('to'))}
    </div>
    <div class="trip-meta"></div>
  </li>`;
}

/** One of the two date fields of a card; both open the range picker. */
function dateButton(trip, part, label) {
  const value = isISODate(trip[part]) ? formatShortDate(trip[part]) : '';
  return `<button class="date-field" type="button" data-act="dates" data-part="${part}" aria-label="${esc(`${label}: ${value || t('noDate')}`)}">
    <span class="date-label">${esc(label)}</span>
    <span class="date-value${value ? '' : ' empty'}">${esc(value || t('noDate'))}${ICON_CALENDAR}</span>
  </button>`;
}

/** The small line under a trip: its length, or what is missing / wrong. */
function updateSummary(li, trip) {
  const el = li.querySelector('.trip-meta');
  el.classList.remove('err');
  if (!isISODate(trip.start) || !isISODate(trip.end)) {
    el.textContent = t('fillDates');
    return;
  }
  if (trip.end < trip.start) {
    el.textContent = t('endBeforeStart');
    el.classList.add('err');
    return;
  }
  const parts = [t('days')(daysInclusive(trip.start, trip.end))];
  const y = state.year;
  if (trip.end < `${y}-01-01` || trip.start > `${y}-12-31`) parts.push(t('outsideYear')(y));
  if (!trip.code) parts.push(t('pickCountryHint'));
  el.textContent = parts.join(' · ');
}

function onListClick(e) {
  const button = e.target.closest('[data-act]');
  if (!button) return;
  const id = button.closest('.trip').dataset.id;
  if (button.dataset.act === 'pick') pickCountryFor(id);
  if (button.dataset.act === 'dates') pickDatesFor(id, button.dataset.part);
  if (button.dataset.act === 'delete') deleteTrip(id);
}

/** Deletes one trip, with Undo putting it back in the same place. */
function deleteTrip(id) {
  const index = state.trips.findIndex(trip => trip.id === id);
  if (index < 0) return;
  const [removed] = state.trips.splice(index, 1);
  commit({ trips: true });
  showToast(t('tripDeleted'), {
    actionLabel: t('undo'),
    onAction: () => {
      state.trips.splice(Math.min(index, state.trips.length), 0, removed);
      commit({ trips: true });
    },
  });
}

/** @param {{ thenDates?: boolean }} [options]  continue with the date picker (new trips) */
function pickCountryFor(tripId, { thenDates = false } = {}) {
  const usedCodes = [...new Set(state.trips.map(trip => trip.code).filter(Boolean))];
  openCountryPicker({
    usedCodes,
    onPick: code => {
      const trip = findTrip(tripId);
      if (!trip) return;
      trip.code = code;
      commit({ trips: true });
      if (thenDates) pickDatesFor(tripId, 'start');
    },
  });
}

/** @param {'start'|'end'} part  which date the user clicked; the picker starts by setting it */
function pickDatesFor(tripId, part) {
  const trip = findTrip(tripId);
  if (!trip) return;
  openDateRangePicker({
    start: trip.start,
    end: trip.end,
    focus: part,
    onApply: (start, end) => {
      Object.assign(trip, { start, end });
      commit({ trips: true });
    },
  });
}

/**
 * Adds a trip and walks through the country picker and then the date picker. Until the user
 * picks dates, it gets sensible defaults:
 * the day after the latest trip ends (if that is in the selected year), else today
 * (if the selected year is the current one), else 1 January.
 */
function addTrip() {
  const year = state.year;
  const lastDay = `${year}-12-31`;
  const latestEnd = state.trips
    .map(trip => trip.end)
    .filter(isISODate)
    .sort()
    .pop();
  const today = new Date();

  let start;
  if (latestEnd && parseISODate(latestEnd).getFullYear() === year && latestEnd < lastDay) start = addDays(latestEnd, 1);
  else if (today.getFullYear() === year) start = toISODate(today);
  else start = `${year}-01-01`;

  let end = addDays(start, NEW_TRIP_DAYS - 1);
  if (end > lastDay && start <= lastDay) end = lastDay; // don't spill into next year

  const trip = { id: newId(), code: '', start, end };
  state.trips.push(trip);
  commit({ trips: true });

  listEl
    .querySelector(`[data-id="${trip.id}"]`)
    ?.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
  pickCountryFor(trip.id, { thenDates: true });
}

function loadDemoTrips() {
  const year = state.year;
  state.trips = DEMO_TRIPS.map(([code, start, end]) => ({
    id: newId(),
    code,
    start: `${year}-${start}`,
    end: `${year}-${end}`,
  }));
  commit({ trips: true });
}

/** Removes all trips; Undo restores them (instead of an "are you sure?" dialog). */
function clearTrips() {
  if (!state.trips.length) return;
  const previous = state.trips;
  state.trips = [];
  commit({ trips: true });
  showToast(t('tripsCleared'), {
    actionLabel: t('undo'),
    onAction: () => {
      state.trips = previous;
      commit({ trips: true });
    },
  });
}
