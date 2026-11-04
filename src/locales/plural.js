/**
 * Builds a plural function for a translation, using the browser's plural rules
 * (Intl.PluralRules), so every language gets its own forms:
 *
 *   days: plural('pl', { one: '{n} dzień', other: '{n} dni' })
 *   countries: plural('ru', { one: '{n} страна', few: '{n} страны', many: '{n} стран', other: '{n} страны' })
 *
 * Categories are CLDR's: zero, one, two, few, many, other. `other` is required and used
 * for any category a language does not list.
 *
 * @param {string} locale
 * @param {Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }} forms
 * @returns {(n: number) => string}
 */
export function plural(locale, forms) {
  const rules = new Intl.PluralRules(locale);
  return n => (forms[rules.select(n)] ?? forms.other).replace('{n}', String(n));
}
