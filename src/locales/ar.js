/**
 * Arabic UI texts (Modern Standard Arabic). Written right to left: applyI18n() sets
 * <html dir="rtl"> for this language. Keys and kinds of values must match the other
 * languages (tests/i18n.test.js).
 */

import { plural } from './plural.js';

export default {
  tagline: 'عامك في السفر',
  preview: 'معاينة',
  previewAlt: 'معاينة الصورة التي تم إنشاؤها',
  zoomPreview: 'تكبير الصورة',
  save: 'حفظ بصيغة JPG',
  share: 'مشاركة',
  saved: 'تم حفظ صورة JPG',
  saveFailed: 'تعذّر حفظ الصورة',
  shareFailed: 'تعذّرت المشاركة',
  customize: 'تخصيص',
  language: 'اللغة',

  // Trips
  trips: 'الرحلات',
  addTrip: 'إضافة رحلة',
  clearTrips: 'حذف كل الرحلات',
  tripDeleted: 'تم حذف الرحلة',
  tripsCleared: 'تم حذف كل الرحلات',
  undo: 'تراجع',
  emptyText: 'ليست لديك أي رحلات بعد.',
  emptyAdd: 'أضف رحلتك الأولى أو',
  loadDemo: 'حمّل مثالًا',
  from: 'من',
  to: 'إلى',
  pickStartDate: 'اختر تاريخ البداية',
  pickEndDate: 'اختر تاريخ النهاية',
  noDate: 'اختر',
  prevMonth: 'الشهر السابق',
  nextMonth: 'الشهر التالي',
  deleteTrip: 'حذف الرحلة',
  chooseCountry: 'اختر دولة',
  countryLabel: name => `الدولة: ${name}`,
  notChosen: 'لم يتم الاختيار',
  fillDates: 'أدخل تواريخ الرحلة',
  endBeforeStart: 'تاريخ النهاية يسبق تاريخ البداية',
  outsideYear: year => `خارج عام ${year}`,
  pickCountryHint: 'اختر دولة',

  // Settings
  general: 'عام',
  year: 'السنة',
  prevYear: 'السنة السابقة',
  nextYear: 'السنة التالية',
  theme: 'المظهر',
  themeDark: 'داكن',
  themeLight: 'فاتح',
  themeCustom: 'مخصص',
  colorBg: 'الخلفية',
  colorText: 'النص',
  colorAccent: 'اللون المميز',
  advanced: 'خيارات متقدمة',
  weekSunday: 'يبدأ الأسبوع يوم الأحد',
  alignYear: 'محاذاة السنة',
  alignMonths: 'محاذاة الأشهر',
  alignLeft: 'يسار',
  alignCenter: 'وسط',
  alignRight: 'يمين',
  flags: 'الأعلام',
  flagsNative: 'النظام',
  backup: 'JSON',
  exportData: 'تصدير',
  importData: 'استيراد',
  exported: 'تم حفظ ملف النسخة الاحتياطية',
  importDone: 'تم تحميل البيانات من الملف',
  importFailed: 'هذا ليس ملف نسخة احتياطية صالحًا لـ Travel Year',
  importConfirm: 'هل تريد استبدال رحلاتك وإعداداتك الحالية ببيانات الملف؟',

  // Footer
  privacySummary: 'الخصوصية: تبقى رحلاتك في هذا المتصفح فقط',
  privacyText:
    'تُحفظ الرحلات والإعدادات في هذا المتصفح فقط. لا يحتوي الموقع على حسابات أو إحصاءات للزيارات ولا يتصل بأي خدمات خارجية — فالخطوط والأعلام جزء منه — لذلك لا يجمع أي بيانات ولا يرسلها إلى أي مكان. وكما هو الحال مع أي موقع، قد ترى شركة الاستضافة عنوان IP الخاص بك في سجلاتها. تذكّر: عند نشر الصورة فإنك تُظهر للآخرين متى كنت خارج المنزل.',
  creditFlags: 'الأعلام:',
  creditContributors: 'والمساهمون',
  licenseNote: 'الشيفرة بترخيص MIT',

  // Country picker
  pickContinent: 'اختر قارة',
  back: 'رجوع',
  done: 'إغلاق',
  search: 'ابحث عن دولة',
  used: 'المستخدمة',
  noResults: 'لم يتم العثور على دولة',
  continents: {
    europe: 'أوروبا',
    asia: 'آسيا',
    africa: 'أفريقيا',
    namerica: 'أمريكا الشمالية',
    samerica: 'أمريكا الجنوبية',
    oceania: 'أستراليا وأوقيانوسيا',
    antarctica: 'القارة القطبية الجنوبية',
  },

  // Plurals, the image and the date picker (Arabic has six plural categories)
  days: plural('ar', {
    zero: '{n} يوم',
    one: 'يوم واحد',
    two: 'يومان',
    few: '{n} أيام',
    many: '{n} يومًا',
    other: '{n} يوم',
  }),
  countries: plural('ar', {
    zero: '{n} دولة',
    one: 'دولة واحدة',
    two: 'دولتان',
    few: '{n} دول',
    many: '{n} دولة',
    other: '{n} دولة',
  }),
  months: [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ],
  weekdays: ['ن', 'ث', 'ر', 'خ', 'ج', 'س', 'ح'], // Monday first (الإثنين … الأحد)
};
