# Contributing to Travendar

Thanks for helping! This guide covers the setup, the checks every change must pass and how changes get merged. The [README](README.md) explains how the code is organised.

## Setup

You need **Python 3** (for the local server and a few scripts) and **Node.js 22 or newer** (for the development tools only — the site itself has no dependencies).

```bash
npm install        # installs ESLint and Prettier (dev only)
npm start          # serves the site at http://localhost:8000
```

There is no build step: edit a file and reload the page.

## Before opening a pull request

Run everything CI runs:

```bash
npm run check
```

It runs, in order:

| Command | What it checks |
| --- | --- |
| `npm run lint` | ESLint (code problems) |
| `npm run format:check` | Prettier formatting — fix with `npm run format` |
| `npm test` | Unit tests in `tests/` (`node:test`) |
| `python3 scripts/check_precache.py` | `sw.js` lists every file needed offline |

Also check your change by hand in the browser: light and dark mode, a wide window and a phone-sized one, and with the keyboard only if you touched interactive elements.

## Guidelines

- **Keep it dependency-free at runtime.** No frameworks, bundlers or CDNs. Bundle any new asset under `src/assets/` and keep the Content Security Policy in `index.html` strict.
- **Logic goes to `src/core/`** (pure functions, no DOM) and gets a test in `tests/`.
- **Untrusted data** (localStorage, imported files) must go through `sanitizeState()` in `src/state.js`; text put into HTML must go through `escapeHtml()`.
- **UI texts** live in `src/locales/`, always in every language (a test checks this). Use logical CSS properties (`inset-inline-start`, `margin-inline-end`, `text-align: start`) so the right-to-left layout keeps working.
- **Colours** come from `src/styles/tokens.css`; keep text contrast at WCAG AA (4.5:1).
- **New or renamed files in `src/`**: update `PRECACHE` in `sw.js`.
- **User-visible changes**: add a line to `CHANGELOG.md` under *Unreleased*.
- Code and comments in English; comments explain *why*.

## Branches and pull requests

1. Branch from `main`: `feature/…`, `fix/…`, `refactor/…` or `chore/…`.
2. Make focused commits with clear messages (imperative mood: "Add …", "Fix …").
3. Open a pull request describing what changed, why, and how you tested it.
4. A PR is merged once CI is green and it has been reviewed.

## Reporting bugs and ideas

Open an issue with steps to reproduce, what you expected and what happened, plus the browser and device. For security problems, follow [SECURITY.md](SECURITY.md) instead.

By contributing you agree that your contribution is licensed under the [MIT License](LICENSE).
