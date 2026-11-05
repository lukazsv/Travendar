# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.1] - 2026-11-05

### Fixed

- **Zoom on quick taps**: tapping buttons quickly on a phone, such as the month arrows of the date picker, no longer zooms the page. Pinch zoom still works.
- **Updates reaching users**: the service worker now revalidates every file with the server, so a new version shows up on the next visit instead of after up to 4 hours of the browser's cache.

- **Emoji flags on some iPhones** were drawn too small and shifted half a cell to the right, over the next day's number. Flags are now placed by the pixels they actually cover instead of the system's emoji font metrics.

## [1.0.0] - 2026-11-05

First public release, live at **https://travendar.app**.

### Added

- **Trips**: country (picked by continent, then A–Z, or by search) and dates in a range calendar — first click sets the start, second the end, months change instantly, keyboard support; add, delete, load an example, clear all — with **Undo** for delete and clear.
- **Image**: a 1080 × 1920 year calendar where travel days show the country's flag, with the site address (www.travendar.app) in a small badge with the app icon in a top corner, and the calendar kept clear of the area that TikTok and Instagram cover at the bottom (the address can be switched off in Advanced); live preview that opens enlarged on tap (swipe any way to close); **Save JPG** and **Share** (phones).
- **Donations**: after saving or sharing, a centred dialog confirms it and asks for a tip on buycoffee.to (stays open until closed); the same link is in the footer. It is a plain link — no third-party script.
- **Themes**: Dark, Light and Custom (own background, text and accent colours) with live thumbnails.
- **Advanced**: week starting on Sunday, year and month-name alignment, system or Twemoji flags, **JSON backup** export and import.
- **13 interface languages** — Arabic (right to left), Chinese (Simplified), English, French, German, Hindi, Italian, Japanese, Polish, Portuguese, Russian, Spanish, Ukrainian — chosen automatically from the browser (English otherwise) and listed alphabetically in the language menu; country names, month names and plurals in each language.
- **Responsive layout**: three columns on wide screens, two on tablets/laptops, one on phones with settings folded behind *Customize*; on wider screens *Add trip* and *Clear trips* stay pinned below the trip list.
- **Installable app (PWA)** that works offline after the first visit; app icon, favicon and link-preview image.
- **Privacy**: everything stays in the browser; no accounts, analytics or third-party requests (fonts and flags are bundled). Footer with a privacy note, credits and the contact address help@travendar.app.
- **Security**: strict Content Security Policy; all stored and imported data is validated.
- **Accessibility**: WCAG AA contrast, screen-reader description of the image, keyboard-friendly dialogs and menus, reduced-motion support.
- **Hosting**: Cloudflare Pages setup (`npm run build` → `dist/`), security headers in `_headers`, `robots.txt`, `sitemap.xml`, canonical and absolute link-preview URLs; the site lives at **travendar.app**.
- **Development**: ES modules without a build step, unit tests (`node:test`), ESLint, Prettier, GitHub Actions CI, asset and data generators in `scripts/`.

[Unreleased]: https://github.com/lukazsv/Travendar/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/lukazsv/Travendar/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/lukazsv/Travendar/releases/tag/v1.0.0
