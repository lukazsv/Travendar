/**
 * Choosing the UI language from the browser's preferences. Pure function, no DOM.
 */

/**
 * Picks the first supported language from the user's preferred ones (navigator.languages),
 * or `fallback` when none is supported or the preferences are unknown.
 *
 * Tags are matched on their main part ('de-AT' → 'de'). Chinese is only offered in
 * Simplified script, so Traditional Chinese ('zh-TW', 'zh-HK', 'zh-MO', 'zh-Hant…')
 * is not matched and the next preference is tried.
 *
 * @param {readonly string[] | undefined} preferred  e.g. ['de-AT', 'en-US']
 * @param {readonly string[]} supported              e.g. ['en', 'pl', 'de', …]
 * @param {string} fallback
 * @returns {string}
 */
export function detectLanguage(preferred, supported, fallback) {
  for (const tag of preferred || []) {
    if (typeof tag !== 'string' || !tag) continue;
    const lower = tag.toLowerCase();
    const [base] = lower.split(/[-_]/);
    if (base === 'zh' && /(^|[-_])(hant|tw|hk|mo)($|[-_])/.test(lower)) continue;
    if (supported.includes(base)) return base;
  }
  return fallback;
}
