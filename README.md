# Travel Year

Make your **travel year** image, as in the TikTok trend: a full-year calendar where every day you spent abroad shows that country's flag instead of the date. The image follows the look of the iOS Calendar year view and is saved as a 1080 × 1920 JPG, ready for TikTok or Instagram Stories.

The app runs entirely in the browser: no backend, no account, no build step.

## Features

- **Trips**: pick a country (first a continent, then its countries A–Z, or search), a start and an end date. Days of trips that overlap go to the trip that starts later.
- **Live preview** of the image while you edit.
- **Themes**: Dark, Light (iOS look) and Custom, with your own background, text and accent colours.
- **Advanced**: week starts on Sunday, year and month-name alignment, system emoji or Twemoji flags.
- **Export**: *Save JPG*, plus *Share* on phones (saves straight to Photos through the share sheet).
- **Polish and English** UI. Country names come from the browser, so they are always translated.
- **Responsive**: three columns on wide screens, two on laptops and tablets, one on phones (settings folded behind *Customize*).
- **Saved automatically** in the browser (`localStorage`). Nothing is sent to a server.

## Running locally

The app uses native ES modules, which browsers do not load from `file://`. Serve the folder with any static server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. There is nothing to install and nothing to build: edit a file and reload the page.

## Deploying

Upload the repository as it is to any static host (GitHub Pages, Netlify, Cloudflare Pages, Vercel…). Only `index.html` and `src/` are needed at runtime; `scripts/` is for development.

> GitHub Pages on a free plan works only for public repositories.

## Project structure

```
index.html                    Markup only: links the styles and loads src/main.js
src/
  main.js                     Entry point: initialises the UI and reacts to state changes
  config.js                   Constants: image size, fonts, built-in themes, languages, URLs
  state.js                    App state, localStorage persistence, change notifications
  i18n.js                     Polish and English UI texts, t() and applyI18n()
  core/                       Logic with no DOM access (pure functions)
    dates.js                  'YYYY-MM-DD' helpers
    calendar.js               Trips → which flag goes on which day; travel stats
    countries.js              Country list and names (Intl.DisplayNames), search, flag emoji
    continents.js             Which countries each continent lists (hand-maintained)
    continent-shapes.js       Continent outline icons (GENERATED, do not edit)
  render/
    calendar-renderer.js      Draws the image on a <canvas>
    flags.js                  Emoji flag support detection, Twemoji images, flag HTML
  ui/                         One module per part of the interface
    preview.js                Main canvas, theme thumbnails, JPEG rendering
    trips.js                  Trip list, add / delete / demo / clear
    country-picker.js         Continent → country dialog with search
    settings.js               Year, theme and custom colours, Advanced, Customize button
    language-menu.js          Globe menu in the header
    export.js                 Save JPG and Share buttons
    toast.js                  Status messages
    icons.js                  Inline SVG icons used from JS
  utils/
    html.js                   escapeHtml(), byId()
  styles/                     CSS, loaded in this order by index.html:
    tokens.css                Colours and fonts of the UI (light and dark)
    base.css                  Reset and document defaults
    components.css            Buttons, cards, rows, segmented control, switch, stepper, toast
    header.css, preview.css, trips.css, settings.css, country-picker.css
    layout.css                Page grid and responsive breakpoints (loaded last)
scripts/
  generate_continent_shapes.py   Rebuilds src/core/continent-shapes.js from map data
  requirements.txt               Python dependencies of that script
```

## How it works

**State and updates.** All data lives in one object, `state` (see `state.js` for its full shape). A module that changes something mutates `state` and calls `commit(change)`. `commit` saves to `localStorage` and notifies the listener in `main.js`, which re-renders what the change affects:

```js
state.year = 2027;
commit({ year: true });   // → trip list re-rendered, stats updated, image redrawn
```

The `change` flags (`trips`, `lang`, `year`, `flagStyle`) decide whether the page texts, the trip list and the country picker must be rebuilt. The image is always redrawn, at most once per animation frame (`scheduleDraw()`).

**The image.** `render/calendar-renderer.js` lays everything out on a fixed 1080 × 1920 grid and scales it with the canvas transform. The same function draws the export and the theme thumbnails. It reads only its arguments, never the global state. The day → country mapping is computed by `core/calendar.js`.

**Flags.** Apple and Android devices (and Firefox) draw emoji flags, so the image uses them as they are. Windows cannot, so `render/flags.js` detects that and uses [Twemoji](https://github.com/jdecked/twemoji) images instead. Before export the app waits for those images to load.

**Translations.** Static text in `index.html` uses `data-i18n="key"` (text), `data-i18n-aria` (aria-label) and `data-i18n-ph` (placeholder). Text built in JS uses `t('key')`.

## Common changes

| Task | Where |
| --- | --- |
| Change a UI text | `src/i18n.js` (both languages) |
| Add a UI language | add a block in `src/i18n.js`, then an entry in `LANGUAGES` in `src/config.js` |
| Change UI colours or fonts | `src/styles/tokens.css` |
| Change the image colours of Dark / Light | `IMAGE_THEMES` in `src/config.js` |
| Change the image layout (sizes, spacing, fonts) | constants at the top of `src/render/calendar-renderer.js` |
| Add a setting | default + validation in `state.js`, markup in `index.html`, binding in `ui/settings.js`, use it in `ui/preview.js` → renderer |
| Move a country to another continent | `src/core/continents.js` |
| Regenerate continent outlines | see below |

### Regenerating the continent outlines

`src/core/continent-shapes.js` is generated from [Natural Earth](https://www.naturalearthdata.com/) 1:110m country shapes. To change how the outlines look (simplification, which islands are kept…), edit `scripts/generate_continent_shapes.py` and run:

```bash
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements.txt
.venv/bin/python scripts/generate_continent_shapes.py
```

The script downloads the data, rewrites `src/core/continent-shapes.js` and prints the size of each outline.

## Conventions

- **No build step, no runtime dependencies.** Plain HTML, CSS and JavaScript (ES2021 modules). Do not add a framework or bundler without a good reason.
- **Code and comments in English**; UI texts only in `i18n.js`.
- **Comments say why, not what.** Every module starts with a short description; exported functions have JSDoc with types.
- **No DOM in `core/`**, and the renderer gets everything through its arguments. That keeps the logic easy to test.
- **CSS**: colours come from the variables in `tokens.css`, never hard-coded in components. Responsive layout rules go in `layout.css`; component-specific breakpoints stay in the component's file.
- **Formatting**: 2 spaces (4 in Python), UTF-8, LF; see `.editorconfig`.
- **Git**: branch from `main` (`feature/…`, `fix/…`, `refactor/…`), open a pull request, merge when reviewed.

## Browser support

Current Chrome, Edge, Safari (macOS / iOS 15.4+) and Firefox. The app relies on ES modules, `<dialog>`, `Intl.DisplayNames`, CSS `:has()` and `dvh`/`svh` units (with fallbacks where the layout needs them).

## Privacy

Trips and settings stay in the browser's `localStorage`. The page loads fonts from Google Fonts and, where needed, flag images from the jsDelivr CDN; nothing else leaves the device.

## Credits

- Flag images on systems without emoji flags: [Twemoji](https://github.com/jdecked/twemoji), © Twitter and contributors, licensed [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Continent outlines: derived from [Natural Earth](https://www.naturalearthdata.com/) (public domain).
- Plane icon in the empty trip list: [Lucide](https://lucide.dev/) (ISC licence).
- Fonts: [DM Sans](https://fonts.google.com/specimen/DM+Sans) and [Inter](https://fonts.google.com/specimen/Inter) (SIL Open Font License), via Google Fonts.

## License

No license has been chosen yet, so all rights are reserved by the author. Add a `LICENSE` file before accepting outside contributions.
