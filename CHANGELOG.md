# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

Everything below will ship as **1.0.0** once the site is hosted and tested on real devices.

### Added

- **Trips**: country (picked by continent, then A–Z, or by search), start and end date; add, delete, load an example, clear all — with **Undo** for delete and clear.
- **Image**: a 1080 × 1920 year calendar where travel days show the country's flag; live preview; **Save JPG** and **Share** (phones).
- **Themes**: Dark, Light and Custom (own background, text and accent colours) with live thumbnails.
- **Advanced**: week starting on Sunday, year and month-name alignment, system or Twemoji flags, **JSON backup** export and import.
- **Polish and English** interface; country names from the browser in both languages.
- **Responsive layout**: three columns on wide screens, two on tablets/laptops, one on phones with settings folded behind *Customize*.
- **Installable app (PWA)** that works offline after the first visit; app icon, favicon and link-preview image.
- **Privacy**: everything stays in the browser; no accounts, analytics or third-party requests (fonts and flags are bundled). Footer with a privacy note and credits.
- **Security**: strict Content Security Policy; all stored and imported data is validated.
- **Accessibility**: WCAG AA contrast, screen-reader description of the image, keyboard-friendly dialogs and menus, reduced-motion support.
- **Development**: ES modules without a build step, unit tests (`node:test`), ESLint, Prettier, GitHub Actions CI, asset and data generators in `scripts/`.
