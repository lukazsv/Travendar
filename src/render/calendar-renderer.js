/**
 * Draws the "travel year" image: a minimalist year view, like a phone calendar app,
 * with flags in place of the day numbers of travel days.
 *
 * Everything is laid out on a fixed IMAGE_WIDTH × IMAGE_HEIGHT grid and scaled with
 * the canvas transform, so the same code draws the full-size export and the small
 * theme thumbnails. The function only reads its arguments (no app state).
 */

import { IMAGE_WIDTH as W, IMAGE_HEIGHT as H, CANVAS_FONT, EMOJI_FONT } from '../config.js';
import { dayKey, firstColumnOfMonth, daysInMonth } from '../core/calendar.js';
import { flagEmoji } from '../core/countries.js';

/**
 * Space kept free below the last month row. Apps such as TikTok and Instagram cover the
 * bottom of a vertical image with captions and buttons, so the calendar ends well above it.
 */
const BOTTOM_STRIP = 130;

/** Grid geometry in image pixels: 3 columns × 4 rows of months, 7 × 6 day cells each. */
const GRID = (() => {
  const padX = 34; // outer left/right margin
  const gapX = 34; // gap between month columns
  const colW = (W - 2 * padX - 2 * gapX) / 3; // width of one month
  const top = 245; // first month row starts below the year
  const blockH = (H - BOTTOM_STRIP - top) / 4; // height of one month row
  const titleH = 90; // month name area above the days
  return { padX, gapX, colW, cellW: colW / 7, top, blockH, titleH, rowH: (blockH - titleH - 14) / 6 };
})();

const YEAR_FONT = `700 124px ${CANVAS_FONT}`;
const YEAR_BASELINE = 200;
const MONTH_FONT = `700 62px ${CANVAS_FONT}`;
const MONTH_BASELINE = 62; // relative to the month block
const DAY_FONT = `600 27px ${CANVAS_FONT}`;
const TITLE_INSET = GRID.cellW * 0.12; // keeps titles visually aligned with the day columns
/**
 * Site badge: a soft pill in the top corner, level with the year, holding the app icon and the
 * address. It sits opposite the year when the year is aligned to that side.
 */
const BADGE = {
  font: `600 26px ${CANVAS_FONT}`,
  centerY: YEAR_BASELINE - 45, // middle of the year's digits
  height: 50,
  padLeft: 9, // the icon sits close to the rounded end
  padRight: 22,
  icon: 32,
  gap: 11,
  fillAlpha: 0.12, // pill background: the text colour, faint
  textAlpha: 0.9,
};

/** Size and vertical offset that make an emoji flag fill a day cell; measured once. */
let emojiMetrics = null;
function getEmojiMetrics(ctx) {
  if (emojiMetrics) return emojiMetrics;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.font = `100px ${EMOJI_FONT}`;
  const size = Math.floor((100 * (GRID.cellW * 0.98)) / (ctx.measureText(flagEmoji('PL')).width || 120));
  ctx.font = `${size}px ${EMOJI_FONT}`;
  const m = ctx.measureText(flagEmoji('PL'));
  const asc = m.actualBoundingBoxAscent,
    desc = m.actualBoundingBoxDescent;
  // Offset from the cell centre to the alphabetic baseline that centres the glyph.
  const dy = asc !== undefined && desc !== undefined && asc + desc > 0 ? (asc - desc) / 2 : size * 0.35;
  ctx.restore();
  emojiMetrics = { size, dy };
  return emojiMetrics;
}

/** x coordinate for text aligned left / center / right inside [left, left + width]. */
function alignedX(align, left, width) {
  if (align === 'center') return left + width / 2;
  if (align === 'right') return left + width - TITLE_INSET;
  return left + TITLE_INSET;
}

/**
 * @typedef {object} PaintOptions
 * @property {import('../state.js').Colors} colors
 * @property {number} scale                    1 for the full image, < 1 for thumbnails.
 * @property {number} year
 * @property {string[]} monthNames             12 short month names.
 * @property {boolean} weekStartsSunday
 * @property {'left'|'center'|'right'} yearAlign
 * @property {'left'|'center'|'right'} monthAlign
 * @property {Map<number, string>} days        From buildDayMap(): day → country code.
 * @property {boolean} emojiFlags              Draw flags as emoji (else as images).
 * @property {string} siteLabel                Site address shown at the bottom; '' for none.
 * @property {(code: string) => HTMLImageElement & { failed?: boolean }} getFlagImage
 */

/**
 * Paints the whole image onto `ctx`.
 * @param {CanvasRenderingContext2D} ctx
 * @param {PaintOptions} o
 */
export function paintCalendar(ctx, o) {
  const { padX, gapX, colW, cellW, top, blockH, titleH, rowH } = GRID;
  const emoji = o.emojiFlags ? getEmojiMetrics(ctx) : null;

  ctx.setTransform(o.scale, 0, 0, o.scale, 0, 0);
  // The image is always laid out left to right, also when the page is in a right-to-left language.
  ctx.direction = 'ltr';
  ctx.fillStyle = o.colors.bg;
  ctx.fillRect(0, 0, W, H);

  // Year
  ctx.textAlign = o.yearAlign;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = o.colors.accent;
  ctx.font = YEAR_FONT;
  ctx.fillText(String(o.year), alignedX(o.yearAlign, padX, W - 2 * padX), YEAR_BASELINE);

  for (let month = 0; month < 12; month++) {
    const bx = padX + (month % 3) * (colW + gapX);
    const by = top + Math.floor(month / 3) * blockH;

    // Month name
    ctx.textAlign = o.monthAlign;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = o.colors.text;
    ctx.font = MONTH_FONT;
    ctx.fillText(o.monthNames[month], alignedX(o.monthAlign, bx, colW), by + MONTH_BASELINE);

    // Days: column of the 1st depends on the weekday and on the first day of the week.
    const firstCol = firstColumnOfMonth(o.year, month, o.weekStartsSunday);
    const monthLength = daysInMonth(o.year, month);

    ctx.font = DAY_FONT;
    for (let day = 1; day <= monthLength; day++) {
      const cell = firstCol + day - 1;
      const cx = bx + cellW * ((cell % 7) + 0.5);
      const cy = by + titleH + rowH * (Math.floor(cell / 7) + 0.5);
      const code = o.days.get(dayKey(month, day));

      if (code) {
        drawFlag(ctx, o, code, cx, cy, emoji);
        continue;
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = o.colors.text;
      ctx.fillText(String(day), cx, cy + 1);
    }
  }

  if (o.siteLabel) drawSiteBadge(ctx, o.siteLabel, o.colors, o.yearAlign === 'right' ? 'left' : 'right');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

/**
 * The site address in a top corner: a pill in a faint tint of the text colour with the app
 * icon and the address. Noticeable on any theme, yet quieter than the year and the months.
 * @param {'left'|'right'} side
 */
function drawSiteBadge(ctx, label, colors, side) {
  const b = BADGE;
  ctx.save();
  ctx.font = b.font;
  const w = b.padLeft + b.icon + b.gap + ctx.measureText(label).width + b.padRight;
  const x = side === 'left' ? GRID.padX : W - GRID.padX - w;
  const top = b.centerY - b.height / 2;

  ctx.globalAlpha = b.fillAlpha;
  ctx.fillStyle = colors.text;
  roundRect(ctx, x, top, w, b.height, b.height / 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  drawAppIcon(ctx, x + b.padLeft, b.centerY - b.icon / 2, b.icon);

  ctx.globalAlpha = b.textAlpha;
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + b.padLeft + b.icon + b.gap, b.centerY + 1);
  ctx.restore();
}

/**
 * The app icon (src/assets/icons/icon.svg, the favicon) drawn with paths at `size` px, so it
 * needs no image loading. Coordinates are those of the SVG's 512 × 512 view box.
 */
function drawAppIcon(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 512, size / 512);
  ctx.fillStyle = '#1a1917';
  roundRect(ctx, 0, 0, 512, 512, 112);
  ctx.fill();
  ctx.fillStyle = '#e8553a';
  roundRect(ctx, 124, 122, 168, 48, 24);
  ctx.fill();
  for (const cx of [190, 262, 334]) {
    roundRect(ctx, cx, 294, 60, 44, 10);
    ctx.fill();
  }
  ctx.fillStyle = '#ecebe7';
  const dots = [148, 220, 292, 364]
    .flatMap(cx => [
      [cx, 244],
      [cx, 388],
    ])
    .concat([[148, 316]]);
  for (const [cx, cy] of dots) {
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Rounded rectangle path, with a plain rectangle where roundRect() is missing (older browsers). */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

/** Draws one flag centred on (cx, cy); leaves the context's font set to DAY_FONT. */
function drawFlag(ctx, o, code, cx, cy, emoji) {
  if (emoji) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `${emoji.size}px ${EMOJI_FONT}`;
    ctx.fillText(flagEmoji(code), cx, cy + emoji.dy);
  } else {
    const img = o.getFlagImage(code);
    if (img.complete && img.naturalWidth) {
      const s = GRID.cellW * 0.88; // slightly smaller than the cell so neighbouring flags don't merge
      ctx.drawImage(img, cx - s / 2, cy - s / 2, s, s);
    } else if (img.failed) {
      drawCodeBadge(ctx, code, cx, cy, o.colors.text);
    }
    // Still loading: draw nothing; a redraw follows when the image arrives.
  }
  ctx.font = DAY_FONT;
}

/** Fallback when a flag image cannot be loaded: the country code on a faint rounded box. */
function drawCodeBadge(ctx, code, cx, cy, color) {
  const w = GRID.cellW * 0.9,
    h = w * 0.68;
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = color;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 5);
  else ctx.rect(cx - w / 2, cy - h / 2, w, h);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 15px ${CANVAS_FONT}`;
  ctx.fillText(code, cx, cy + 1);
}
