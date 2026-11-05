# Travendar

Make your **travel year** image, as in the popular social-media trend: a full-year calendar where every day you spent abroad shows that country's flag instead of the date. The image has the clean look of a phone calendar's year view and is saved as a 1080 × 1920 JPG, ready for stories and short-video apps.

The app runs entirely in the browser: no backend, no account, no build step.

## Features

- **Trips**: pick a country (first a continent, then its countries A–Z, or search) and the dates in a two-click range calendar (first click = start, second = end). Days of trips that overlap go to the trip that starts later. Deleting a trip or clearing the list can be undone.
- **Live preview** of the image while you edit.
- **Themes**: Dark, Light (classic calendar look) and Custom, with your own background, text and accent colours.
- **Advanced**: week starts on Sunday, year and month-name alignment, system emoji or Twemoji flags, the site address in a badge in a top corner of the image (on by default; switching it off slides open a short note asking to keep it), and **backup** — export all trips and settings to a JSON file and import them back (e.g. on another device).
- **Export**: *Save JPG*, plus *Share* on phones (saves straight to Photos through the share sheet). After a successful save or share a dialog in the middle of the screen confirms it and asks for a tip on buycoffee.to (*Buy me a coffee*); it stays open until closed with ✕ or Esc. The same link is in the footer.
- **13 languages**: Arabic (right to left), Chinese (Simplified), English, French, German, Hindi, Italian, Japanese, Polish, Portuguese, Russian, Spanish and Ukrainian. The browser's preferred language is picked automatically (English if none is supported); country names come from the browser in the chosen language.
- **Responsive**: three columns on wide screens, two on laptops and tablets, one on phones (settings folded behind *Customize*).
- **Installable and offline**: add it to the home screen / install it as an app; after the first visit it also works without internet.
- **Saved automatically** in the browser (`localStorage`). Nothing is sent anywhere and the page makes no requests to outside services (fonts and flags are bundled); the footer explains this to users and credits the flag images.

## Running locally

The app uses native ES modules, which browsers do not load from `file://`. Serve the folder with any static server:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open <http://localhost:8000> (`npm start` does the same). There is nothing to install and nothing to build: edit a file and reload the page.

`--bind 127.0.0.1` keeps the server private to your computer. Without it, anyone on the same network can browse the whole folder (including `.git`). Drop it only while testing on a phone, on a network you trust, and open `http://<your computer's IP>:8000` there — type the `http://` part, or the phone will try HTTPS and fail.

## Development

The site has no dependencies, but the development tools run on **Node.js 22+**:

```bash
npm install          # ESLint and Prettier (dev only)
npm run check        # lint + format check + unit tests + offline file list — the same as CI
```

| Script | Purpose |
| --- | --- |
| `npm start` | Local server on <http://localhost:8000> |
| `npm run build` | Copy the published files into `dist/` (what the host serves) |
| `npm test` | Unit tests in `tests/` (Node's built-in test runner) |
| `npm run lint` | ESLint |
| `npm run format` / `format:check` | Prettier (HTML and Markdown are formatted by hand) |

GitHub Actions (`.github/workflows/ci.yml`) runs `npm run check` on every pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and [SECURITY.md](SECURITY.md) for reporting vulnerabilities. Changes are listed in [CHANGELOG.md](CHANGELOG.md).

## Deploying

The site is hosted on **Cloudflare Pages** (free plan: unlimited bandwidth, custom headers, automatic HTTPS). Its address is in `SITE_URL` in `src/config.js`: `https://travendar.app/` (a custom domain of the Pages project; `travendar.pages.dev` and `www.travendar.app` redirect to it).

`npm run build` copies only what is published into `dist/`: `index.html`, `manifest.webmanifest`, `sw.js`, `src/`, `_headers`, `robots.txt` and `sitemap.xml`. Development files (`scripts/`, `tests/`, docs, package files) stay off the site. CI runs the same build.

**First setup** (once, in the Cloudflare dashboard):

1. *Workers & Pages* → *Create* → *Pages* → *Connect to Git*, authorise GitHub and pick this repository (Cloudflare can be limited to this one repository).
2. Project name: `travendar` (this gives `travendar.pages.dev`). Production branch: `main`.
3. Framework preset: *None*. Build command: `npm run build`. Build output directory: `dist`.
4. *Save and Deploy*. Every push to `main` publishes the site; every other branch and pull request gets its own preview address (not indexed by search engines).

**Headers.** `_headers` sets the security headers (the CSP also as a header, plus `frame-ancestors`, HSTS, `nosniff`, referrer and permissions policies) and keeps `sw.js` from being cached. `tests/site.test.js` checks that its CSP matches the `<meta>` one in `index.html`.

**Changing the domain** (e.g. to `travendar.app`): add it under the project's *Custom domains*, then update `SITE_URL` in `src/config.js`, `og:url`, `og:image` and `canonical` in `index.html`, `robots.txt` and `sitemap.xml`. `npm test` fails until they all match. The `pages.dev` address keeps working.

Any other static host works too, as long as it publishes `dist/` and applies `_headers` (Netlify uses the same format). Do not upload the whole repository folder by hand (e.g. over FTP): that would also publish the `.git` history. The service worker (offline mode) only runs over HTTPS or on `localhost`.

## Project structure

```
index.html                    Markup only: links the styles and loads src/main.js; icons, sharing tags, CSP
manifest.webmanifest          Web app manifest (name, icons, colours) for installing the app
sw.js                         Service worker: offline support (must stay in the site root)
_headers                      HTTP security headers for the host (Cloudflare Pages / Netlify)
robots.txt, sitemap.xml       For search engines; contain the site address
src/
  main.js                     Entry point: initialises the UI and reacts to state changes
  config.js                   Constants: image size, fonts, built-in themes, languages, limits
  state.js                    App state, validation of stored/imported data, persistence, change notifications
  i18n.js                     t(), applyI18n() (also sets <html dir> for right-to-left languages)
  locales/                    One file of UI texts per language (ar, de, en, es, fr, hi, it, ja, pl, pt, ru, uk, zh) + plural.js
  pwa.js                      Registers the service worker
  core/                       Logic with no DOM access (pure functions)
    dates.js                  'YYYY-MM-DD' helpers
    calendar.js               Trips → which flag goes on which day; travel stats; month-grid helpers
    date-range.js             Two-click range selection logic used by the date picker
    countries.js              Country list and names in any language (Intl.DisplayNames), search, flag emoji
    language.js               Picks the UI language from the browser's preferences
    continents.js             Which countries each continent lists (hand-maintained)
    continent-shapes.js       Continent outline icons (GENERATED, do not edit)
  render/
    calendar-renderer.js      Draws the image on a <canvas>
    flags.js                  Emoji flag support detection, flag images, flag HTML
  ui/                         One module per part of the interface
    preview.js                Main canvas, theme thumbnails, JPEG rendering
    trips.js                  Trip list, add / delete / demo / clear
    country-picker.js         Continent → country dialog with search
    date-range-picker.js      Calendar dialog for choosing a trip's start and end
    settings.js               Year, theme and custom colours, Advanced, Customize button
    language-menu.js          Globe menu in the header
    export.js                 Save JPG and Share buttons
    donate.js                 "Saved" dialog with the buycoffee.to tip request
    lightbox.js               Full-screen view of the image (tap the preview)
    backup.js                 Export / import of trips and settings as JSON
    toast.js                  Status messages
    icons.js                  Inline SVG icons used from JS
  utils/
    html.js                   escapeHtml(), byId()
    download.js               downloadBlob()
  assets/
    fonts/                    DM Sans and Inter (woff2) with their OFL licences
    flags/                    Twemoji flag PNGs named <ISO code>.png, with LICENSE.md
    icons/                    App icon: icon.svg (source) and the PNG sizes generated from it
    og-image.png              Link preview image (1200 × 630)
  styles/                     CSS, loaded in this order by index.html:
    fonts.css                 @font-face rules for the bundled fonts
    tokens.css                Colours and fonts of the UI (light and dark)
    base.css                  Reset and document defaults
    components.css            Buttons, cards, rows, segmented control, switch, stepper, toast
    header.css, preview.css, trips.css, settings.css, country-picker.css, date-picker.css, footer.css
    layout.css                Page grid and responsive breakpoints (loaded last)
tests/                        Unit tests for src/core, state validation and translations
scripts/
  generate_continent_shapes.py   Rebuilds src/core/continent-shapes.js from map data
  requirements.txt               Python dependencies of that script (pinned)
  download_flags.py              Downloads the Twemoji flag PNGs into src/assets/flags/
  make-assets.html               Generates the PNG icons and og-image.png in the browser
  check_precache.py              Checks that sw.js lists every file needed offline
  build-site.js                  npm run build: copies the published files into dist/
.github/workflows/ci.yml      CI: lint, format check, tests, precache check
package.json                  Dev tooling and npm scripts (no runtime dependencies)
eslint.config.js, .prettierrc.json, .editorconfig   Code style
CHANGELOG.md, CONTRIBUTING.md, SECURITY.md, LICENSE
```

## How it works

**State and updates.** All data lives in one object, `state` (see `state.js` for its full shape). A module that changes something mutates `state` and calls `commit(change)`. `commit` saves to `localStorage` and notifies the listener in `main.js`, which re-renders what the change affects:

```js
state.year = 2027;
commit({ year: true });   // → trip list re-rendered, stats updated, image redrawn
```

The `change` flags (`trips`, `lang`, `year`, `flagStyle`) decide whether the page texts, the trip list and the country picker must be rebuilt. The image is always redrawn, at most once per animation frame (`scheduleDraw()`).

**Untrusted data.** Everything read from `localStorage` or from an imported backup file goes through `sanitizeState()` in `state.js`: only known fields with valid values are kept (known country codes, `YYYY-MM-DD` dates, simple ids, `#rrggbb` colours, at most 1000 trips). Text inserted into HTML is always passed through `escapeHtml()`. Keep both rules when adding fields.

**Backup files** look like `{ "format": "travendar-backup", "version": 1, "exportedAt": "…", "data": { …state… } }`. If the state shape changes incompatibly, bump `BACKUP_VERSION` in `config.js` and migrate older files in `ui/backup.js`.

**The image.** `render/calendar-renderer.js` lays everything out on a fixed 1080 × 1920 grid and scales it with the canvas transform. The same function draws the export and the theme thumbnails. It reads only its arguments, never the global state. The day → country mapping is computed by `core/calendar.js`.

**Flags.** Apple and Android devices (and Firefox) draw emoji flags, so the image uses them as they are. Windows cannot, so `render/flags.js` detects that and uses the bundled [Twemoji](https://github.com/jdecked/twemoji) images from `src/assets/flags/` instead. Before export the app waits for those images to load.

**Security.** `index.html` sets a strict Content Security Policy: scripts, styles, fonts and images may come from the site itself only, so injected or third-party code cannot run. Together with `sanitizeState()` and `escapeHtml()` this covers the app's only inputs (stored data and backup files). Headers that only the server can send (HSTS, `frame-ancestors`, …) must be configured on the hosting.

**Offline and install.** `src/pwa.js` registers `sw.js`, which caches the app on the first visit. It is *network first*: online, files always come fresh from the server (a deployment is picked up at once, old and new files never mix); offline, the cached copies are used. `sw.js` has a `PRECACHE` list of every file the app needs to start offline — when you add, rename or remove a file in `src/`, update it and run `python3 scripts/check_precache.py`.

**Translations.** Each language has a file in `src/locales/` with the same keys (a test checks it). Static text in `index.html` uses `data-i18n="key"` (text), `data-i18n-aria` (aria-label) and `data-i18n-ph` (placeholder); text built in JS uses `t('key')`. Plurals use the browser's plural rules through `plural(locale, { one, few, many, other, … })`, so languages like Polish, Russian or Arabic get the right forms. On first visit the language comes from `navigator.languages` (`core/language.js`), falling back to English; Traditional Chinese is not matched because only Simplified is available. Arabic switches the page to right-to-left: CSS uses logical properties (`inset-inline-start`, `margin-inline-start`, `text-align: start`), so the layout mirrors by itself; the exported image always stays left to right.

## Common changes

| Task | Where |
| --- | --- |
| Change a UI text | `src/locales/*.js` (every language) |
| Add a UI language | copy `src/locales/en.js`, translate it, import it in `src/i18n.js`, add it to `LANGUAGES` in `src/config.js` and to `PRECACHE` in `sw.js` |
| Change UI colours or fonts | `src/styles/tokens.css` |
| Change the image colours of Dark / Light | `IMAGE_THEMES` in `src/config.js` |
| Change the image layout (sizes, spacing, fonts) | constants at the top of `src/render/calendar-renderer.js` |
| Change the site address on the image or the donation page | `SITE_URL` and `DONATE_URL` in `src/config.js` (for `SITE_URL` see [Deploying](#deploying)) |
| Add a setting | default + validation in `state.js`, markup in `index.html`, binding in `ui/settings.js`, use it in `ui/preview.js` → renderer |
| Move a country to another continent | `src/core/continents.js` |
| Add a country | `COUNTRY_CODES` in `src/core/countries.js`, a continent in `continents.js`, then `python3 scripts/download_flags.py` |
| Use a new external resource (font, CDN, API) | avoid it if you can; otherwise allow it in the CSP in `index.html` and mention it in `privacyText` (`i18n.js`) |
| Add, rename or remove a file in `src/` | update `PRECACHE` in `sw.js`, then `python3 scripts/check_precache.py` |
| Change the app icon or the link preview image | edit `src/assets/icons/icon.svg` (or the drawing code in `scripts/make-assets.html`), then open `http://localhost:8000/scripts/make-assets.html` and save the generated files |
| Regenerate continent outlines | see below |

### Regenerating the continent outlines

`src/core/continent-shapes.js` is generated from [Natural Earth](https://www.naturalearthdata.com/) 1:110m country shapes. To change how the outlines look (simplification, which islands are kept…), edit `scripts/generate_continent_shapes.py` and run:

```bash
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements.txt
.venv/bin/python scripts/generate_continent_shapes.py
```

The script downloads the data (pinned to a Natural Earth commit and checked against a SHA-256 hash), rewrites `src/core/continent-shapes.js` and prints the size of each outline.

If a download script fails with `CERTIFICATE_VERIFY_FAILED` on macOS, prefix it with `SSL_CERT_FILE=/etc/ssl/cert.pem`.

## Conventions

- **No build step, no runtime dependencies, no third-party requests.** Plain HTML, CSS and JavaScript (ES2021 modules), with every asset bundled. Do not add a framework, bundler or CDN without a good reason.
- **Code and comments in English**; UI texts only in `src/locales/`.
- **Comments say why, not what.** Every module starts with a short description; exported functions have JSDoc with types.
- **No DOM in `core/`**, and the renderer gets everything through its arguments. That keeps the logic easy to test.
- **CSS**: colours come from the variables in `tokens.css`, never hard-coded in components. Responsive layout rules go in `layout.css`; component-specific breakpoints stay in the component's file.
- **Formatting**: Prettier for JS, CSS, JSON and YAML (`npm run format`); 4 spaces in Python; UTF-8, LF; see `.editorconfig`.
- **Tests**: new logic in `src/core/` comes with a test in `tests/`.
- **Accessibility**: text contrast at least 4.5:1 (use `--muted` / `--accent-text` for small text), every control labelled, everything usable with the keyboard; no motion when the system asks for reduced motion.
- **Git**: branch from `main` (`feature/…`, `fix/…`, `refactor/…`, `chore/…`), open a pull request, merge when CI is green and it is reviewed. Details in [CONTRIBUTING.md](CONTRIBUTING.md).

## Browser support

Current Chrome, Edge, Safari (macOS / iOS 15.4+) and Firefox. The app relies on ES modules, `<dialog>`, `Intl.DisplayNames`, CSS `:has()` and `dvh`/`svh` units (with fallbacks where the layout needs them).

## Privacy

Trips and settings stay in the browser's `localStorage`. The page makes no requests to other services: fonts and flag images are served from the site itself, and there are no analytics. As with any website, the hosting provider sees visitors' IP addresses in its logs. The donation link is an ordinary link: buycoffee.to is contacted only when someone opens it. The same explanation is shown to users in the footer — update it (`privacyText` in `i18n.js`) if this ever changes.

## Credits

- Flag images on systems without emoji flags: [Twemoji](https://github.com/jdecked/twemoji) v15.1.0, © Twitter and contributors, licensed [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) (see `src/assets/flags/LICENSE.md`).
- Continent outlines: derived from [Natural Earth](https://www.naturalearthdata.com/) (public domain).
- Plane icon in the empty trip list: [Lucide](https://lucide.dev/) (ISC licence).
- Fonts: [DM Sans](https://github.com/googlefonts/dm-fonts) and [Inter](https://github.com/rsms/inter), SIL Open Font License 1.1 (see `src/assets/fonts/OFL-*.txt`).

## License

The code is open source under the [MIT License](LICENSE).

Bundled third-party assets keep their own licences (see [Credits](#credits)): Twemoji flag images are CC-BY 4.0, the fonts are SIL OFL 1.1, and the continent outlines are derived from public-domain Natural Earth data.
