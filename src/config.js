/**
 * App-wide constants. Magic numbers, external URLs and option lists live here so they
 * can be changed in one place.
 */

/** Size of the exported image in pixels (9:16, the TikTok / Stories format). */
export const IMAGE_WIDTH = 1080;
export const IMAGE_HEIGHT = 1920;
export const JPEG_QUALITY = 0.95;

/** localStorage key. Bump the version suffix only together with a migration in state.js. */
export const STORAGE_KEY = 'travel-year.v1';

/** UI languages, in the order shown in the language menu. `flag` is the ISO country code of its icon. */
export const LANGUAGES = [
  { code: 'pl', name: 'Polski', flag: 'PL' },
  { code: 'en', name: 'English', flag: 'GB' },
];

/** Allowed range for the year stepper. */
export const YEAR_MIN = 1970;
export const YEAR_MAX = 2100;

export const ALIGNMENTS = ['left', 'center', 'right'];
export const FLAG_STYLES = ['native', 'twemoji'];
export const THEME_NAMES = ['dark', 'light', 'custom'];

/**
 * Colours of the exported image for the built-in themes (iOS calendar look).
 * The "custom" theme starts as a copy of whichever of these was active.
 */
export const IMAGE_THEMES = {
  dark: { bg: '#000000', text: '#ffffff', accent: '#ff453a' },
  light: { bg: '#ffffff', text: '#000000', accent: '#ff3b30' },
};

/** Fonts used on the canvas. SF Pro on Apple devices; Inter (loaded from Google Fonts) elsewhere. */
export const CANVAS_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';

/** Twemoji PNGs (CC-BY 4.0) used where the system cannot draw emoji flags, e.g. Windows. Served with CORS. */
export const TWEMOJI_BASE_URL = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/72x72/';
