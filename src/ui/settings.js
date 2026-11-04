/**
 * Settings column: year, image theme (with custom colours), Advanced options,
 * and the phone-only Customize button that folds the settings away.
 */

import { YEAR_MIN, YEAR_MAX } from '../config.js';
import { state, commit, themeColors } from '../state.js';
import { SUPPORTS_EMOJI_FLAGS } from '../render/flags.js';
import { byId } from '../utils/html.js';

export function initSettings() {
  initYear();
  initTheme();
  initAdvanced();
  initCustomizeToggle();
}

// ---- Year ----

function initYear() {
  const output = byId('yearOut');
  output.textContent = state.year;
  const setYear = year => {
    state.year = Math.max(YEAR_MIN, Math.min(YEAR_MAX, year));
    output.textContent = state.year;
    commit({ year: true });
  };
  byId('yearPrev').addEventListener('click', () => setYear(state.year - 1));
  byId('yearNext').addEventListener('click', () => setYear(state.year + 1));
}

// ---- Theme ----

let customPanel;
let colorInputs = [];

function initTheme() {
  customPanel = byId('customColors');
  colorInputs = [...document.querySelectorAll('input[data-color]')];

  document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.checked = radio.value === state.theme;
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      // Custom starts from the colours of the theme in use, so the user only changes what they want.
      if (radio.value === 'custom' && state.theme !== 'custom') {
        state.custom = { ...themeColors(state.theme) };
        syncColorInputs();
      }
      state.theme = radio.value;
      syncCustomPanel();
      commit();
    });
  });

  colorInputs.forEach(input => {
    input.addEventListener('input', () => {
      state.custom[input.dataset.color] = input.value;
      hexLabel(input).textContent = input.value;
      commit();
    });
  });

  syncColorInputs();
  syncCustomPanel();
}

const hexLabel = input => document.querySelector(`[data-hex="${input.dataset.color}"]`);

function syncColorInputs() {
  colorInputs.forEach(input => {
    input.value = state.custom[input.dataset.color];
    hexLabel(input).textContent = input.value;
  });
}

/** Slides the colour pickers open only for the Custom theme; keeps them out of the tab order when closed. */
function syncCustomPanel() {
  const open = state.theme === 'custom';
  customPanel.classList.toggle('open', open);
  customPanel.setAttribute('aria-hidden', String(!open));
  colorInputs.forEach(input => { input.tabIndex = open ? 0 : -1; });
}

// ---- Advanced ----

function initAdvanced() {
  const weekSunday = byId('weekSunday');
  weekSunday.checked = state.weekSunday;
  weekSunday.addEventListener('change', () => {
    state.weekSunday = weekSunday.checked;
    commit();
  });

  bindRadioGroup('yearAlign');
  bindRadioGroup('monthAlign');
  bindRadioGroup('flagStyle', { flagStyle: true });

  // Choosing a flag style only makes sense where emoji flags exist.
  byId('flagsRow').hidden = !SUPPORTS_EMOJI_FLAGS;
}

/**
 * Two-way binds radios named `key` to `state[key]`.
 * @param {string} key
 * @param {import('../state.js').Change} [change]  passed to commit()
 */
function bindRadioGroup(key, change = {}) {
  document.querySelectorAll(`input[name="${key}"]`).forEach(radio => {
    radio.checked = radio.value === state[key];
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      state[key] = radio.value;
      commit(change);
    });
  });
}

// ---- Customize button (phones) ----

function initCustomizeToggle() {
  const button = byId('customizeBtn');
  const app = document.querySelector('.app');
  button.addEventListener('click', () => {
    const open = app.classList.toggle('settings-open');
    button.setAttribute('aria-expanded', String(open));
  });
}
