/**
 * Date range picker dialog, used instead of the browser's date inputs.
 *
 * Works like flight-search sites: it opens straight on a calendar, the first click sets
 * the start and the second the end; the dialog then closes and applies the range.
 * Closing it any other way (✕, Esc, backdrop) discards an unfinished selection.
 * Shows two months side by side on wide screens and one on phones; changing months is
 * instant (no animation). Keyboard: arrows move by day/week, PageUp/PageDown by month,
 * Enter/Space selects.
 *
 * Usage: openDateRangePicker({ start, end, focus: 'start' | 'end', onApply: (start, end) => … }).
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import { isISODate, parseISODate, toISODate, addDays } from '../core/dates.js';
import { firstColumnOfMonth, daysInMonth } from '../core/calendar.js';
import { selectDay, highlightedRange } from '../core/date-range.js';
import { byId, escapeHtml as esc } from '../utils/html.js';

const WIDE_LAYOUT = '(min-width: 720px)';

let dialog, monthsEl, titleEl, startEl, endEl;

/** @type {(import('../core/date-range.js').RangeSelection & { onApply: Function }) | null} */
let session = null;
/** First day of the first visible month. */
let viewMonth = new Date();
/** Day that holds keyboard focus ('YYYY-MM-DD'). */
let focusDay = null;
/** Day under the mouse pointer, for the range preview. */
let hoverDay = null;

export function initDateRangePicker() {
  dialog = byId('datePicker');
  monthsEl = byId('dpMonths');
  titleEl = byId('datePickerTitle');
  startEl = byId('dpStart');
  endEl = byId('dpEnd');

  byId('datePickerClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close(); // backdrop
  });
  dialog.addEventListener('close', () => {
    session = null;
  });
  byId('dpPrev').addEventListener('click', () => shiftMonths(-1));
  byId('dpNext').addEventListener('click', () => shiftMonths(1));

  monthsEl.addEventListener('click', e => {
    const day = e.target.closest('.day');
    if (day) pick(day.dataset.date);
  });
  monthsEl.addEventListener('mouseover', e => {
    const day = e.target.closest('.day')?.dataset.date ?? null;
    if (day !== hoverDay) {
      hoverDay = day;
      paintRange();
    }
  });
  monthsEl.addEventListener('mouseleave', () => {
    hoverDay = null;
    paintRange();
  });
  monthsEl.addEventListener('keydown', onKeyDown);
  // Re-layout between one and two months when the window crosses the breakpoint.
  matchMedia(WIDE_LAYOUT).addEventListener('change', () => {
    if (dialog.open) render();
  });
}

/**
 * @param {{ start?: string, end?: string, focus?: 'start'|'end', onApply: (start: string, end: string) => void }} options
 */
export function openDateRangePicker({ start, end, focus = 'start', onApply }) {
  const validStart = isISODate(start) ? start : null;
  const validEnd = isISODate(end) && validStart && end >= validStart ? end : null;
  session = {
    start: validStart,
    end: validEnd,
    selecting: focus === 'end' && validStart ? 'end' : 'start',
    onApply,
  };
  // Start on the month of the date being changed (or of the selected year).
  const today = toISODate(new Date());
  focusDay =
    (session.selecting === 'end' ? validEnd || validStart : validStart) ||
    (new Date().getFullYear() === state.year ? today : `${state.year}-01-01`);
  viewMonth = monthStart(focusDay);
  hoverDay = null;

  dialog.showModal();
  render();
  if (matchMedia('(pointer: fine)').matches) focusDayButton();
  else titleEl.focus(); // touch: announce the title instead of popping up focus rings
}

/** Re-renders an open picker (e.g. after the UI language changed). */
export function refreshDateRangePicker() {
  if (dialog?.open && session) render();
}

// ---- Selection ----

function pick(day) {
  const next = selectDay(session, day);
  Object.assign(session, { start: next.start, end: next.end, selecting: next.selecting });
  focusDay = day;
  if (next.done) {
    const { onApply, start, end } = session;
    dialog.close();
    onApply(start, end);
    return;
  }
  updateHeader();
  paintRange();
}

// ---- Rendering ----

const monthStart = iso => {
  const d = parseISODate(iso);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};
const addMonths = (date, n) => new Date(date.getFullYear(), date.getMonth() + n, 1);
const visibleMonths = () => (matchMedia(WIDE_LAYOUT).matches ? 2 : 1);

function formatter(options) {
  return new Intl.DateTimeFormat(state.lang, options);
}

/** '2 lut 2026' / '2 Feb 2026' */
export function formatShortDate(iso) {
  return formatter({ day: 'numeric', month: 'short', year: 'numeric' }).format(parseISODate(iso));
}

function render() {
  const weekdays = t('weekdays');
  const headings = state.weekSunday ? [weekdays[6], ...weekdays.slice(0, 6)] : weekdays;
  const monthTitle = formatter({ month: 'long', year: 'numeric' });
  const fullDate = formatter({ dateStyle: 'full' });
  const today = toISODate(new Date());

  // Keep the focused day inside the visible months.
  const first = toISODate(viewMonth);
  const last = toISODate(new Date(addMonths(viewMonth, visibleMonths()) - 1));
  if (!focusDay || focusDay < first || focusDay > last) focusDay = first;

  let html = '';
  for (let i = 0; i < visibleMonths(); i++) {
    const month = addMonths(viewMonth, i);
    const y = month.getFullYear();
    const m = month.getMonth();
    const title = monthTitle.format(month);
    html += `<section class="dp-month" aria-label="${esc(title)}">
      <h3 class="dp-month-title">${esc(title.charAt(0).toUpperCase() + title.slice(1))}</h3>
      <div class="dp-grid">
        ${headings.map(w => `<span class="dp-weekday" aria-hidden="true">${esc(w)}</span>`).join('')}
        ${'<span class="dp-cell"></span>'.repeat(firstColumnOfMonth(y, m, state.weekSunday))}`;
    for (let d = 1; d <= daysInMonth(y, m); d++) {
      const iso = toISODate(new Date(y, m, d));
      const isToday = iso === today;
      html += `<span class="dp-cell" data-cell="${iso}"><button type="button" class="day${isToday ? ' today' : ''}"
        data-date="${iso}" tabindex="${iso === focusDay ? 0 : -1}" aria-label="${esc(fullDate.format(new Date(y, m, d)))}"
        ${isToday ? 'aria-current="date"' : ''}>${d}</button></span>`;
    }
    html += '</div></section>';
  }
  monthsEl.innerHTML = html;
  monthsEl.dataset.count = String(visibleMonths());
  updateHeader();
  paintRange();
}

/** Title and the From / To summary above the calendar. */
function updateHeader() {
  titleEl.textContent = session.selecting === 'start' ? t('pickStartDate') : t('pickEndDate');
  startEl.textContent = session.start ? formatShortDate(session.start) : '—';
  endEl.textContent = session.end ? formatShortDate(session.end) : '—';
  startEl.parentElement.classList.toggle('active', session.selecting === 'start');
  endEl.parentElement.classList.toggle('active', session.selecting === 'end');
}

/** Updates the range classes in place (no re-render, so focus and hover are kept). */
function paintRange() {
  if (!session) return;
  const { from, to } = highlightedRange(session, hoverDay);
  for (const cell of monthsEl.querySelectorAll('[data-cell]')) {
    const day = cell.dataset.cell;
    const isStart = day === from;
    const isEnd = day === to;
    cell.classList.toggle('endpoint', isStart || isEnd);
    cell.classList.toggle('in-range', Boolean(from && to && from !== to && day >= from && day <= to));
    cell.classList.toggle('range-start', Boolean(isStart && to && to !== from));
    cell.classList.toggle('range-end', Boolean(isEnd && from && to !== from));
    cell.firstElementChild.setAttribute('aria-pressed', String(isStart || isEnd));
  }
}

// ---- Navigation ----

function shiftMonths(n) {
  viewMonth = addMonths(viewMonth, n);
  focusDay = toISODate(addMonths(viewMonth, 0)); // first day of the new view
  render();
}

function focusDayButton() {
  monthsEl.querySelector(`.day[data-date="${focusDay}"]`)?.focus();
}

const KEY_STEPS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

function onKeyDown(e) {
  const current = e.target.closest('.day')?.dataset.date;
  if (!current) return;
  let next;
  if (e.key in KEY_STEPS) next = addDays(current, KEY_STEPS[e.key]);
  else if (e.key === 'PageUp' || e.key === 'PageDown') {
    const d = parseISODate(current);
    const target = new Date(d.getFullYear(), d.getMonth() + (e.key === 'PageUp' ? -1 : 1), 1);
    next = toISODate(
      new Date(
        target.getFullYear(),
        target.getMonth(),
        Math.min(d.getDate(), daysInMonth(target.getFullYear(), target.getMonth())),
      ),
    );
  } else return;
  e.preventDefault();

  focusDay = next;
  const first = toISODate(viewMonth);
  const last = toISODate(new Date(addMonths(viewMonth, visibleMonths()) - 1));
  if (next < first || next > last) {
    viewMonth = next < first ? monthStart(next) : addMonths(monthStart(next), 1 - visibleMonths());
    render();
  } else {
    monthsEl.querySelectorAll('.day[tabindex="0"]').forEach(b => (b.tabIndex = -1));
    monthsEl.querySelector(`.day[data-date="${next}"]`).tabIndex = 0;
  }
  focusDayButton();
}
