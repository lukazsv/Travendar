/**
 * Settings column: year, image theme (with custom colours), Advanced options,
 * and the phone-only Customize button that folds the settings away.
 *
 * Controls are wired once in initSettings(); syncSettings() copies the current state
 * into them again (used after importing a backup).
 */

import { YEAR_MIN, YEAR_MAX } from '../config.js';
import { state, commit, themeColors } from '../state.js';
import { SUPPORTS_EMOJI_FLAGS } from '../render/flags.js';
import { byId } from '../utils/html.js';

/** Radio groups bound to a state key of the same name, with the change hint passed to commit(). */
const RADIO_GROUPS = {
  yearAlign: {},
  monthAlign: {},
  flagStyle: { flagStyle: true },
};

let yearOutput, customPanel, weekSunday, showSiteUrl;
let colorInputs = [];

export function initSettings() {
  yearOutput = byId('yearOut');
  customPanel = byId('customColors');
  weekSunday = byId('weekSunday');
  showSiteUrl = byId('showSiteUrl');
  colorInputs = [...document.querySelectorAll('input[data-color]')];

  // Year
  const setYear = year => {
    state.year = Math.max(YEAR_MIN, Math.min(YEAR_MAX, year));
    yearOutput.textContent = state.year;
    commit({ year: true });
  };
  byId('yearPrev').addEventListener('click', () => setYear(state.year - 1));
  byId('yearNext').addEventListener('click', () => setYear(state.year + 1));

  // Theme
  document.querySelectorAll('input[name="theme"]').forEach(radio => {
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

  // Advanced
  weekSunday.addEventListener('change', () => {
    state.weekSunday = weekSunday.checked;
    commit();
  });
  showSiteUrl.addEventListener('change', () => {
    state.showSiteUrl = showSiteUrl.checked;
    syncSiteUrlHint();
    commit();
  });
  for (const [key, change] of Object.entries(RADIO_GROUPS)) {
    document.querySelectorAll(`input[name="${key}"]`).forEach(radio => {
      radio.addEventListener('change', () => {
        if (!radio.checked) return;
        state[key] = radio.value;
        commit(change);
      });
    });
  }
  // Choosing a flag style only makes sense where emoji flags exist.
  byId('flagsRow').hidden = !SUPPORTS_EMOJI_FLAGS;

  initCustomizeToggle();
  syncSettings();
}

/** Sets every settings control from the current state. */
export function syncSettings() {
  yearOutput.textContent = state.year;
  for (const key of ['theme', ...Object.keys(RADIO_GROUPS)]) {
    document.querySelectorAll(`input[name="${key}"]`).forEach(radio => {
      radio.checked = radio.value === state[key];
    });
  }
  weekSunday.checked = state.weekSunday;
  showSiteUrl.checked = state.showSiteUrl;
  syncSiteUrlHint();
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
  colorInputs.forEach(input => {
    input.tabIndex = open ? 0 : -1;
  });
}

/** The note asking to keep the site address slides open while the switch is off. */
function syncSiteUrlHint() {
  const open = !state.showSiteUrl;
  const box = byId('siteUrlHintBox');
  box.classList.toggle('open', open);
  box.setAttribute('aria-hidden', String(!open));
}

/** Phones: the Customize button folds / unfolds the settings. */
function initCustomizeToggle() {
  const button = byId('customizeBtn');
  const app = document.querySelector('.app');
  button.addEventListener('click', () => {
    const open = app.classList.toggle('settings-open');
    button.setAttribute('aria-expanded', String(open));
  });
}
