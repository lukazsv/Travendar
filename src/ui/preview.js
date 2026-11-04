/**
 * The live preview: the main canvas plus the three theme thumbnails in the settings.
 * Also produces the JPEG for export.
 */

import { IMAGE_WIDTH, JPEG_QUALITY } from '../config.js';
import { state, themeColors } from '../state.js';
import { t } from '../i18n.js';
import { buildDayMap } from '../core/calendar.js';
import { paintCalendar } from '../render/calendar-renderer.js';
import { usesEmojiFlags, getFlagImage, preloadFlagImages } from '../render/flags.js';
import { byId } from '../utils/html.js';

let canvas;
/** @type {HTMLCanvasElement[]} */
let thumbnails = [];

export function initPreview() {
  canvas = byId('cv');
  thumbnails = [...document.querySelectorAll('canvas[data-thumb]')];
}

/** Paints the main canvas and the thumbnails right now. Prefer scheduleDraw(). */
export function drawNow() {
  const days = buildDayMap(state.trips, state.year);
  const common = {
    year: state.year,
    monthNames: t('months'),
    weekStartsSunday: state.weekSunday,
    yearAlign: state.yearAlign,
    monthAlign: state.monthAlign,
    days,
    emojiFlags: usesEmojiFlags(),
    getFlagImage,
  };

  paintCalendar(canvas.getContext('2d'), { ...common, colors: themeColors(state.theme), scale: 1 });

  for (const thumb of thumbnails) {
    // While Dark or Light is active, the Custom tile shows those colours: that is where
    // Custom starts when chosen (see settings.js).
    const name = thumb.dataset.thumb === 'custom' && state.theme !== 'custom' ? state.theme : thumb.dataset.thumb;
    paintCalendar(thumb.getContext('2d'), { ...common, colors: themeColors(name), scale: thumb.width / IMAGE_WIDTH });
  }
}

let drawQueued = false;

/** Redraws on the next animation frame; many calls in one frame cause a single redraw. */
export function scheduleDraw() {
  if (drawQueued) return;
  drawQueued = true;
  requestAnimationFrame(() => {
    drawQueued = false;
    drawNow();
  });
}

/**
 * Renders the final image as a JPEG, waiting for flag images first.
 * @returns {Promise<Blob>}
 */
export async function renderJpeg() {
  await preloadFlagImages(buildDayMap(state.trips, state.year).values());
  drawNow();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('canvas.toBlob failed'))),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}

/** File name for the exported image. */
export const exportFileName = () => `travel-year-${state.year}.jpg`;
