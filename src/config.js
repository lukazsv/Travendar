/**
 * App-wide constants. Magic numbers, external URLs and option lists live here so they
 * can be changed in one place.
 */

/** Size of the exported image in pixels (9:16, the format of vertical videos and stories). */
export const IMAGE_WIDTH = 1080;
export const IMAGE_HEIGHT = 1920;
export const JPEG_QUALITY = 0.95;

/** localStorage key. Bump the version suffix only together with a migration in state.js. */
export const STORAGE_KEY = 'travel-year.v1';

/**
 * UI languages. `name` is the language's own name (shown in the menu, which sorts them
 * alphabetically), `flag` the ISO country code of its icon, `dir` the writing direction,
 * and optional `locale` the regional variant used for dates, country names and sorting.
 * Each one needs a translation file in src/locales/ registered in src/i18n.js.
 */
export const LANGUAGES = [
  { code: 'ar', name: 'العربية', flag: 'SA', dir: 'rtl' },
  { code: 'de', name: 'Deutsch', flag: 'DE', dir: 'ltr' },
  { code: 'en', name: 'English', flag: 'GB', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: 'ES', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: 'FR', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', flag: 'IN', dir: 'ltr' },
  { code: 'it', name: 'Italiano', flag: 'IT', dir: 'ltr' },
  { code: 'ja', name: '日本語', flag: 'JP', dir: 'ltr' },
  { code: 'pl', name: 'Polski', flag: 'PL', dir: 'ltr' },
  { code: 'pt', name: 'Português', flag: 'PT', dir: 'ltr', locale: 'pt-PT' },
  { code: 'ru', name: 'Русский', flag: 'RU', dir: 'ltr' },
  { code: 'uk', name: 'Українська', flag: 'UA', dir: 'ltr' },
  { code: 'zh', name: '简体中文', flag: 'CN', dir: 'ltr' },
];

/** Locale for Intl APIs and <html lang>: the language's regional variant if set, else its code. */
export function intlLocale(code) {
  return LANGUAGES.find(l => l.code === code)?.locale ?? code;
}

/** Used when none of the browser's preferred languages is supported. */
export const DEFAULT_LANGUAGE = 'en';

/** Allowed range for the year stepper. */
export const YEAR_MIN = 1970;
export const YEAR_MAX = 2100;

/** Upper bound on stored / imported trips, so a huge or malicious file cannot freeze the page. */
export const MAX_TRIPS = 1000;

/** Backup files (Advanced → Backup). Bump `version` only together with a migration in backup.js. */
export const BACKUP_FORMAT = 'travel-year-backup';
export const BACKUP_VERSION = 1;
export const BACKUP_MAX_BYTES = 1_000_000;

export const ALIGNMENTS = ['left', 'center', 'right'];
export const FLAG_STYLES = ['native', 'twemoji'];
export const THEME_NAMES = ['dark', 'light', 'custom'];

/**
 * Colours of the exported image for the built-in themes (classic phone-calendar look).
 * The "custom" theme starts as a copy of whichever of these was active.
 */
export const IMAGE_THEMES = {
  dark: { bg: '#000000', text: '#ffffff', accent: '#ff453a' },
  light: { bg: '#ffffff', text: '#000000', accent: '#ff3b30' },
};

/** Fonts used on the canvas. SF Pro on Apple devices; the bundled Inter (src/styles/fonts.css) elsewhere. */
export const CANVAS_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';

/**
 * Bundled Twemoji flag PNGs (CC-BY 4.0), used where the system cannot draw emoji flags, e.g. Windows.
 * Files are named <ISO code>.png; refresh them with scripts/download_flags.py. Relative to index.html.
 */
export const FLAG_IMAGES_DIR = 'src/assets/flags/';
