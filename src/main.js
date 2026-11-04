/**
 * Entry point. Initialises the UI modules and connects them through state changes:
 * modules update `state` and call `commit(change)`; the listener below decides
 * what has to be re-rendered.
 */

import { CANVAS_FONT } from './config.js';
import { onChange } from './state.js';
import { applyI18n } from './i18n.js';
import { onFlagImageLoad } from './render/flags.js';
import { initPreview, drawNow, scheduleDraw } from './ui/preview.js';
import { initTrips, renderTrips, updateStats } from './ui/trips.js';
import { initCountryPicker, refreshCountryPicker } from './ui/country-picker.js';
import { initSettings, syncSettings } from './ui/settings.js';
import { initLanguageMenu } from './ui/language-menu.js';
import { initExport } from './ui/export.js';
import { initBackup } from './ui/backup.js';
import { registerServiceWorker } from './pwa.js';

applyI18n();
initPreview();
initTrips();
initCountryPicker();
initSettings();
initLanguageMenu();
initExport();
initBackup(syncSettings);

onChange(change => {
  if (change.lang) applyI18n();
  if (change.trips || change.lang || change.year || change.flagStyle) renderTrips();
  if (change.lang || change.flagStyle) refreshCountryPicker();
  updateStats();
  scheduleDraw();
});

// Twemoji flags arrive asynchronously; redraw when each one is ready.
onFlagImageLoad(scheduleDraw);

renderTrips();
updateStats();
drawNow();

// The canvas cannot wait for web fonts by itself: redraw once they are available.
if (document.fonts) {
  Promise.all([document.fonts.load(`700 62px ${CANVAS_FONT}`), document.fonts.load(`600 27px ${CANVAS_FONT}`)])
    .then(scheduleDraw)
    .catch(() => {});
}
document.fonts?.ready.then(scheduleDraw);

// Offline support and "install app".
registerServiceWorker();
