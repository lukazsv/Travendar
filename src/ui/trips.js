/**
 * Trip list: one card per trip with a country button, start/end dates and a delete button.
 *
 * The list is rebuilt by renderTrips() when trips are added/removed or their country,
 * the year or the language changes. Typing a date does NOT rebuild it (that would steal
 * focus from the date input); only that card's summary line is updated.
 */

import { state, commit, newId } from '../state.js';
import { t } from '../i18n.js';
import { isISODate, parseISODate, toISODate, addDays, daysInclusive } from '../core/dates.js';
import { buildDayMap, travelStats } from '../core/calendar.js';
import { COUNTRY_BY_CODE } from '../core/countries.js';
import { flagHTML } from '../render/flags.js';
import { openCountryPicker } from './country-picker.js';
import { ICON_CHEVRON, ICON_GLOBE, ICON_TRASH } from './icons.js';
import { byId, escapeHtml as esc } from '../utils/html.js';

/** Length of a new trip, in days including the first one. */
const NEW_TRIP_DAYS = 7;

/** Example trips loaded from the empty state: [country, 'MM-DD' start, 'MM-DD' end] in the selected year. */
const DEMO_TRIPS = [
  ['ES', '02-02', '02-05'], ['IT', '03-11', '03-14'], ['IT', '04-01', '04-08'],
  ['NL', '05-05', '05-09'], ['ES', '05-20', '05-27'], ['AR', '06-29', '07-07'],
  ['JP', '08-08', '08-16'], ['KR', '09-01', '09-15'], ['EG', '10-22', '10-28'],
  ['SG', '11-27', '12-09'], ['TH', '12-15', '12-22'],
];

let listEl, emptyEl, statsEl;

const findTrip = id => state.trips.find(trip => trip.id === id);

export function initTrips() {
  listEl = byId('trips');
  emptyEl = byId('empty');
  statsEl = byId('stats');

  listEl.addEventListener('click', onListClick);
  listEl.addEventListener('input', onDateInput);
  listEl.addEventListener('change', onDateInput);

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
  const name = country ? country[state.lang] : '';
  const label = country
    ? `${flagHTML(country.code)}<span class="cname">${esc(name)}</span>`
    : `${ICON_GLOBE}<span class="cname muted">${esc(t('chooseCountry'))}</span>`;
  return `<li class="card trip" data-id="${trip.id}">
    <div class="trip-top">
      <button class="country-btn" type="button" data-act="pick" aria-label="${esc(t('countryLabel')(name || t('notChosen')))}">${label}${ICON_CHEVRON}</button>
      <button class="icon-btn" type="button" data-act="delete" aria-label="${esc(t('deleteTrip'))}">${ICON_TRASH}</button>
    </div>
    <div class="dates">
      <label class="field"><span>${esc(t('from'))}</span><input type="date" data-field="start" value="${esc(trip.start || '')}"></label>
      <label class="field"><span>${esc(t('to'))}</span><input type="date" data-field="end" value="${esc(trip.end || '')}" min="${esc(trip.start || '')}"></label>
    </div>
    <div class="trip-meta"></div>
  </li>`;
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
  if (button.dataset.act === 'delete') {
    state.trips = state.trips.filter(trip => trip.id !== id);
    commit({ trips: true });
  }
}

function onDateInput(e) {
  const input = e.target.closest('input[data-field]');
  if (!input) return;
  const li = input.closest('.trip');
  const trip = findTrip(li.dataset.id);
  trip[input.dataset.field] = input.value;

  // Moving the start past the end drags the end along, so the range stays valid.
  if (input.dataset.field === 'start') {
    const endInput = li.querySelector('[data-field="end"]');
    endInput.min = input.value;
    if (isISODate(input.value) && (!isISODate(trip.end) || trip.end < input.value)) {
      trip.end = input.value;
      endInput.value = input.value;
    }
  }
  updateSummary(li, trip);
  commit();
}

function pickCountryFor(tripId) {
  const usedCodes = [...new Set(state.trips.map(trip => trip.code).filter(Boolean))];
  openCountryPicker({
    usedCodes,
    onPick: code => {
      const trip = findTrip(tripId);
      if (!trip) return;
      trip.code = code;
      commit({ trips: true });
    },
  });
}

/**
 * Adds a trip with sensible default dates and opens the country picker for it:
 * the day after the latest trip ends (if that is in the selected year), else today
 * (if the selected year is the current one), else 1 January.
 */
function addTrip() {
  const year = state.year;
  const lastDay = `${year}-12-31`;
  const latestEnd = state.trips.map(trip => trip.end).filter(isISODate).sort().pop();
  const today = new Date();

  let start;
  if (latestEnd && parseISODate(latestEnd).getFullYear() === year && latestEnd < lastDay) start = addDays(latestEnd, 1);
  else if (today.getFullYear() === year) start = toISODate(today);
  else start = `${year}-01-01`;

  let end = addDays(start, NEW_TRIP_DAYS - 1);
  if (end > lastDay && start <= lastDay) end = lastDay;   // don't spill into next year

  const trip = { id: newId(), code: '', start, end };
  state.trips.push(trip);
  commit({ trips: true });

  listEl.querySelector(`[data-id="${trip.id}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  pickCountryFor(trip.id);
}

function loadDemoTrips() {
  const year = state.year;
  state.trips = DEMO_TRIPS.map(([code, start, end]) => ({ id: newId(), code, start: `${year}-${start}`, end: `${year}-${end}` }));
  commit({ trips: true });
}

function clearTrips() {
  if (!state.trips.length || !confirm(t('confirmClear'))) return;
  state.trips = [];
  commit({ trips: true });
}
