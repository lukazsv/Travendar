/**
 * UI translations.
 *
 * Static text in index.html is filled in by `applyI18n()` from these attributes:
 *   data-i18n="key"        → element.textContent
 *   data-i18n-aria="key"   → aria-label
 *   data-i18n-ph="key"     → placeholder
 * Dynamic text in JS uses `t(key)`. Some entries are functions (plurals, interpolation).
 *
 * Adding a language: add a block below with every key, then add it to LANGUAGES in config.js.
 * Country names come from the browser (Intl.DisplayNames), not from this file.
 */

import { state } from './state.js';

export const TRANSLATIONS = {
  pl: {
    tagline: 'Twój rok w podróżach',
    preview: 'Podgląd',
    previewAlt: 'Podgląd wygenerowanego obrazka',
    zoomPreview: 'Powiększ obrazek',
    save: 'Zapisz JPG',
    share: 'Udostępnij',
    saved: 'Zapisano obraz JPG',
    saveFailed: 'Nie udało się zapisać obrazu',
    shareFailed: 'Nie udało się udostępnić',
    customize: 'Dostosuj',
    language: 'Język',

    // Trips
    trips: 'Podróże',
    addTrip: 'Dodaj podróż',
    clearTrips: 'Wyczyść podróże',
    tripDeleted: 'Usunięto podróż',
    tripsCleared: 'Usunięto wszystkie podróże',
    undo: 'Cofnij',
    emptyText: 'Nie masz jeszcze żadnych podróży.',
    emptyAdd: 'Dodaj pierwszą albo',
    loadDemo: 'wczytaj przykład',
    from: 'Od',
    pickStartDate: 'Wybierz datę początku',
    pickEndDate: 'Wybierz datę końca',
    noDate: 'Wybierz',
    prevMonth: 'Poprzedni miesiąc',
    nextMonth: 'Następny miesiąc',
    to: 'Do',
    deleteTrip: 'Usuń podróż',
    chooseCountry: 'Wybierz kraj',
    countryLabel: name => `Kraj: ${name}`,
    notChosen: 'nie wybrano',
    fillDates: 'Uzupełnij daty podróży',
    endBeforeStart: 'Data końca jest wcześniejsza niż data początku',
    outsideYear: year => `poza rokiem ${year}`,
    pickCountryHint: 'wybierz kraj',

    // Settings
    general: 'Ogólne',
    year: 'Rok',
    prevYear: 'Poprzedni rok',
    nextYear: 'Następny rok',
    theme: 'Motyw',
    themeDark: 'Ciemny',
    themeLight: 'Jasny',
    themeCustom: 'Własny',
    colorBg: 'Tło',
    colorText: 'Tekst',
    colorAccent: 'Akcent',
    advanced: 'Zaawansowane',
    weekSunday: 'Zaczynaj tydzień od niedzieli',
    alignYear: 'Wyrównanie roku',
    alignMonths: 'Wyrównanie miesięcy',
    alignLeft: 'Do lewej',
    alignCenter: 'Do środka',
    alignRight: 'Do prawej',
    flags: 'Flagi',
    flagsNative: 'Systemowe',
    backup: 'JSON',
    exportData: 'Eksportuj',
    importData: 'Importuj',
    exported: 'Zapisano plik z kopią',
    importDone: 'Wczytano dane z pliku',
    importFailed: 'To nie jest poprawny plik kopii Travel Year',
    importConfirm: 'Zastąpić obecne podróże i ustawienia danymi z pliku?',

    // Footer
    privacySummary: 'Prywatność: Twoje podróże zostają tylko w tej przeglądarce',
    privacyText:
      'Podróże i ustawienia są zapisywane wyłącznie w pamięci tej przeglądarki. Strona nie ma kont ani statystyk odwiedzin i nie łączy się z żadnymi zewnętrznymi usługami – czcionki i flagi są jej częścią – więc niczego nie zbiera ani nigdzie nie wysyła. Jak przy każdej stronie, firma hostingowa może widzieć Twój adres IP w swoich logach. Pamiętaj: publikując obrazek, pokazujesz innym, kiedy nie było Cię w domu.',
    creditFlags: 'Flagi:',
    creditContributors: 'i współtwórcy',
    licenseNote: 'kod na licencji MIT',

    // Country picker
    pickContinent: 'Wybierz kontynent',
    back: 'Wstecz',
    done: 'Zamknij',
    search: 'Szukaj kraju',
    used: 'Użyte',
    noResults: 'Nie znaleziono kraju',
    continents: {
      europe: 'Europa',
      asia: 'Azja',
      africa: 'Afryka',
      namerica: 'Ameryka Północna',
      samerica: 'Ameryka Południowa',
      oceania: 'Australia i Oceania',
      antarctica: 'Antarktyda',
    },

    // Plurals and the image
    days: n => (n === 1 ? '1 dzień' : `${n} dni`),
    countries: n => {
      if (n === 1) return '1 kraj';
      const lastDigit = n % 10,
        lastTwo = n % 100;
      const few = lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14);
      return `${n} ${few ? 'kraje' : 'krajów'}`;
    },
    months: ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'],
    weekdays: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'], // Monday first
  },

  en: {
    tagline: 'Your year of travel',
    preview: 'Preview',
    previewAlt: 'Preview of the generated image',
    zoomPreview: 'Enlarge the image',
    save: 'Save JPG',
    share: 'Share',
    saved: 'JPG image saved',
    saveFailed: 'Could not save the image',
    shareFailed: 'Could not share',
    customize: 'Customize',
    language: 'Language',

    trips: 'Trips',
    addTrip: 'Add trip',
    clearTrips: 'Clear trips',
    tripDeleted: 'Trip deleted',
    tripsCleared: 'All trips cleared',
    undo: 'Undo',
    emptyText: "You don't have any trips yet.",
    emptyAdd: 'Add your first one or',
    loadDemo: 'load an example',
    from: 'From',
    pickStartDate: 'Choose the start date',
    pickEndDate: 'Choose the end date',
    noDate: 'Select',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    to: 'To',
    deleteTrip: 'Delete trip',
    chooseCountry: 'Choose country',
    countryLabel: name => `Country: ${name}`,
    notChosen: 'not chosen',
    fillDates: 'Fill in the trip dates',
    endBeforeStart: 'End date is before the start date',
    outsideYear: year => `outside ${year}`,
    pickCountryHint: 'choose a country',

    general: 'General',
    year: 'Year',
    prevYear: 'Previous year',
    nextYear: 'Next year',
    theme: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    themeCustom: 'Custom',
    colorBg: 'Background',
    colorText: 'Text',
    colorAccent: 'Accent',
    advanced: 'Advanced',
    weekSunday: 'Week starts on Sunday',
    alignYear: 'Year alignment',
    alignMonths: 'Month alignment',
    alignLeft: 'Left',
    alignCenter: 'Center',
    alignRight: 'Right',
    flags: 'Flags',
    flagsNative: 'System',
    backup: 'JSON',
    exportData: 'Export',
    importData: 'Import',
    exported: 'Backup file saved',
    importDone: 'Data loaded from the file',
    importFailed: 'This is not a valid Travel Year backup file',
    importConfirm: 'Replace your current trips and settings with the data from the file?',

    privacySummary: 'Privacy: your trips stay in this browser only',
    privacyText:
      'Trips and settings are stored only in this browser. The site has no accounts and no visitor statistics and connects to no outside services — fonts and flags are part of it — so it collects nothing and sends nothing anywhere. As with any website, the hosting company may see your IP address in its logs. Keep in mind: posting the image shows others when you were away from home.',
    creditFlags: 'Flags:',
    creditContributors: 'and contributors',
    licenseNote: 'code under the MIT License',

    pickContinent: 'Choose continent',
    back: 'Back',
    done: 'Close',
    search: 'Search countries',
    used: 'Used',
    noResults: 'No country found',
    continents: {
      europe: 'Europe',
      asia: 'Asia',
      africa: 'Africa',
      namerica: 'North America',
      samerica: 'South America',
      oceania: 'Australia & Oceania',
      antarctica: 'Antarctica',
    },

    days: n => (n === 1 ? '1 day' : `${n} days`),
    countries: n => (n === 1 ? '1 country' : `${n} countries`),
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], // Monday first
  },
};

/**
 * Translation for the current UI language.
 * @param {string} key
 * @returns {any} A string, a function (plurals / interpolation) or an object/array.
 */
export function t(key) {
  return TRANSLATIONS[state.lang][key];
}

/** Fills every data-i18n* element inside `root` and sets <html lang>. */
export function applyI18n(root = document) {
  document.documentElement.lang = state.lang;
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  root.querySelectorAll('[data-i18n-ph]').forEach(el => el.setAttribute('placeholder', t(el.dataset.i18nPh)));
}
